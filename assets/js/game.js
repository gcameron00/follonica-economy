/* game.js — "Mayor of the Gulf"
   A ten-season balancing game about Follonica's economy.
   Each season the player invests a fixed pool of points across four levers.
   Environment, Community and Prosperity respond; a random event nudges things;
   revenue flows into the treasury. Balance beats greed.
   Pure vanilla JS, no dependencies.
*/
(function () {
  "use strict";

  var BUDGET = 6;          // investment points per season
  var SEASONS = 10;
  var LEVERS = [
    { key: "tour",  emoji: "🏖️", name: "Tourism",   hint: "Beaches, hotels, events — fast money, heavy footprint." },
    { key: "herit", emoji: "🏛️", name: "Heritage",  hint: "MAGMA, the cast-iron story — steady appeal, happy residents." },
    { key: "nat",   emoji: "🌲", name: "Nature",    hint: "Pineta & coast care — rebuilds the environment." },
    { key: "off",   emoji: "📅", name: "Off-season", hint: "Spring & autumn draws — smooths the year, calms crowds." }
  ];

  // --- Deterministic-ish RNG so a session feels fair but varied -----------
  var seed = 1;
  function seedFrom(n) { seed = (n % 2147483647); if (seed <= 0) seed += 2147483646; }
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

  // --- Event pool ---------------------------------------------------------
  // effect(state, alloc) -> {rev: multiplier add, env, com, econ, cash, text}
  var EVENTS = [
    { text: "☀️ A glorious, settled summer. Visitors linger and spend.", cond: function(){return true;}, eff: function(){ return { revMul: 0.15, econ: 2 }; } },
    { text: "🌧️ A washout August. Beach takings disappoint.", cond: function(){return true;}, eff: function(){ return { revMul: -0.18, econ: -1 }; } },
    { text: "🔥 Heatwave. With a tired environment, the coast suffers.", cond: function(s){return s.env < 52;}, eff: function(){ return { revMul: -0.15, env: -5, com: -3 }; } },
    { text: "🌊 Winter storms erode the beach. Sand must be replaced.", cond: function(){return true;}, eff: function(){ return { env: -8, cash: -1.5 }; } },
    { text: "🎉 The MAGMA festival is a hit — press and full restaurants.", cond: function(s,a){return a.herit >= 1;}, eff: function(){ return { revMul: 0.12, com: 5 }; } },
    { text: "🚱 Drought strains water supply; heavy tourism makes it worse.", cond: function(s,a){return a.tour >= 3 && s.env < 60;}, eff: function(){ return { com: -6, env: -3 }; } },
    { text: "💻 Remote workers settle in for the winter, filling quiet cafés.", cond: function(s,a){return a.off >= 1;}, eff: function(){ return { cash: 2, com: 4, econ: 1 }; } },
    { text: "🚢 A wave of day-trippers: quick cash, tired streets.", cond: function(s,a){return a.tour >= 2;}, eff: function(){ return { revMul: 0.14, env: -5, com: -4 }; } },
    { text: "🍷 A stellar Maremma vintage boosts food-and-wine tourism.", cond: function(s,a){return a.herit >= 1 || a.off >= 1;}, eff: function(){ return { revMul: 0.10, econ: 1, com: 2 }; } },
    { text: "🌲 Volunteers restore the pinewood trails — a community lift.", cond: function(s,a){return a.nat >= 1;}, eff: function(){ return { env: 5, com: 4 }; } },
    { text: "🏗️ Resident backlash over crowding and rising rents.", cond: function(s,a){return a.tour >= 4;}, eff: function(){ return { com: -8, econ: -1 }; } },
    { text: "🤝 A calm, balanced season. Nothing dramatic — and that's fine.", cond: function(){return true;}, eff: function(){ return {}; } }
  ];

  // --- State --------------------------------------------------------------
  var state, history, gameEnded;

  function fresh() {
    state = { season: 1, env: 64, com: 60, econ: 50, treasury: 0 };
    history = [];
    gameEnded = false;
    // Seed the RNG so each game varies. Prefer a clock; fall back to perf timer.
    var t = (typeof Date !== "undefined" && Date.now) ? Date.now()
          : (window.performance && performance.now ? Math.floor(performance.now()) : 12345);
    seedFrom(1000 + (t % 99991));
  }

  var alloc = { tour: 0, herit: 0, nat: 0, off: 0 };
  function resetAlloc() { alloc = { tour: 0, herit: 0, nat: 0, off: 0 }; }
  function spent() { return alloc.tour + alloc.herit + alloc.nat + alloc.off; }
  function remaining() { return BUDGET - spent(); }
  function clamp(v) { return Math.max(0, Math.min(100, v)); }

  // --- DOM refs -----------------------------------------------------------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var elSeason, elRemain, elLevers, elBars, elTreasury, elLog, elAdvance, elReset, elResult;

  function money(v) { return "€" + v.toFixed(1) + "m"; }

  function renderBars() {
    var defs = [
      { key: "env",  name: "Environment", color: "--c4", v: state.env },
      { key: "com",  name: "Community",   color: "--c1", v: state.com },
      { key: "econ", name: "Prosperity",  color: "--c3", v: state.econ }
    ];
    elBars.innerHTML = defs.map(function (d) {
      return '<div class="g-bar"><div class="g-bar-top"><span>' + d.name + '</span><b>' + Math.round(d.v) + '</b></div>' +
             '<div class="g-track"><div class="g-fill" style="width:' + clamp(d.v) + '%;background:var(' + d.color + ')"></div></div></div>';
    }).join("");
    elTreasury.textContent = money(state.treasury);
    elSeason.textContent = Math.min(state.season, SEASONS) + " / " + SEASONS;
  }

  function renderLevers() {
    elRemain.textContent = remaining();
    elRemain.className = remaining() === 0 ? "g-remain done" : "g-remain";
    LEVERS.forEach(function (lv) {
      var wrap = $('[data-lever="' + lv.key + '"]');
      $(".g-count", wrap).textContent = alloc[lv.key];
      var minus = $(".g-minus", wrap), plus = $(".g-plus", wrap);
      minus.disabled = alloc[lv.key] === 0 || gameEnded;
      plus.disabled = remaining() === 0 || gameEnded;
      // pips
      var pips = "";
      for (var i = 0; i < BUDGET; i++) pips += '<i class="' + (i < alloc[lv.key] ? "on" : "") + '"></i>';
      $(".g-pips", wrap).innerHTML = pips;
    });
    elAdvance.disabled = spent() === 0 || gameEnded;
  }

  function log(html, cls) {
    var p = document.createElement("div");
    p.className = "g-entry " + (cls || "");
    p.innerHTML = html;
    elLog.insertBefore(p, elLog.firstChild);
  }

  function advance() {
    if (gameEnded || spent() === 0) return;
    var a = { tour: alloc.tour, herit: alloc.herit, nat: alloc.nat, off: alloc.off };

    // Base economic response to allocation
    var envHealth = state.env / 70;                 // tired coast earns less
    var buzz = state.econ / 55;
    var baseRev = (a.tour * 1.25 + a.herit * 0.65 + a.nat * 0.30 + a.off * 0.85);
    var revenue = baseRev * (0.6 + 0.4 * envHealth) * (0.7 + 0.35 * buzz);

    var dEnv  = a.nat * 3.2 + a.off * 0.8 - a.tour * 2.4 - 1.2;
    var dCom  = a.herit * 1.6 + a.off * 1.7 + a.nat * 0.6 - a.tour * 1.1 - (a.tour >= 4 ? 3 : 0);
    var dEcon = a.tour * 2.0 + a.off * 1.5 + a.herit * 1.0 + a.nat * 0.4 - 1.4;

    // Pick a valid event
    var valid = EVENTS.filter(function (e) { return e.cond(state, a); });
    var ev = pick(valid.length ? valid : [EVENTS[EVENTS.length - 1]]);
    var e = ev.eff(state, a) || {};
    var revMul = 1 + (e.revMul || 0);
    revenue *= revMul;
    dEnv += (e.env || 0); dCom += (e.com || 0); dEcon += (e.econ || 0);
    var cash = (e.cash || 0);

    // Apply
    state.env  = clamp(state.env + dEnv);
    state.com  = clamp(state.com + dCom);
    state.econ = clamp(state.econ + dEcon);
    var seasonMoney = revenue + cash;
    state.treasury += seasonMoney;

    history.push({ season: state.season, alloc: a, money: seasonMoney });

    var pieces = LEVERS.filter(function (l) { return a[l.key] > 0; })
      .map(function (l) { return l.emoji + a[l.key]; }).join(" ");
    log('<div class="g-entry-head"><b>Season ' + state.season + '</b>' +
        '<span class="g-money ' + (seasonMoney >= 0 ? "pos" : "neg") + '">' +
        (seasonMoney >= 0 ? "+" : "") + money(seasonMoney) + '</span></div>' +
        '<div class="g-entry-alloc">' + pieces + '</div>' +
        '<div class="g-entry-ev">' + ev.text + '</div>');

    state.season++;
    resetAlloc();
    renderBars();
    renderLevers();

    if (state.season > SEASONS) endGame();
  }

  function rating(score) {
    if (score >= 82) return { t: "Legendary Mayor", d: "A prosperous, beloved, well-kept Gulf. Follonica thrives for a generation.", c: "--c4" };
    if (score >= 68) return { t: "Strong Steward", d: "A healthy balance of money, nature and community. Well played.", c: "--c1" };
    if (score >= 52) return { t: "Muddling Through", d: "The town gets by, but strains are showing. Room to do better.", c: "--c3" };
    if (score >= 36) return { t: "Rocky Tenure", d: "Short-term wins, long-term costs. The Gulf is tired.", c: "--c2" };
    return { t: "One-Term Wonder", d: "The coast is worn and the town unhappy. Time for a rethink.", c: "--c2" };
  }

  function endGame() {
    gameEnded = true;
    // Score: environment & community matter as much as money.
    var treasuryScore = Math.min(100, state.treasury / 0.9); // ~90m -> 100
    var score = Math.round(treasuryScore * 0.34 + state.env * 0.22 + state.com * 0.22 + state.econ * 0.22);
    var r = rating(score);
    elResult.innerHTML =
      '<div class="g-result-card" style="border-color:var(' + r.c + ')">' +
        '<span class="eyebrow" style="color:var(' + r.c + ')">Final result · ' + score + '/100</span>' +
        '<h3>' + r.t + '</h3>' +
        '<p>' + r.d + '</p>' +
        '<div class="g-final-grid">' +
          '<div><b>' + money(state.treasury) + '</b><span>Treasury</span></div>' +
          '<div><b>' + Math.round(state.env) + '</b><span>Environment</span></div>' +
          '<div><b>' + Math.round(state.com) + '</b><span>Community</span></div>' +
          '<div><b>' + Math.round(state.econ) + '</b><span>Prosperity</span></div>' +
        '</div>' +
        '<button class="btn btn-primary g-again" type="button">Play again ↻</button>' +
      '</div>';
    elResult.hidden = false;
    $(".g-again", elResult).addEventListener("click", start);
    elResult.scrollIntoView({ behavior: "smooth", block: "center" });
    renderLevers();
  }

  function start() {
    fresh();
    resetAlloc();
    elResult.hidden = true;
    elResult.innerHTML = "";
    elLog.innerHTML = '<div class="g-entry g-intro">Season log will appear here. Invest your ' + BUDGET + ' points, then advance.</div>';
    renderBars();
    renderLevers();
  }

  // --- Build UI -----------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    var mount = $("#game");
    if (!mount) return;

    mount.innerHTML =
      '<div class="g-hud">' +
        '<div class="g-hud-item"><span>Season</span><b id="g-season">1 / ' + SEASONS + '</b></div>' +
        '<div class="g-hud-item"><span>Treasury</span><b id="g-treasury">€0.0m</b></div>' +
        '<div class="g-hud-item g-hud-remain"><span>Points to invest</span><b class="g-remain" id="g-remain">' + BUDGET + '</b></div>' +
      '</div>' +
      '<div id="g-bars" class="g-bars"></div>' +
      '<div class="g-levers" id="g-levers">' +
        LEVERS.map(function (lv) {
          return '<div class="g-lever" data-lever="' + lv.key + '">' +
            '<div class="g-lever-head"><span class="g-emoji">' + lv.emoji + '</span>' +
              '<div><h4>' + lv.name + '</h4><p>' + lv.hint + '</p></div></div>' +
            '<div class="g-pips" aria-hidden="true"></div>' +
            '<div class="g-stepper">' +
              '<button class="g-minus" type="button" aria-label="Less ' + lv.name + '">−</button>' +
              '<span class="g-count">0</span>' +
              '<button class="g-plus" type="button" aria-label="More ' + lv.name + '">+</button>' +
            '</div>' +
          '</div>';
        }).join("") +
      '</div>' +
      '<div class="g-actions">' +
        '<button class="btn btn-primary" id="g-advance" type="button">Advance the season →</button>' +
        '<button class="btn btn-ghost" id="g-reset" type="button">Reset</button>' +
      '</div>' +
      '<div class="g-result" id="g-result" hidden></div>' +
      '<h3 class="g-log-title">Season log</h3>' +
      '<div class="g-log" id="g-log"></div>';

    elSeason = $("#g-season"); elRemain = $("#g-remain"); elBars = $("#g-bars");
    elTreasury = $("#g-treasury"); elLog = $("#g-log"); elResult = $("#g-result");
    elAdvance = $("#g-advance"); elReset = $("#g-reset");

    // Lever button wiring
    LEVERS.forEach(function (lv) {
      var wrap = $('[data-lever="' + lv.key + '"]');
      $(".g-plus", wrap).addEventListener("click", function () {
        if (remaining() > 0 && !gameEnded) { alloc[lv.key]++; renderLevers(); }
      });
      $(".g-minus", wrap).addEventListener("click", function () {
        if (alloc[lv.key] > 0 && !gameEnded) { alloc[lv.key]--; renderLevers(); }
      });
    });
    elAdvance.addEventListener("click", advance);
    elReset.addEventListener("click", start);

    start();
  });
})();
