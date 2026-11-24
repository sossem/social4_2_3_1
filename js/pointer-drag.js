/*
 * pointer-drag.js — 태블릿에서 동작하는 끌어다 놓기
 *
 * 세 가지 방법을 모두 지원한다.
 *   1) 끌어다 놓기 (손가락, 마우스, 펜)
 *   2) 카드를 누르고 → 놓을 자리를 누르기
 *   3) 키보드: 카드에서 Enter/Space → 자리에서 Enter/Space
 *
 * 사용법 (일반 <script>로 불러온다. type="module" 아님):
 *
 *   <script src="js/pointer-drag.js"></script>
 *
 *   const drag = PointerDrag.attach({
 *     root: document.querySelector('#sticker-board'), // 카드와 자리를 모두 감싼 요소
 *     itemSelector: '.sticker',                        // 끌 수 있는 카드
 *     zoneSelector: '.slot',                           // 놓는 자리
 *     onDrop(item, zone) {                             // 자리에 놓였을 때
 *       zone.appendChild(item);
 *     },
 *     canDrop(item, zone) { return !zone.querySelector('.sticker'); } // 선택
 *   });
 *   // 화면을 떠날 때: drag.destroy();
 *
 * 카드와 자리는 root 안에서 나중에 다시 그려도 된다(이벤트 위임).
 *
 * 필요한 CSS:
 *   .sticker { touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
 *   .sticker.is-picked  { outline: 4px solid #8b5cf6; }   고른 카드
 *   .sticker.is-dragging { opacity: .35; }               끄는 동안 원래 자리
 *   .pd-ghost { transform-origin: center; box-shadow: 0 10px 24px rgba(0,0,0,.25); }
 *   .slot.is-over { background: #f3e8ff; }               손가락 아래의 자리
 *   .slot.is-ready { outline: 3px dashed #8b5cf6; }      카드를 고른 동안 놓을 수 있는 자리
 */
(function () {
  'use strict';

  var MOVE_THRESHOLD = 8; // 이만큼 움직여야 드래그로 본다(그보다 적으면 누르기)

  function attach(opts) {
    var root = opts.root;
    var itemSel = opts.itemSelector;
    var zoneSel = opts.zoneSelector;
    var onDrop = opts.onDrop;
    var canDrop = opts.canDrop || function () { return true; };

    var picked = null;   // 누르기 방식으로 고른 카드
    var drag = null;     // 끄는 중인 상태

    function zones() { return Array.prototype.slice.call(root.querySelectorAll(zoneSel)); }

    function prepare() {
      root.querySelectorAll(itemSel).forEach(function (el) {
        if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
        el.setAttribute('role', 'button');
        if (!el.hasAttribute('aria-pressed')) el.setAttribute('aria-pressed', 'false');
      });
      root.querySelectorAll(zoneSel).forEach(function (el) {
        if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      });
    }

    function setPicked(item) {
      if (picked) { picked.classList.remove('is-picked'); picked.setAttribute('aria-pressed', 'false'); }
      picked = item;
      zones().forEach(function (z) {
        z.classList.toggle('is-ready', !!item && canDrop(item, z));
      });
      if (item) { item.classList.add('is-picked'); item.setAttribute('aria-pressed', 'true'); }
    }

    function drop(item, zone) {
      setPicked(null);
      if (zone && canDrop(item, zone)) onDrop(item, zone);
      prepare();
    }

    function zoneAt(x, y) {
      var el = document.elementFromPoint(x, y);
      var zone = el && el.closest(zoneSel);
      return zone && root.contains(zone) ? zone : null;
    }

    function setOver(zone) {
      if (drag.over === zone) return;
      if (drag.over) drag.over.classList.remove('is-over');
      drag.over = zone && canDrop(drag.item, zone) ? zone : null;
      if (drag.over) drag.over.classList.add('is-over');
    }

    function startGhost() {
      var r = drag.item.getBoundingClientRect();
      var g = drag.item.cloneNode(true);
      g.classList.remove('is-picked', 'is-dragging');
      g.classList.add('pd-ghost');
      g.removeAttribute('id');
      g.setAttribute('aria-hidden', 'true');
      g.style.cssText += ';position:fixed;left:0;top:0;margin:0;z-index:9999;pointer-events:none;' +
        'width:' + r.width + 'px;height:' + r.height + 'px;';
      document.body.appendChild(g);
      drag.ghost = g;
      drag.dx = drag.startX - r.left;
      drag.dy = drag.startY - r.top;
      drag.item.classList.add('is-dragging');
    }

    function moveGhost(x, y) {
      drag.ghost.style.transform = 'translate(' + (x - drag.dx) + 'px,' + (y - drag.dy) + 'px) scale(1.05)';
    }

    function endDrag() {
      if (!drag) return;
      if (drag.ghost) drag.ghost.remove();
      if (drag.over) drag.over.classList.remove('is-over');
      drag.item.classList.remove('is-dragging');
      drag = null;
    }

    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      var item = e.target.closest(itemSel);
      if (!item || !root.contains(item)) return;
      drag = { item: item, id: e.pointerId, startX: e.clientX, startY: e.clientY, moving: false, over: null };
      try { item.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
    }

    function onPointerMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moving) {
        if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < MOVE_THRESHOLD) return;
        drag.moving = true;
        setPicked(null);
        startGhost();
      }
      e.preventDefault();
      moveGhost(e.clientX, e.clientY);
      setOver(zoneAt(e.clientX, e.clientY));
    }

    function onPointerUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var item = drag.item;
      if (drag.moving) {
        var zone = drag.over;
        endDrag();
        if (zone) drop(item, zone);
      } else {
        endDrag();
        setPicked(picked === item ? null : item); // 누르기: 고르기/고르기 취소
      }
    }

    function onPointerCancel(e) {
      if (drag && e.pointerId === drag.id) endDrag();
    }

    // 누르기 방식: 카드를 고른 뒤 자리를 누르면 놓는다.
    function onClick(e) {
      if (!picked) return;
      if (e.target.closest(itemSel)) return;
      var zone = e.target.closest(zoneSel);
      if (zone && root.contains(zone)) drop(picked, zone);
    }

    function onKeyDown(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var item = e.target.closest(itemSel);
      var zone = e.target.closest(zoneSel);
      if (item && e.target === item) {
        e.preventDefault();
        setPicked(picked === item ? null : item);
      } else if (zone && picked && e.target === zone) {
        e.preventDefault();
        drop(picked, zone);
      }
    }

    function onEsc(e) { if (e.key === 'Escape') { setPicked(null); endDrag(); } }

    prepare();
    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerup', onPointerUp);
    root.addEventListener('pointercancel', onPointerCancel);
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', onEsc);

    return {
      /** 카드나 자리를 새로 그린 뒤 부르면 키보드 접근 속성을 다시 붙인다. */
      refresh: prepare,
      /** 고른 카드를 취소한다. */
      clear: function () { setPicked(null); },
      destroy: function () {
        endDrag();
        setPicked(null);
        root.removeEventListener('pointerdown', onPointerDown);
        root.removeEventListener('pointermove', onPointerMove);
        root.removeEventListener('pointerup', onPointerUp);
        root.removeEventListener('pointercancel', onPointerCancel);
        root.removeEventListener('click', onClick);
        root.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keydown', onEsc);
      }
    };
  }

  window.PointerDrag = { attach: attach };
})();
