/* 앱에서 쓰는 그림(SVG). 교과서 그림을 옮기지 않고 새로 그렸다. */
(function () {
  'use strict';

  function tree(x, y, s, color) {
    s = s || 1;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<rect x="-4" y="0" width="8" height="18" fill="#8d5a2b"/>' +
      '<circle cx="0" cy="-8" r="16" fill="' + (color || '#3f9b4f') + '"/>' +
      '<circle cx="-9" cy="0" r="11" fill="' + (color || '#3f9b4f') + '"/>' +
      '<circle cx="9" cy="0" r="11" fill="' + (color || '#3f9b4f') + '"/></g>';
  }

  function forestPond() {
    var trees = '';
    [[40, 150, 1.1], [80, 170, .9], [330, 160, 1], [365, 140, 1.2], [300, 190, .8], [60, 215, .8]].forEach(function (t) {
      trees += tree(t[0], t[1], t[2], t[2] > 1 ? '#2f8a43' : '#47a957');
    });
    return '<svg viewBox="0 0 400 260" role="img" aria-label="뒷산 숲속 연못 그림">' +
      '<rect width="400" height="260" fill="#dff1fb"/>' +
      '<path d="M0 150 L90 50 L160 120 L230 30 L330 120 L400 70 L400 260 L0 260 Z" fill="#6fae72"/>' +
      '<path d="M0 180 L120 120 L240 160 L400 120 L400 260 L0 260 Z" fill="#8cc68a"/>' +
      // 산에서 흘러내리는 물줄기
      '<path d="M232 40 C 225 80, 250 100, 220 135 S 205 170, 210 185" fill="none" stroke="#6cc0ea" stroke-width="9" stroke-linecap="round"/>' +
      // 모양이 고르지 않은 자연 연못
      '<path d="M120 200 C 120 170, 175 168, 210 178 C 260 168, 300 190, 288 215 C 278 240, 200 246, 160 238 C 118 232, 112 222, 120 200 Z" fill="#4aa8d8"/>' +
      '<path d="M150 205 q 15 -6 30 0 M215 215 q 15 -6 30 0" stroke="#bfe6fa" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="128" cy="226" rx="14" ry="6" fill="#9b8b73"/><ellipse cx="282" cy="198" rx="12" ry="5" fill="#9b8b73"/>' +
      trees +
      '</svg>';
  }

  function building(x, w, h, color) {
    var win = '';
    for (var r = 0; r < Math.floor((h - 16) / 18); r++) {
      for (var c = 0; c < Math.floor((w - 8) / 14); c++) {
        win += '<rect x="' + (x + 6 + c * 14) + '" y="' + (190 - h + 10 + r * 18) + '" width="8" height="10" fill="#fff6c9"/>';
      }
    }
    return '<rect x="' + x + '" y="' + (190 - h) + '" width="' + w + '" height="' + h + '" fill="' + color + '"/>' + win;
  }

  function parkPond() {
    return '<svg viewBox="0 0 400 260" role="img" aria-label="아파트 단지 공원 연못 그림">' +
      '<rect width="400" height="260" fill="#e8f0ff"/>' +
      building(10, 70, 150, '#b9c2d9') + building(90, 60, 120, '#d6c3b0') + building(260, 64, 140, '#c9b6d6') + building(330, 62, 110, '#b7cfd0') +
      '<rect x="0" y="180" width="400" height="80" fill="#9fd08f"/>' +
      '<rect x="0" y="246" width="400" height="14" fill="#c9c2b3"/>' +
      // 돌로 둘레를 반듯하게 만든 둥근 연못과 분수
      '<ellipse cx="200" cy="212" rx="120" ry="34" fill="#b9b1a3"/>' +
      '<ellipse cx="200" cy="210" rx="106" ry="27" fill="#4aa8d8"/>' +
      '<g class="fountain" stroke="#9fdcfb" stroke-width="5" fill="none" stroke-linecap="round">' +
      '<path d="M200 205 L200 140"/><path d="M200 150 C 185 150, 175 170, 170 195"/><path d="M200 150 C 215 150, 225 170, 230 195"/></g>' +
      '<circle cx="200" cy="138" r="7" fill="#d6f1ff"/>' +
      '<rect x="60" y="228" width="34" height="6" rx="2" fill="#8d5a2b"/><rect x="306" y="228" width="34" height="6" rx="2" fill="#8d5a2b"/>' +
      tree(40, 200, .7, '#47a957') + tree(360, 200, .7, '#47a957') +
      '</svg>';
  }

  function explorer() {
    return '<svg viewBox="0 0 120 140" role="img" aria-label="탐험대원">' +
      '<ellipse cx="60" cy="132" rx="34" ry="6" fill="rgba(0,0,0,.12)"/>' +
      '<rect x="36" y="78" width="48" height="50" rx="16" fill="#f59f00"/>' +
      '<circle cx="60" cy="52" r="30" fill="#ffd8b5"/>' +
      '<path d="M26 44 Q60 0 94 44 Z" fill="#6b8e23"/><rect x="22" y="40" width="76" height="8" rx="4" fill="#556b2f"/>' +
      '<circle cx="49" cy="56" r="4" fill="#333"/><circle cx="71" cy="56" r="4" fill="#333"/>' +
      '<path d="M50 68 Q60 76 70 68" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="96" cy="92" r="12" fill="none" stroke="#5c4a2e" stroke-width="5"/><circle cx="96" cy="92" r="8" fill="#d6f1ff"/>' +
      '<path d="M86 102 L78 112" stroke="#5c4a2e" stroke-width="6" stroke-linecap="round"/>' +
      '</svg>';
  }


  // ---------- 마을 그림 지도 (가로 1000, 세로 640) ----------
  function townScene() {
    var g = '';
    // 하늘과 땅
    g += '<rect width="1000" height="640" fill="#dff1fb"/>';
    g += '<path d="M0 150 Q 250 120 500 145 T 1000 135 L1000 640 L0 640 Z" fill="#a9d98f"/>';
    // 산
    g += '<path d="M240 165 L360 60 L430 110 L500 25 L600 105 L660 70 L760 165 Z" fill="#5f9e63"/>';
    // 비구름과 빗줄기
    g += '<g fill="#9aa9b8"><ellipse cx="760" cy="40" rx="55" ry="26"/><ellipse cx="815" cy="34" rx="45" ry="28"/><ellipse cx="860" cy="46" rx="40" ry="22"/></g>';
    var rain = '';
    for (var i = 0; i < 9; i++) rain += '<path d="M' + (730 + i * 17) + ' 76 l -8 26" />';
    g += '<g stroke="#5aa9e6" stroke-width="4" stroke-linecap="round">' + rain + '</g>';
    // 바람: 휘어진 나무와 바람결
    g += '<g transform="translate(40 150)">' +
      '<path d="M20 50 Q 22 25 35 5" stroke="#8d5a2b" stroke-width="7" fill="none"/>' +
      '<ellipse cx="45" cy="0" rx="26" ry="18" fill="#47a957" transform="rotate(25 45 0)"/>' +
      '<path d="M100 55 Q 102 30 115 12" stroke="#8d5a2b" stroke-width="7" fill="none"/>' +
      '<ellipse cx="124" cy="6" rx="24" ry="16" fill="#3f9b4f" transform="rotate(25 124 6)"/></g>';
    g += '<g stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".95">' +
      '<path d="M20 90 q 40 -18 80 0 t 70 -6"/><path d="M40 112 q 30 -12 60 0 t 60 -4"/><path d="M10 70 q 25 -10 55 0"/></g>';
    // 과수원: 줄 맞춘 과일나무
    var orchard = '';
    for (var r = 0; r < 2; r++) for (var c = 0; c < 4; c++) {
      var ox = 205 + c * 32, oy = 215 + r * 30;
      orchard += '<rect x="' + (ox - 2) + '" y="' + oy + '" width="4" height="10" fill="#8d5a2b"/>' +
        '<circle cx="' + ox + '" cy="' + (oy - 4) + '" r="12" fill="#4caf50"/>' +
        '<circle cx="' + (ox - 4) + '" cy="' + (oy - 6) + '" r="3" fill="#e03131"/><circle cx="' + (ox + 5) + '" cy="' + (oy - 2) + '" r="3" fill="#e03131"/>';
    }
    g += '<rect x="185" y="196" width="140" height="70" rx="10" fill="#c3e6a8"/>' + orchard;
    // 들: 꽃이 핀 넓은 풀밭
    g += '<path d="M335 300 Q 390 285 450 300 L455 345 Q 390 355 330 345 Z" fill="#b9e3a0"/>';
    g += '<g fill="#ffd43b"><circle cx="350" cy="320" r="5"/><circle cx="380" cy="333" r="5"/><circle cx="420" cy="318" r="5"/><circle cx="440" cy="335" r="5"/></g>';
    g += '<g fill="#ff8fab"><circle cx="365" cy="338" r="4"/><circle cx="402" cy="325" r="4"/></g>';
    // 논: 물이 찬 네모 논
    var paddy = '';
    for (var pr = 0; pr < 2; pr++) for (var pc = 0; pc < 3; pc++) {
      paddy += '<rect x="' + (30 + pc * 58) + '" y="' + (315 + pr * 40) + '" width="52" height="34" rx="3" fill="#bfe3c9" stroke="#e9d9a6" stroke-width="5"/>';
      for (var k = 0; k < 4; k++) paddy += '<path d="M' + (38 + pc * 58 + k * 11) + ' ' + (343 + pr * 40) + ' l 0 -12" stroke="#4caf50" stroke-width="3"/>';
    }
    g += paddy;
    // 밭: 고랑
    var furrow = '';
    for (var f = 0; f < 6; f++) furrow += '<path d="M' + (195 + f * 22) + ' 400 l 0 70" stroke="#7b5b33" stroke-width="7" stroke-linecap="round"/>' +
      '<circle cx="' + (195 + f * 22) + '" cy="415" r="6" fill="#69b34c"/><circle cx="' + (195 + f * 22) + '" cy="445" r="6" fill="#69b34c"/>';
    g += '<rect x="180" y="395" width="145" height="82" rx="8" fill="#c99a63"/>' + furrow;
    // 비닐하우스
    g += '<g>' + [40, 95, 150].map(function (x) {
      return '<path d="M' + x + ' 520 L' + x + ' 488 Q ' + (x + 23) + ' 462 ' + (x + 46) + ' 488 L' + (x + 46) + ' 520 Z" fill="#f4f8fb" stroke="#b5c4cf" stroke-width="3"/>' +
        '<path d="M' + (x + 12) + ' 518 L' + (x + 12) + ' 480 M' + (x + 23) + ' 518 L' + (x + 23) + ' 475 M' + (x + 34) + ' 518 L' + (x + 34) + ' 480" stroke="#cfdbe3" stroke-width="2"/>';
    }).join('') + '</g>';
    // 아파트
    g += '<g transform="translate(0 100)">' + building(470, 52, 140, '#b9c2d9') + building(530, 60, 110, '#d6c3b0') + building(598, 56, 150, '#c9b6d6') + '</g>';
    // 도로 (가로, 세로)
    g += '<path d="M330 410 L 1000 410" stroke="#8a8f98" stroke-width="34"/>';
    g += '<path d="M330 410 L 1000 410" stroke="#ffffff" stroke-width="3" stroke-dasharray="18 14"/>';
    g += '<path d="M680 410 L 680 520" stroke="#8a8f98" stroke-width="28"/>';
    // 하천과 다리
    g += '<path d="M905 120 C 860 200, 920 280, 875 360 S 900 470, 880 540" fill="none" stroke="#5bb4e5" stroke-width="44" stroke-linecap="round"/>';
    g += '<path d="M905 120 C 860 200, 920 280, 875 360 S 900 470, 880 540" fill="none" stroke="#8fd0f1" stroke-width="10" stroke-linecap="round" stroke-dasharray="14 22"/>';
    g += '<rect x="835" y="393" width="90" height="34" rx="6" fill="#c8a26b" stroke="#8d5a2b" stroke-width="4"/>';
    g += '<path d="M840 393 L840 380 M860 393 L860 380 M880 393 L880 380 M900 393 L900 380 M920 393 L920 380 M838 380 L922 380" stroke="#8d5a2b" stroke-width="4"/>';
    // 바다
    g += '<path d="M0 520 Q 250 505 500 522 T 1000 515 L1000 640 L0 640 Z" fill="#3d8fd1"/>';
    g += '<g stroke="#bfe0f7" stroke-width="3" fill="none" stroke-linecap="round"><path d="M60 575 q 15 -8 30 0 t 30 0"/><path d="M420 610 q 15 -8 30 0 t 30 0"/><path d="M880 600 q 15 -8 30 0 t 30 0"/></g>';
    // 항구: 부두와 배
    g += '<path d="M640 520 L 650 590 L 760 590 L 760 575 L 665 575 L 660 520 Z" fill="#b0a89a"/>';
    g += '<g transform="translate(770 560)"><path d="M0 0 L60 0 L50 18 L8 18 Z" fill="#e8590c"/><rect x="22" y="-18" width="18" height="18" fill="#ffffff"/></g>';
    g += '<g transform="translate(580 590)"><path d="M0 0 L50 0 L42 14 L6 14 Z" fill="#1c7ed6"/><path d="M24 0 L24 -26 L40 -4 Z" fill="#ffffff"/></g>';
    return g;
  }

  function labelWidth(name) { return 72 + name.length * 30; }

  function townMap(places) {
    var labels = places.map(function (p) {
      var w = labelWidth(p.name), x = p.x - w / 2, y = p.y - 26;
      return '<g class="place" data-testid="place-' + p.id + '" data-id="' + p.id + '" role="button" tabindex="0" aria-label="' + p.name + '">' +
        '<rect class="place-hit" x="' + (x - 6) + '" y="' + (p.y - 38) + '" width="' + (w + 12) + '" height="76" fill="transparent"/>' +
        '<rect class="place-pill" x="' + x + '" y="' + y + '" width="' + w + '" height="52" rx="26"/>' +
        '<text class="place-name" x="' + (x + (w - 44) / 2 + 4) + '" y="' + (p.y + 9) + '" text-anchor="middle">' + p.name + '</text>' +
        '<circle class="place-dot" cx="' + (x + w - 24) + '" cy="' + p.y + '" r="16"/>' +
        '<text class="place-mark" data-mark="' + p.id + '" x="' + (x + w - 24) + '" y="' + (p.y + 9) + '" text-anchor="middle"></text>' +
        '</g>';
    }).join('');
    return '<svg viewBox="0 0 1000 640" role="group" aria-label="우리 마을 그림 지도">' + townScene() + labels + '</svg>';
  }

  window.Art = {
    pond: function (kind) { return kind === 'forest' ? forestPond() : parkPond(); },
    explorer: explorer,
    townMap: townMap,
    tree: tree,
    building: building
  };
})();
