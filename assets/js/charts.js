/* charts.js — tiny dependency-free SVG charts.
   Charts are declared in markup as <div class="chart" data-chart="bar" ...>
   with a JSON payload in data-values. They re-render on theme change so the
   palette always matches light/dark. Colours come from CSS custom properties.
*/
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function palette() {
    return [cssVar("--c1"), cssVar("--c2"), cssVar("--c3"), cssVar("--c4"), cssVar("--c5")];
  }
  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function fmt(n) {
    if (Math.abs(n) >= 1000) return (n / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "k";
    return n.toLocaleString();
  }

  /* ---- Vertical / horizontal bar ------------------------------------- */
  function barChart(node, data, opts) {
    opts = opts || {};
    var horizontal = opts.horizontal;
    var W = 600, H = opts.height || 320;
    var pad = { t: 16, r: 22, b: 34, l: horizontal ? 152 : 34 };
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": opts.label || "bar chart" });
    var max = Math.max.apply(null, data.map(function (d) { return d.value; })) * 1.12;
    var cols = palette();
    var plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;

    // gridlines
    var ticks = 4;
    for (var i = 0; i <= ticks; i++) {
      var t = i / ticks;
      if (horizontal) {
        var x = pad.l + t * plotW;
        svg.appendChild(el("line", { class: "grid-line", x1: x, y1: pad.t, x2: x, y2: pad.t + plotH }));
      } else {
        var y = pad.t + plotH - t * plotH;
        svg.appendChild(el("line", { class: "grid-line", x1: pad.l, y1: y, x2: pad.l + plotW, y2: y }));
      }
    }

    data.forEach(function (d, idx) {
      var color = d.color ? cssVar(d.color) || d.color : cols[idx % cols.length];
      if (horizontal) {
        var band = plotH / data.length, bh = Math.min(30, band * 0.62);
        var yy = pad.t + idx * band + (band - bh) / 2;
        var w = (d.value / max) * plotW;
        svg.appendChild(el("rect", { class: "bar", x: pad.l, y: yy, width: Math.max(1, w), height: bh, rx: 5, fill: color }));
        var ax = el("text", { class: "axis", x: pad.l - 10, y: yy + bh / 2 + 4, "text-anchor": "end" }, d.label);
        ax.setAttribute("class", "axis"); svg.appendChild(wrapAxis(ax));
        svg.appendChild(el("text", { class: "val", x: pad.l + w + 6, y: yy + bh / 2 + 4 }, opts.fmt ? opts.fmt(d.value) : fmt(d.value)));
      } else {
        var band2 = plotW / data.length, bw = Math.min(56, band2 * 0.6);
        var xx = pad.l + idx * band2 + (band2 - bw) / 2;
        var h = (d.value / max) * plotH;
        svg.appendChild(el("rect", { class: "bar", x: xx, y: pad.t + plotH - h, width: bw, height: Math.max(1, h), rx: 6, fill: color }));
        svg.appendChild(el("text", { class: "val", x: xx + bw / 2, y: pad.t + plotH - h - 7, "text-anchor": "middle" }, opts.fmt ? opts.fmt(d.value) : fmt(d.value)));
        svg.appendChild(el("text", { class: "axis", x: xx + bw / 2, y: pad.t + plotH + 20, "text-anchor": "middle" }, d.label));
      }
    });
    node.appendChild(svg);
  }
  function wrapAxis(node) { return node; }

  /* ---- Donut ---------------------------------------------------------- */
  function donutChart(node, data, opts) {
    opts = opts || {};
    var size = 260, cx = size / 2, cy = size / 2, r = 100, rin = 62;
    var svg = el("svg", { viewBox: "0 0 " + size + " " + size, role: "img", "aria-label": opts.label || "donut chart" });
    var total = data.reduce(function (s, d) { return s + d.value; }, 0);
    var cols = palette();
    var a0 = -Math.PI / 2;
    data.forEach(function (d, i) {
      var frac = d.value / total, a1 = a0 + frac * Math.PI * 2;
      var large = frac > 0.5 ? 1 : 0;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var xi0 = cx + rin * Math.cos(a1), yi0 = cy + rin * Math.sin(a1);
      var xi1 = cx + rin * Math.cos(a0), yi1 = cy + rin * Math.sin(a0);
      var path = ["M", x0, y0, "A", r, r, 0, large, 1, x1, y1,
                  "L", xi0, yi0, "A", rin, rin, 0, large, 0, xi1, yi1, "Z"].join(" ");
      var color = d.color ? cssVar(d.color) || d.color : cols[i % cols.length];
      svg.appendChild(el("path", { d: path, fill: color }));
      a0 = a1;
    });
    svg.appendChild(el("text", { x: cx, y: cy - 4, "text-anchor": "middle", class: "val", "font-size": "26", "font-family": "var(--font-display)" }, opts.centerTop || ""));
    svg.appendChild(el("text", { x: cx, y: cy + 16, "text-anchor": "middle", class: "axis" }, opts.centerBottom || ""));
    node.appendChild(svg);
  }

  /* ---- Line / area ---------------------------------------------------- */
  function lineChart(node, series, opts) {
    opts = opts || {};
    var W = 640, H = opts.height || 300;
    var pad = { t: 18, r: 18, b: 34, l: 42 };
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": opts.label || "line chart" });
    var plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
    var xs = series[0].points.map(function (p) { return p.x; });
    var allY = series.reduce(function (a, s) { return a.concat(s.points.map(function (p) { return p.y; })); }, []);
    var maxY = Math.max.apply(null, allY) * 1.1, minY = 0;
    var cols = palette();

    var ticks = 4;
    for (var i = 0; i <= ticks; i++) {
      var y = pad.t + plotH - (i / ticks) * plotH;
      svg.appendChild(el("line", { class: "grid-line", x1: pad.l, y1: y, x2: pad.l + plotW, y2: y }));
      svg.appendChild(el("text", { class: "axis", x: pad.l - 8, y: y + 4, "text-anchor": "end" }, fmt(Math.round((i / ticks) * maxY))));
    }
    xs.forEach(function (xv, xi) {
      if (xs.length > 8 && xi % 2 !== 0 && xi !== xs.length - 1) return;
      var x = pad.l + (xi / (xs.length - 1)) * plotW;
      svg.appendChild(el("text", { class: "axis", x: x, y: pad.t + plotH + 20, "text-anchor": "middle" }, xv));
    });

    function px(idx) { return pad.l + (idx / (xs.length - 1)) * plotW; }
    function py(v) { return pad.t + plotH - ((v - minY) / (maxY - minY)) * plotH; }

    series.forEach(function (s, si) {
      var color = s.color ? cssVar(s.color) || s.color : cols[si % cols.length];
      var d = s.points.map(function (p, i) { return (i ? "L" : "M") + px(i) + " " + py(p.y); }).join(" ");
      if (opts.area && series.length === 1) {
        var area = d + " L" + px(xs.length - 1) + " " + (pad.t + plotH) + " L" + px(0) + " " + (pad.t + plotH) + " Z";
        svg.appendChild(el("path", { d: area, fill: color, "fill-opacity": ".14", stroke: "none" }));
      }
      svg.appendChild(el("path", { d: d, fill: "none", stroke: color, "stroke-width": 2.6, "stroke-linejoin": "round", "stroke-linecap": "round" }));
      s.points.forEach(function (p, i) {
        svg.appendChild(el("circle", { cx: px(i), cy: py(p.y), r: 3.2, fill: color }));
      });
    });
    node.appendChild(svg);
  }

  /* ---- Dispatcher ----------------------------------------------------- */
  function render(node) {
    node.innerHTML = "";
    var type = node.getAttribute("data-chart");
    var data, opts = {};
    try { data = JSON.parse(node.getAttribute("data-values")); } catch (e) { return; }
    try { opts = JSON.parse(node.getAttribute("data-opts") || "{}"); } catch (e) {}
    if (type === "bar") barChart(node, data, opts);
    else if (type === "hbar") { opts.horizontal = true; barChart(node, data, opts); }
    else if (type === "donut") donutChart(node, data, opts);
    else if (type === "line") lineChart(node, data, opts);
    // Build legend if requested
    if (opts.legend) {
      var host = node.parentNode.querySelector(".legend[data-auto]");
      if (host) {
        host.innerHTML = "";
        var cols = palette();
        data.forEach(function (d, i) {
          var c = d.color ? (cssVar(d.color) || d.color) : cols[i % cols.length];
          var s = document.createElement("span");
          s.innerHTML = '<i style="background:' + c + '"></i>' + (d.label || d.name);
          host.appendChild(s);
        });
      }
    }
  }

  function renderAll() {
    document.querySelectorAll(".chart[data-chart]").forEach(render);
  }

  document.addEventListener("DOMContentLoaded", renderAll);
  document.addEventListener("themechange", function () { setTimeout(renderAll, 20); });
})();
