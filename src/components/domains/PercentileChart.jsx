import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { BENCHMARKS, CHILD_PROJECTIONS } from '../../data/benchmarks';
import { useStudent } from '../../hooks/useStudent';

const BAND_OPACITIES = [0.15, 0.25, 0.25, 0.15];
const COUNTRY_FLAGS = { us: '\u{1F1FA}\u{1F1F8}', nz: '\u{1F1F3}\u{1F1FF}', au: '\u{1F1E6}\u{1F1FA}', uk: '\u{1F1EC}\u{1F1E7}' };

const DEFAULT_X = [36, 72];
const FULL_X = [36, 216];
const FULL_Y = [0, 100];
const MIN_X_RANGE = 18;
const MIN_Y_RANGE = 8;

const AGE_MARKERS = [
  { month: 60, label: 'School Entry (NZ/AU/UK)' },
  { month: 72, label: 'Kindergarten (US)' },
  { month: 96, label: 'KS1\u2192KS2 (UK)' },
  { month: 132, label: 'Year 7 (AU/NZ)' },
  { month: 156, label: 'KS3\u2192KS4 (UK)' },
  { month: 192, label: 'GCSE / NCEA L1' },
  { month: 216, label: 'A-Levels / NCEA L3' },
];

function clampX(domain) {
  let [lo, hi] = domain;
  const range = hi - lo;
  if (lo < FULL_X[0]) { lo = FULL_X[0]; hi = lo + range; }
  if (hi > FULL_X[1]) { hi = FULL_X[1]; lo = hi - range; }
  return [Math.max(FULL_X[0], lo), Math.min(FULL_X[1], hi)];
}

function clampY(domain) {
  let [lo, hi] = domain;
  const range = hi - lo;
  if (lo < 0) { lo = 0; hi = range; }
  if (hi > 100) { hi = 100; lo = 100 - range; }
  return [Math.max(0, lo), Math.min(100, hi)];
}

/** Compute a Y-axis domain that fits the visible benchmark data + child/projections */
function computeAutoY(xDom, benchmarkData, countries, childScore, childMonth, projections) {
  let minVal = 100, maxVal = 0;

  const sets = [benchmarkData.us];
  if (countries.nz) sets.push(benchmarkData.nz);
  if (countries.au) sets.push(benchmarkData.au);
  if (countries.uk) sets.push(benchmarkData.uk);

  for (const pts of sets) {
    for (const p of pts) {
      if (p[0] >= xDom[0] && p[0] <= xDom[1]) {
        minVal = Math.min(minVal, p[1]); // p10
        maxVal = Math.max(maxVal, p[5]); // p90
      }
    }
  }

  // Include child position
  if (childMonth >= xDom[0] && childMonth <= xDom[1]) {
    minVal = Math.min(minVal, childScore);
    maxVal = Math.max(maxVal, childScore);
  }

  // Include projections
  if (projections) {
    for (const [m, s] of Object.entries(projections)) {
      if (Number(m) >= xDom[0] && Number(m) <= xDom[1]) {
        minVal = Math.min(minVal, s);
        maxVal = Math.max(maxVal, s);
      }
    }
  }

  if (minVal > maxVal) return FULL_Y; // no visible data

  const range = maxVal - minVal;
  const pad = Math.max(3, range * 0.15);
  let lo = Math.max(0, Math.floor(minVal - pad));
  let hi = Math.min(100, Math.ceil(maxVal + pad));

  if (hi - lo < MIN_Y_RANGE) {
    const c = (lo + hi) / 2;
    lo = Math.max(0, c - MIN_Y_RANGE / 2);
    hi = Math.min(100, c + MIN_Y_RANGE / 2);
  }
  return [lo, hi];
}

export default function PercentileChart({ domainId, color, childScore = 0 }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [showNZ, setShowNZ] = useState(false);
  const [showAU, setShowAU] = useState(false);
  const [showUK, setShowUK] = useState(false);
  const [xDomain, setXDomain] = useState(DEFAULT_X);
  const [yDomain, setYDomain] = useState(FULL_Y);
  const xRef = useRef(xDomain);
  const yRef = useRef(yDomain);
  const isDragging = useRef(false);
  const { age } = useStudent();

  useEffect(() => { xRef.current = xDomain; }, [xDomain]);
  useEffect(() => { yRef.current = yDomain; }, [yDomain]);

  const data = BENCHMARKS[domainId];
  const projections = CHILD_PROJECTIONS[domainId];
  const childMonth = Math.min(age.totalMonths, 216);
  const countries = { nz: showNZ, au: showAU, uk: showUK };

  // Auto-fit Y whenever X domain or country toggles change (but not during drag)
  useEffect(() => {
    if (isDragging.current) return;
    setYDomain(computeAutoY(xDomain, data, countries, childScore, childMonth, projections));
  }, [xDomain, showNZ, showAU, showUK, data, childScore, childMonth, projections]);

  // ── Button handlers ──

  const handleZoomIn = useCallback(() => {
    setXDomain(prev => {
      const r = prev[1] - prev[0];
      if (r <= MIN_X_RANGE) return prev;
      const c = (prev[0] + prev[1]) / 2;
      const nr = r * 0.6;
      return clampX([c - nr / 2, c + nr / 2]);
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setXDomain(prev => {
      const r = prev[1] - prev[0];
      const fr = FULL_X[1] - FULL_X[0];
      if (r >= fr) return FULL_X;
      const c = (prev[0] + prev[1]) / 2;
      const nr = Math.min(fr, r / 0.6);
      return clampX([c - nr / 2, c + nr / 2]);
    });
  }, []);

  const handleReset = useCallback(() => setXDomain(DEFAULT_X), []);
  const handleFullRange = useCallback(() => setXDomain(FULL_X), []);

  // ── Wheel zoom + 2-D drag pan ──

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const margin = { top: 20, left: 45, right: 30, bottom: 40 };

    function dims() {
      const w = (containerRef.current?.clientWidth || 400) - margin.left - margin.right;
      const h = 340 - margin.top - margin.bottom;
      return { w, h };
    }

    // Scroll wheel → zoom X, Y auto-fits via useEffect
    function onWheel(e) {
      e.preventDefault();
      const prev = xRef.current;
      const range = prev[1] - prev[0];
      const fr = FULL_X[1] - FULL_X[0];
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left - margin.left;
      const { w } = dims();
      const frac = Math.max(0, Math.min(1, mx / w));
      const factor = e.deltaY > 0 ? 1.25 : 0.8;
      let nr = Math.max(MIN_X_RANGE, Math.min(fr, range * factor));
      const pivot = prev[0] + frac * range;
      setXDomain(clampX([pivot - frac * nr, pivot + (1 - frac) * nr]));
    }

    // Drag → pan both X and Y
    let dragStartX = null;
    let dragStartY = null;
    let dragXDom = null;
    let dragYDom = null;

    function onMouseDown(e) {
      if (e.button !== 0) return;
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left - margin.left;
      const my = e.clientY - rect.top - margin.top;
      const { w, h } = dims();
      if (mx < 0 || mx > w || my < 0 || my > h) return;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragXDom = xRef.current;
      dragYDom = yRef.current;
      isDragging.current = true;
      svg.style.cursor = 'grabbing';
      e.preventDefault();
    }

    function onMouseMove(e) {
      if (dragStartX === null) return;
      const { w, h } = dims();
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      const xRange = dragXDom[1] - dragXDom[0];
      const yRange = dragYDom[1] - dragYDom[0];
      const mxDelta = -(dx / w) * xRange;
      const myDelta = (dy / h) * yRange; // inverted: drag up = higher values
      setXDomain(clampX([dragXDom[0] + mxDelta, dragXDom[1] + mxDelta]));
      setYDomain(clampY([dragYDom[0] + myDelta, dragYDom[1] + myDelta]));
    }

    function onMouseUp() {
      if (dragStartX !== null) {
        dragStartX = null;
        dragStartY = null;
        svg.style.cursor = 'grab';
        isDragging.current = false;
      }
    }

    // Touch: 1-finger pan, 2-finger pinch-zoom
    let touchStartX = null;
    let touchStartY = null;
    let touchXDom = null;
    let touchYDom = null;
    let pinchDist = null;

    function dist2(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchXDom = xRef.current;
        touchYDom = yRef.current;
        isDragging.current = true;
      } else if (e.touches.length === 2) {
        pinchDist = dist2(e.touches);
        touchXDom = xRef.current;
        touchYDom = yRef.current;
      }
    }

    function onTouchMove(e) {
      e.preventDefault();
      const { w, h } = dims();
      if (e.touches.length === 1 && touchStartX !== null) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        const xr = touchXDom[1] - touchXDom[0];
        const yr = touchYDom[1] - touchYDom[0];
        setXDomain(clampX([touchXDom[0] - (dx / w) * xr, touchXDom[1] - (dx / w) * xr]));
        setYDomain(clampY([touchYDom[0] + (dy / h) * yr, touchYDom[1] + (dy / h) * yr]));
      } else if (e.touches.length === 2 && pinchDist !== null) {
        const nd = dist2(e.touches);
        const scale = pinchDist / nd;
        const xr = touchXDom[1] - touchXDom[0];
        const fr = FULL_X[1] - FULL_X[0];
        const nr = Math.max(MIN_X_RANGE, Math.min(fr, xr * scale));
        const cx = (touchXDom[0] + touchXDom[1]) / 2;
        setXDomain(clampX([cx - nr / 2, cx + nr / 2]));
      }
    }

    function onTouchEnd() {
      touchStartX = null;
      touchStartY = null;
      pinchDist = null;
      isDragging.current = false;
    }

    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    svg.addEventListener('touchstart', onTouchStart, { passive: true });
    svg.addEventListener('touchmove', onTouchMove, { passive: false });
    svg.addEventListener('touchend', onTouchEnd);

    return () => {
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      svg.removeEventListener('touchstart', onTouchStart);
      svg.removeEventListener('touchmove', onTouchMove);
      svg.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // ── Draw chart ──

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 340;
    const margin = { top: 20, right: 30, bottom: 40, left: 45 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height).style('cursor', 'grab');

    svg.append('defs').append('clipPath')
      .attr('id', `chart-clip-${domainId}`)
      .append('rect').attr('width', w).attr('height', h);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const chartArea = g.append('g').attr('clip-path', `url(#chart-clip-${domainId})`);

    const x = d3.scaleLinear().domain(xDomain).range([0, w]);
    const y = d3.scaleLinear().domain(yDomain).range([h, 0]);

    // Grid lines — dynamic based on Y domain
    const yRange = yDomain[1] - yDomain[0];
    let gridStep;
    if (yRange <= 15) gridStep = 2;
    else if (yRange <= 30) gridStep = 5;
    else if (yRange <= 60) gridStep = 10;
    else gridStep = 25;

    const gridValues = d3.range(
      Math.ceil(yDomain[0] / gridStep) * gridStep,
      yDomain[1] + 1,
      gridStep
    ).filter(v => v > yDomain[0] && v < yDomain[1]);

    chartArea.append('g').attr('class', 'grid')
      .selectAll('line').data(gridValues).join('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', '#d4e0ec').attr('stroke-dasharray', '2,4');

    // Draw bands
    function drawBands(countryData, bandColor, opacity) {
      const area = d3.area().x(d => x(d[0])).curve(d3.curveMonotoneX);

      chartArea.append('path').datum(countryData)
        .attr('fill', bandColor).attr('opacity', opacity * BAND_OPACITIES[0])
        .attr('d', area.y0(d => y(d[1])).y1(d => y(d[2])));
      chartArea.append('path').datum(countryData)
        .attr('fill', bandColor).attr('opacity', opacity * BAND_OPACITIES[1])
        .attr('d', area.y0(d => y(d[2])).y1(d => y(d[3])));
      chartArea.append('path').datum(countryData)
        .attr('fill', bandColor).attr('opacity', opacity * BAND_OPACITIES[2])
        .attr('d', area.y0(d => y(d[3])).y1(d => y(d[4])));
      chartArea.append('path').datum(countryData)
        .attr('fill', bandColor).attr('opacity', opacity * BAND_OPACITIES[3])
        .attr('d', area.y0(d => y(d[4])).y1(d => y(d[5])));

      const line = d3.line().x(d => x(d[0])).y(d => y(d[3])).curve(d3.curveMonotoneX);
      chartArea.append('path').datum(countryData)
        .attr('fill', 'none').attr('stroke', bandColor)
        .attr('stroke-width', 1.5).attr('stroke-opacity', opacity * 0.7).attr('d', line);
    }

    drawBands(data.us, color, 1);
    if (showNZ) drawBands(data.nz, '#0ea5e9', 0.5);
    if (showAU) drawBands(data.au, '#22c55e', 0.5);
    if (showUK) drawBands(data.uk, '#8b5cf6', 0.5);

    // Age milestone markers
    AGE_MARKERS.forEach(m => {
      if (m.month >= xDomain[0] && m.month <= xDomain[1]) {
        chartArea.append('line')
          .attr('x1', x(m.month)).attr('x2', x(m.month))
          .attr('y1', 0).attr('y2', h)
          .attr('stroke', '#94a3b8').attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,4').attr('opacity', 0.4);
        chartArea.append('text')
          .attr('x', x(m.month) + 4).attr('y', 12)
          .attr('fill', '#94a3b8').attr('font-size', 9).text(m.label);
      }
    });

    // Child's current position
    const cx = x(childMonth);
    const cy = y(childScore);
    if (childMonth >= xDomain[0] && childMonth <= xDomain[1] &&
        childScore >= yDomain[0] && childScore <= yDomain[1]) {
      chartArea.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', 6)
        .attr('fill', color).attr('stroke', '#ffffff').attr('stroke-width', 2);
      chartArea.append('text')
        .attr('x', cx + 10).attr('y', cy + 4)
        .attr('fill', '#1e3a4f').attr('font-size', 11).attr('font-weight', 600)
        .text(`${childScore}%`);
    }

    // Projected trajectory
    const projAges = Object.keys(projections).map(Number).sort((a, b) => a - b);
    const projPts = projAges.filter(m => m > childMonth).map(m => ({ month: m, score: projections[m] }));
    if (projPts.length > 0) {
      const full = [{ month: childMonth, score: childScore }, ...projPts];
      const vis = full.filter(p => p.month >= xDomain[0] && p.month <= xDomain[1]);
      if (vis.length >= 2) {
        const pLine = d3.line().x(d => x(d.month)).y(d => y(d.score)).curve(d3.curveMonotoneX);
        chartArea.append('path').datum(vis)
          .attr('fill', 'none').attr('stroke', color)
          .attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3').attr('opacity', 0.6)
          .attr('d', pLine);
        vis.forEach(p => {
          if (p.month > childMonth) {
            chartArea.append('circle')
              .attr('cx', x(p.month)).attr('cy', y(p.score)).attr('r', 4)
              .attr('fill', 'none').attr('stroke', color)
              .attr('stroke-width', 1.5).attr('stroke-dasharray', '2,2');
          }
        });
      }
    }

    // X axis
    const xRange = xDomain[1] - xDomain[0];
    let xTicks;
    if (xRange <= 48) xTicks = d3.range(Math.ceil(xDomain[0] / 6) * 6, xDomain[1] + 1, 6);
    else if (xRange <= 96) xTicks = d3.range(Math.ceil(xDomain[0] / 12) * 12, xDomain[1] + 1, 12);
    else { const s = xRange > 144 ? 36 : 24; xTicks = d3.range(Math.ceil(xDomain[0] / s) * s, xDomain[1] + 1, s); }

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickValues(xTicks).tickFormat(d => {
        const yr = Math.floor(d / 12); const mo = d % 12;
        return (xRange <= 48 && mo) ? `${yr}y${mo}m` : `${yr}y`;
      }))
      .selectAll('text').attr('fill', '#5e8a9e').attr('font-size', 10);

    // Y axis — dynamic ticks
    let yTickStep;
    if (yRange <= 15) yTickStep = 2;
    else if (yRange <= 30) yTickStep = 5;
    else if (yRange <= 60) yTickStep = 10;
    else yTickStep = 25;

    const yTicks = d3.range(
      Math.ceil(yDomain[0] / yTickStep) * yTickStep,
      yDomain[1] + 0.1,
      yTickStep
    );

    g.append('g')
      .call(d3.axisLeft(y).tickValues(yTicks).tickFormat(d => `${d}%`))
      .selectAll('text').attr('fill', '#5e8a9e').attr('font-size', 10);

    g.selectAll('.domain').attr('stroke', '#d4e0ec');
    g.selectAll('.tick line').attr('stroke', '#d4e0ec');

  }, [data, childScore, projections, color, showNZ, showAU, showUK, age.totalMonths, xDomain, yDomain, domainId, childMonth]);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-text-primary text-base font-semibold">Percentile Growth Chart</h3>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleZoomIn} className="text-sm px-3 py-1.5 rounded-lg border border-border text-text-dim hover:text-text-muted transition-colors min-h-[36px] min-w-[36px]" title="Zoom in">+</button>
          <button onClick={handleZoomOut} className="text-sm px-3 py-1.5 rounded-lg border border-border text-text-dim hover:text-text-muted transition-colors min-h-[36px] min-w-[36px]" title="Zoom out">-</button>
          <button onClick={handleReset} className="text-sm px-3 py-1.5 rounded-lg border border-border text-text-dim hover:text-text-muted transition-colors min-h-[36px]">Reset</button>
          <button onClick={handleFullRange} className="text-sm px-3 py-1.5 rounded-lg border border-border text-text-dim hover:text-text-muted transition-colors min-h-[36px]">Full Range</button>
          <button onClick={() => setShowNZ(!showNZ)} className={`text-sm px-3 py-1.5 rounded-lg border transition-colors min-h-[36px] ${showNZ ? 'border-numeracy text-numeracy' : 'border-border text-text-dim hover:text-text-muted'}`}>{COUNTRY_FLAGS.nz} NZ</button>
          <button onClick={() => setShowAU(!showAU)} className={`text-sm px-3 py-1.5 rounded-lg border transition-colors min-h-[36px] ${showAU ? 'border-motor text-motor' : 'border-border text-text-dim hover:text-text-muted'}`}>{COUNTRY_FLAGS.au} AU</button>
          <button onClick={() => setShowUK(!showUK)} className={`text-sm px-3 py-1.5 rounded-lg border transition-colors min-h-[36px] ${showUK ? 'border-accent text-accent' : 'border-border text-text-dim hover:text-text-muted'}`}>{COUNTRY_FLAGS.uk} UK</button>
        </div>
      </div>
      <div ref={containerRef} className="w-full overflow-hidden" style={{ touchAction: 'none' }}>
        <svg ref={svgRef} />
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-text-dim flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} /> Current</span>
        <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed" style={{ borderColor: color }} /> Projected</span>
        <span className="flex items-center gap-1.5"><span className="w-5 h-3 rounded-sm opacity-30" style={{ backgroundColor: color }} /> US percentile bands</span>
        <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-text-muted" /> School transitions</span>
        <span className="text-text-dim">Scroll to zoom &middot; Drag to pan</span>
      </div>
    </div>
  );
}
