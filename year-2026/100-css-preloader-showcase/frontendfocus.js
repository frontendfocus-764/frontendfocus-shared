(function() {
  const grid = document.getElementById("preloaderGrid");
  const total = 100;

  const dotClasses = new Set([
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    31,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    98,
    99,
    100
  ]);

  const singleElement = new Set([
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    71,
    72,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90
  ]);

  const dotCounts = {
    11: 3,
    12: 3,
    13: 3,
    14: 5,
    15: 3,
    16: 4,
    17: 5,
    18: 3,
    19: 5,
    20: 3,
    31: 4,
    41: 5,
    42: 5,
    43: 4,
    44: 5,
    45: 4,
    46: 5,
    47: 3,
    48: 7,
    49: 5,
    50: 5,
    61: 4,
    62: 4,
    63: 5,
    64: 3,
    65: 5,
    66: 4,
    67: 5,
    68: 3,
    69: 5,
    70: 4,
    91: 4,
    92: 4,
    93: 5,
    94: 3,
    95: 5,
    96: 4,
    97: 5,
    98: 3,
    99: 5,
    100: 4
  };

  function createPreloader(index) {
    const className = `p${index}`;
    let inner = "";

    if (dotClasses.has(index)) {
      const count = dotCounts[index] || 3;
      let dots = "";
      for (let i = 0; i < count; i++) {
        dots += "<span></span>";
      }
      inner = dots;
    } else if (singleElement.has(index)) {
      inner = "";
    } else {
      inner = "";
    }

    return `<div class="card">
          <div class="preloader-wrapper">
            <div class="${className}">${inner}</div>
          </div>
          <span class="label">${className}</span>
        </div>`;
  }

  let html = "";
  for (let i = 1; i <= total; i++) {
    html += createPreloader(i);
  }
  grid.innerHTML = html;
})();
