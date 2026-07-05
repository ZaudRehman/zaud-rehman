import { bloomcraft } from '../data/bloomcraft.js';

const ALL_FILTERS = [
  ...bloomcraft.architecture.core_filters,
  ...bloomcraft.architecture.concurrent_filters,
  ...bloomcraft.architecture.specialized_filters,
];

const CATEGORY_COLORS = {
  Core: { bg: 'bg-sepia/10', border: 'border-sepia/25', dot: 'bg-sepia/60', text: 'text-sepia/80' },
  Performance: { bg: 'bg-amber-800/5', border: 'border-amber-800/15', dot: 'bg-amber-800/50', text: 'text-amber-800/70' },
  Deletable: { bg: 'bg-rose-900/5', border: 'border-rose-900/12', dot: 'bg-rose-900/40', text: 'text-rose-900/60' },
  Adaptive: { bg: 'bg-emerald-800/5', border: 'border-emerald-800/12', dot: 'bg-emerald-800/40', text: 'text-emerald-800/60' },
  Concurrent: { bg: 'bg-blue-900/5', border: 'border-blue-900/12', dot: 'bg-blue-900/40', text: 'text-blue-900/60' },
  Hierarchical: { bg: 'bg-purple-900/5', border: 'border-purple-900/12', dot: 'bg-purple-900/40', text: 'text-purple-900/60' },
  Reference: { bg: 'bg-charcoal/4', border: 'border-charcoal/12', dot: 'bg-charcoal/30', text: 'text-charcoal/50' },
};

const INSERT_THROUGHPUT = [
  { name: 'Partitioned', value: 79.4, max: 80 },
  { name: 'ClassicHash', value: 65.4, max: 80 },
  { name: 'AtomicPartitioned', value: 46.9, max: 80 },
  { name: 'RegisterBlocked', value: 37.9, max: 80 },
  { name: 'Standard', value: 20.8, max: 80 },
  { name: 'Scalable', value: 20.3, max: 80 },
  { name: 'AtomicScalable', value: 19.0, max: 80 },
  { name: 'ClassicBits', value: 18.8, max: 80 },
  { name: 'Striped', value: 11.1, max: 80 },
  { name: 'Sharded', value: 10.6, max: 80 },
  { name: 'Counting', value: 9.1, max: 80 },
  { name: 'Tree', value: 5.2, max: 80 },
];

const CONCURRENCY_SCALING = [
  { threads: 1, standard: 20.0, sharded: 10.6, striped: 10.7, atomicPart: 35.3, atomicScal: 15.6 },
  { threads: 2, standard: 26.7, sharded: 13.3, striped: 8.8, atomicPart: 19.5, atomicScal: 9.1 },
  { threads: 4, standard: 43.6, sharded: 20.7, striped: 8.8, atomicPart: 27.7, atomicScal: 8.9 },
  { threads: 8, standard: 62.1, sharded: 26.9, striped: 8.3, atomicPart: 32.4, atomicScal: 11.0 },
  { threads: 16, standard: 59.6, sharded: 27.2, striped: 8.2, atomicPart: 31.6, atomicScal: 11.6 },
];

const MEMORY_FOOTPRINT = [
  { name: 'Standard', bits: 0.96, label: '0.96M' },
  { name: 'Partitioned', bits: 0.96, label: '0.96M' },
  { name: 'RegisterBlocked', bits: 0.96, label: '0.96M' },
  { name: 'Sharded', bits: 0.96, label: '0.96M' },
  { name: 'Tree', bits: 0.96, label: '0.96M' },
  { name: 'Scalable', bits: 2.10, label: '2.10M' },
  { name: 'AtomicScalable', bits: 3.16, label: '3.16M' },
  { name: 'Counting', bits: 3.92, label: '3.92M' },
];

const FEATURE_FLAGS = [
  { flag: 'serde', desc: 'Serialize / Deserialize' },
  { flag: 'xxhash', desc: 'XXH3 hasher' },
  { flag: 'wyhash', desc: 'WyHash hasher' },
  { flag: 'simd', desc: 'AVX2 / SSE4.1 batch' },
  { flag: 'metrics', desc: 'Telemetry & histograms' },
  { flag: 'concurrent', desc: 'Atomic filters' },
  { flag: 'rayon', desc: 'Parallel batch ops' },
  { flag: 'proptest', desc: 'Property tests' },
];

const CONCURRENCY_MODELS = [
  {
    name: 'External Lock', sig: '&mut self',
    desc: 'Standard ownership. Wrap in Arc<Mutex<T>> for threads.',
    filters: ['CountingBloomFilter', 'ScalableBloomFilter', 'PartitionedBloomFilter', 'RegisterBlockedBloomFilter', 'TreeBloomFilter'],
  },
  {
    name: 'Atomic CAS', sig: '&self',
    desc: 'Lock-free via AtomicU64 fetch_or with Relaxed ordering.',
    filters: ['StandardBloomFilter', 'AtomicPartitionedBloomFilter'],
  },
  {
    name: 'Interior Mutability', sig: '&self',
    desc: 'Sharded or striped locking inside the type.',
    filters: ['ShardedBloomFilter', 'StripedBloomFilter', 'AtomicScalableBloomFilter'],
  },
];

const ARCH_TREE = [
  { indent: 0, name: 'src/', type: 'dir' },
  { indent: 1, name: 'core/', type: 'dir', note: 'Traits, BitVec, math' },
  { indent: 2, name: 'BloomFilter', type: 'file' },
  { indent: 2, name: 'ConcurrentBloomFilter', type: 'file' },
  { indent: 1, name: 'filters/', type: 'dir', note: '12 implementations' },
  { indent: 2, name: 'Standard, Counting, Scalable…', type: 'file' },
  { indent: 1, name: 'sync/', type: 'dir', note: 'Sharded, Striped' },
  { indent: 1, name: 'builder/', type: 'dir', note: 'Type-state builders' },
  { indent: 1, name: 'hash/', type: 'dir', note: 'Strategies, hashers' },
  { indent: 1, name: 'metrics/', type: 'dir', note: 'Telemetry' },
  { indent: 1, name: 'error.rs', type: 'file' },
];

// ── Overlay content builders ──

function overlayFilterGrid() {
  return ALL_FILTERS.map(f => {
    const cat = f.category || 'Core';
    const c = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Core;
    const shortName = f.name.replace('BloomFilter', '').replace('Filter', '');
    return `
      <div class="bc-filter-card group relative p-4 border ${c.border} ${c.bg} rounded-sm transition-all duration-300 hover:shadow-md cursor-default">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2 h-2 rounded-full ${c.dot} shrink-0"></span>
          <span class="font-mono text-[10px] ${c.text} uppercase tracking-wider">${cat}</span>
        </div>
        <h4 class="font-mono text-sm text-charcoal mb-1.5 leading-tight">${shortName}</h4>
        <p class="font-serif text-[11px] text-charcoal/50 leading-snug mb-3">${f.use_case}</p>
        <div class="flex flex-wrap gap-1">
          ${f.features.slice(0, 2).map(ft => `
            <span class="font-mono text-[8px] text-charcoal/35 bg-charcoal/4 px-1.5 py-0.5 rounded-sm leading-none">${ft.split('(')[0].trim().substring(0, 32)}</span>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function overlayBenchBars() {
  return INSERT_THROUGHPUT.map(f => {
    const pct = (f.value / f.max) * 100;
    const isTop3 = INSERT_THROUGHPUT.indexOf(f) < 3;
    return `
      <div class="flex items-center gap-3 group">
        <span class="font-mono text-[10px] text-charcoal/50 w-28 text-right truncate shrink-0">${f.name}</span>
        <div class="flex-1 h-3 bc-bench-track bg-charcoal/5 rounded-sm overflow-hidden relative">
          <div class="h-full ${isTop3 ? 'bg-sepia/50 bc-bench-value-top' : 'bg-charcoal/15 bc-bench-bar'} rounded-sm transition-all duration-700" style="width:${pct}%"></div>
        </div>
        <span class="font-mono text-[10px] ${isTop3 ? 'text-sepia/70 font-semibold bc-bench-value-top' : 'text-charcoal/40 bc-bench-value'} w-14 shrink-0">${f.value} M/s</span>
      </div>
    `;
  }).join('');
}

function overlayConcurrencyChart() {
  const maxVal = 65;
  const lines = [
    { key: 'standard', label: 'Standard', color: '#8b7355' },
    { key: 'sharded', label: 'Sharded', color: '#555' },
    { key: 'striped', label: 'Striped', color: '#999' },
    { key: 'atomicPart', label: 'AtomicPart.', color: '#7a9a6b' },
    { key: 'atomicScal', label: 'AtomicScal.', color: '#b07219' },
  ];
  const chartH = 100, chartW = 280, padL = 30, padB = 20;
  const plotW = chartW - padL, plotH = chartH - padB;

  const paths = lines.map(line => {
    const pts = CONCURRENCY_SCALING.map((d, i) => {
      const x = padL + (i / (CONCURRENCY_SCALING.length - 1)) * plotW;
      const y = plotH - (d[line.key] / maxVal) * plotH;
      return `${x},${y}`;
    });
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="${line.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>`;
  }).join('');

  const dots = lines.map(line =>
    CONCURRENCY_SCALING.map((d, i) => {
      const x = padL + (i / (CONCURRENCY_SCALING.length - 1)) * plotW;
      const y = plotH - (d[line.key] / maxVal) * plotH;
      return `<circle cx="${x}" cy="${y}" r="2.5" fill="${line.color}" opacity="0.8"/>`;
    }).join('')
  ).join('');

  const xLabels = CONCURRENCY_SCALING.map((d, i) => {
    const x = padL + (i / (CONCURRENCY_SCALING.length - 1)) * plotW;
    return `<text x="${x}" y="${chartH - 2}" text-anchor="middle" class="bc-chart-label" font-size="8" font-family="monospace">${d.threads}</text>`;
  }).join('');

  const gridLines = [20, 40, 60].map(v => {
    const y = plotH - (v / maxVal) * plotH;
    return `<line x1="${padL}" y1="${y}" x2="${chartW}" y2="${y}" stroke="currentColor" class="bc-grid-line" stroke-width="0.5"/>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${chartW} ${chartH + 4}" class="w-full h-auto bc-chart">
      ${gridLines}${xLabels}${paths}${dots}
    </svg>
    <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2">
      ${lines.map(l => `<span class="flex items-center gap-1.5 font-mono text-[9px] text-charcoal/45"><span class="w-2 h-0.5 rounded-full" style="background:${l.color}"></span>${l.label}</span>`).join('')}
    </div>
  `;
}

function overlayMemoryBars() {
  const maxBits = 4.0;
  return MEMORY_FOOTPRINT.map(f => {
    const pct = (f.bits / maxBits) * 100;
    return `
      <div class="flex items-center gap-3">
        <span class="font-mono text-[10px] text-charcoal/50 w-28 text-right truncate shrink-0">${f.name}</span>
        <div class="flex-1 h-3.5 bc-bench-track bg-charcoal/5 rounded-sm overflow-hidden">
          <div class="h-full bg-sepia/35 rounded-sm" style="width:${pct}%"></div>
        </div>
        <span class="font-mono text-[10px] text-charcoal/40 w-12 shrink-0">${f.label}</span>
      </div>
    `;
  }).join('');
}

function overlayConcurrencyModels() {
  return CONCURRENCY_MODELS.map(m => `
    <div class="p-4 border border-charcoal/10 rounded-sm bg-paper relative">
      <div class="flex items-center gap-2 mb-2">
        <code class="font-mono text-xs text-sepia bg-sepia/8 px-2 py-0.5 rounded-sm">${m.sig}</code>
      </div>
      <p class="font-serif text-sm text-charcoal/70 mb-3 leading-relaxed">${m.desc}</p>
      <div class="flex flex-wrap gap-1.5">
        ${m.filters.map(f => {
          const short = f.replace('BloomFilter', '').replace('Filter', '');
          return `<span class="font-mono text-[9px] text-charcoal/40 border border-charcoal/10 px-1.5 py-0.5 rounded-sm">${short}</span>`;
        }).join('')}
      </div>
    </div>
  `).join('');
}

function overlayFeatureMatrix() {
  const filterNames = ['Standard', 'Counting', 'Scalable', 'Partitioned', 'Reg.Blk.', 'Tree', 'Sharded', 'Striped', 'At.Part.', 'At.Scal.', 'Cls.Hash', 'Cls.Bits'];
  const support = {
    serde:     [1,1,1,1,1,1,0,0,0,0,0,0],
    xxhash:    [1,1,1,1,1,1,1,1,1,1,1,1],
    wyhash:    [1,1,1,1,1,1,1,1,1,1,1,1],
    simd:      [1,0,0,1,1,0,0,0,1,0,0,0],
    metrics:   [1,1,1,1,1,1,1,1,1,1,0,0],
    concurrent:[1,0,0,0,0,0,1,1,1,1,0,0],
    rayon:     [1,0,1,1,1,0,0,0,1,1,0,0],
    proptest:  [1,1,1,1,1,1,1,1,1,1,1,1],
  };
  return `
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead><tr>
          <th class="font-mono text-[9px] text-charcoal/40 uppercase tracking-wider pb-2 pr-3">Flag</th>
          ${filterNames.map(n => `<th class="font-mono text-[7px] text-charcoal/30 uppercase tracking-wider pb-2 text-center px-0.5" style="writing-mode:vertical-lr;transform:rotate(180deg);height:56px">${n}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${FEATURE_FLAGS.map(f => `
            <tr class="border-t border-charcoal/5">
              <td class="font-mono text-[10px] text-charcoal/60 py-1.5 pr-3 whitespace-nowrap">${f.flag}</td>
              ${support[f.flag].map(s => `<td class="text-center py-1.5 px-0.5">${s ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-sepia/50"></span>' : '<span class="inline-block w-1.5 h-1.5 rounded-full bg-charcoal/8"></span>'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function overlayArchTree() {
  return ARCH_TREE.map(node => {
    const indent = node.indent * 16;
    const isDir = node.type === 'dir';
    const icon = isDir
      ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1" class="text-sepia/50 shrink-0"><path d="M1 3V8.5h8V3.5H5L4 2.5H1z"/></svg>'
      : '<span class="inline-block w-1 h-1 rounded-full bg-charcoal/20 shrink-0"></span>';
    return `
      <div class="flex items-center gap-2 py-0.5" style="padding-left:${indent}px">
        ${icon}
        <span class="font-mono text-[11px] ${isDir ? 'text-charcoal/70 font-medium' : 'text-charcoal/50'}">${node.name}</span>
        ${node.note ? `<span class="font-mono text-[9px] text-charcoal/25 ml-auto">${node.note}</span>` : ''}
      </div>
    `;
  }).join('');
}

// ── Main component ──

export default function BloomCraftLab() {
  return `
    <section id="bloomcraft" class="bloomcraft-research-shell py-24 md:py-32 relative overflow-hidden my-20 border-y border-charcoal/10 bg-paper-dark/30">
      <div class="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-20 pointer-events-none"></div>

      <div class="max-w-6xl mx-auto px-6 relative z-10">

        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start mb-16 gap-10">
          <div class="relative bloomcraft-heading-block">
            <div class="absolute -top-8 -left-6 opacity-20 bloomcraft-seal pointer-events-none hidden md:block">
              <svg width="92" height="92" viewBox="0 0 92 92" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="46" cy="46" r="34" stroke-dasharray="3 5"/>
                <circle cx="46" cy="46" r="20" opacity="0.45"/>
                <path d="M46 15V77M15 46H77" opacity="0.28"/>
                <path d="M46 30L51 46L46 62L41 46Z" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <div class="pl-4 border-l border-sepia/30 ml-2 md:ml-10 relative z-10">
              <p class="font-mono text-[10px] uppercase tracking-[0.24em] text-charcoal/50 mb-3">Research Folio</p>
              <div class="flex items-center gap-5 mb-2">
                <h2 class="font-serif text-5xl md:text-6xl text-charcoal">${bloomcraft.title}</h2>
                <span class="erra-badge font-mono text-xs px-2 py-1 rounded-sm border border-charcoal/20 text-charcoal/70 tracking-widest">${bloomcraft.version}</span>
              </div>
              <h3 class="font-serif text-2xl text-sepia italic mb-4">${bloomcraft.subtitle}</h3>
              <p class="bloomcraft-tagline font-serif text-xl max-w-3xl leading-relaxed">${bloomcraft.tagline}</p>
            </div>
          </div>
          <div class="bloomcraft-stamp border-4 p-4 -rotate-3 stamp rounded-sm backdrop-blur-sm">
            <span class="bloomcraft-stamp-label font-mono font-bold tracking-widest uppercase text-sm">Active Research</span>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          ${[
            { idx: '01', value: bloomcraft.info.total_filters + '+', label: 'Filter Variants', note: 'Production-grade' },
            { idx: '02', value: bloomcraft.info.hash_algorithms, label: 'Hash Algorithms', note: 'XXHash3, WyHash, SipHash, SIMD' },
            { idx: '03', value: bloomcraft.info.concurrent_variants, label: 'Concurrent', note: 'Lock-free, sharded, striped' },
            { idx: '04', value: bloomcraft.info.specialized_variants, label: 'Specialized', note: 'Tree, partitioned, scalable' },
          ].map(s => `
            <div class="bloomcraft-stat bg-paper p-5 border border-charcoal/10 shadow-sm relative group transition-transform duration-300 bloomcraft-shell">
              <div class="absolute top-0 left-0 w-full h-px bg-sepia/30 group-hover:bg-sepia transition-colors"></div>
              <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/40 mb-2">Index ${s.idx}</p>
              <h4 class="font-mono text-2xl md:text-3xl text-charcoal mb-1">${s.value}</h4>
              <p class="font-serif text-sm text-sepia italic mb-1">${s.label}</p>
              <p class="font-mono text-[9px] text-charcoal/40">${s.note}</p>
            </div>
          `).join('')}
        </div>

        <!-- Highlights + CTA -->
        <div class="flex flex-col md:flex-row gap-10 items-start">
          <div class="flex-1">
            <p class="font-mono text-[10px] uppercase tracking-[0.24em] text-charcoal/50 mb-4">Why BloomCraft</p>
            <ul class="space-y-3 mb-8">
              ${bloomcraft.highlights.slice(0, 4).map((h, i) => `
                <li class="flex items-start gap-3 font-mono text-sm text-charcoal/80">
                  <span class="text-gold mt-1 shrink-0">${String(i + 1).padStart(2, '0')}</span>
                  <span>${h}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="shrink-0 flex flex-col items-start md:items-end gap-4">
            <button id="open-bc-research" class="group flex items-center gap-3 px-6 py-3 border border-charcoal/20 text-charcoal/60 rounded-sm hover:border-sepia/40 hover:text-charcoal transition-all duration-200 font-mono text-sm tracking-wider">
              View Full Research
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" class="group-hover:translate-x-0.5 transition-transform"><path d="M1 7h10M8 4l3 3-3 3"/></svg>
            </button>
            <div class="flex gap-3">
              <a href="${bloomcraft.links.github}" target="_blank" rel="noopener noreferrer"
                 class="font-mono text-xs text-charcoal/50 hover:text-sepia transition-colors flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                GitHub
              </a>
              <a href="${bloomcraft.links.cratesio}" target="_blank" rel="noopener noreferrer"
                 class="font-mono text-xs text-charcoal/50 hover:text-sepia transition-colors flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                crates.io
              </a>
              <a href="https://docs.rs/bloomcraft/latest/bloomcraft/" target="_blank" rel="noopener noreferrer"
                 class="font-mono text-xs text-charcoal/50 hover:text-sepia transition-colors flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                docs.rs
              </a>
            </div>
            <div class="relative inline-block group" id="bloomcraft-cargo-wrap">
              <code class="bloomcraft-code font-mono text-xs px-3 py-2 rounded-sm border border-charcoal group-hover:bg-sepia/10 transition-colors cursor-pointer">
                $ cargo add bloomcraft
              </code>
              <span class="bloomcraft-tooltip absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Copy to clipboard
              </span>
              <div id="bloomcraft-toast" class="absolute -bottom-10 left-0 font-mono text-[11px] text-sepia opacity-0 pointer-events-none transition-opacity duration-300">
                Copied!
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── Research Overlay ── -->
    <div id="bc-research-overlay" class="bc-overlay">
      <div class="bc-overlay-panel" data-lenis-prevent>
        <!-- Title bar -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-charcoal/10 bg-paper sticky top-0 z-10">
          <div class="flex items-center gap-3">
            <button id="close-bc-research" class="forge-tl forge-tl-close" title="Close"></button>
            <span class="font-serif text-sm text-charcoal/60 italic">BloomCraft - Full Research</span>
          </div>
          <div class="flex items-center gap-4">
            <a href="https://docs.rs/bloomcraft/latest/bloomcraft/" target="_blank" rel="noopener noreferrer" class="font-mono text-[9px] text-charcoal/40 hover:text-sepia transition-colors tracking-wider">docs.rs</a>
            <span class="font-mono text-[9px] text-charcoal/30 tracking-wider">${bloomcraft.version}</span>
          </div>
        </div>

        <div class="p-6 md:p-8 space-y-10">

          <!-- Filter Grid -->
          <div>
            <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/40 mb-1">Overview</p>
            <h3 class="font-serif text-xl text-charcoal mb-4">All ${ALL_FILTERS.length} Filter Variants</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${overlayFilterGrid()}
            </div>
          </div>

          <!-- Benchmarks -->
          <div class="grid md:grid-cols-2 gap-8">
            <div class="bg-paper border border-charcoal/10 p-5 rounded-sm">
              <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/40 mb-1">Benchmark</p>
              <h4 class="font-serif text-lg text-charcoal mb-3">Insert Throughput</h4>
              <p class="font-mono text-[9px] text-charcoal/30 mb-3">N = 100K, 1% FPR, single-threaded</p>
              <div class="space-y-1.5">${overlayBenchBars()}</div>
            </div>
            <div class="bg-paper border border-charcoal/10 p-5 rounded-sm">
              <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/40 mb-1">Benchmark</p>
              <h4 class="font-serif text-lg text-charcoal mb-3">Concurrent Thread Scaling</h4>
              <p class="font-mono text-[9px] text-charcoal/30 mb-2">Insert Melem/s vs thread count</p>
              ${overlayConcurrencyChart()}
            </div>
          </div>

          <!-- Memory + Concurrency -->
          <div class="grid md:grid-cols-2 gap-8">
            <div class="bg-paper border border-charcoal/10 p-5 rounded-sm">
              <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/40 mb-1">Reference</p>
              <h4 class="font-serif text-lg text-charcoal mb-3">Memory Footprint</h4>
              <p class="font-mono text-[9px] text-charcoal/30 mb-3">N = 100K, 1% target FPR</p>
              <div class="space-y-1.5">${overlayMemoryBars()}</div>
            </div>
            <div class="bg-paper border border-charcoal/10 p-5 rounded-sm">
              <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/40 mb-1">Architecture</p>
              <h4 class="font-serif text-lg text-charcoal mb-3">Concurrency Models</h4>
              <div class="space-y-3">${overlayConcurrencyModels()}</div>
            </div>
          </div>

          <!-- Feature Matrix -->
          <div class="bg-paper border border-charcoal/10 p-5 rounded-sm">
            <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/40 mb-1">Reference</p>
            <h4 class="font-serif text-lg text-charcoal mb-3">Feature Matrix</h4>
            ${overlayFeatureMatrix()}
          </div>

          <!-- Architecture -->
          <div class="bg-paper border border-charcoal/10 p-5 rounded-sm">
            <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/40 mb-1">Structure</p>
            <h4 class="font-serif text-lg text-charcoal mb-3">Architecture</h4>
            <div class="bg-charcoal/[0.02] rounded-sm p-4 border border-charcoal/5">
              ${overlayArchTree()}
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

export function initBloomCraftLab() {
  const overlay = document.getElementById('bc-research-overlay');
  const openBtn = document.getElementById('open-bc-research');
  const closeBtn = document.getElementById('close-bc-research');

  if (!overlay || !openBtn) return;

  function openOverlay() {
    overlay.classList.add('bc-overlay-open');
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    overlay.classList.remove('bc-overlay-open');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openOverlay);
  if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('bc-overlay-open')) closeOverlay();
  });

  const cargoWrap = document.getElementById('bloomcraft-cargo-wrap');
  const toast = document.getElementById('bloomcraft-toast');
  if (cargoWrap && toast) {
    cargoWrap.addEventListener('click', () => {
      navigator.clipboard.writeText('cargo add bloomcraft').then(() => {
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 1500);
      });
    });
  }
}
