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

  window.Art = {
    pond: function (kind) { return kind === 'forest' ? forestPond() : parkPond(); },
    explorer: explorer,
    tree: tree,
    building: building
  };
})();
