// ── Multi-Language Code Runner ───────────────────────────────
// Uses Judge0 CE API (free, public, fast) for remote compilation.
// JavaScript falls back to in-browser eval for even faster feedback.

const JUDGE0_URL = 'https://ce.judge0.com/submissions';

const LANGUAGES = [
  {
    id: 'rust', label: 'Rust', judge0: 73, moniker: 'Rs',
    example: `fn main() {\n    println!("Hello from Rust!");\n    \n    let mut v: Vec<i32> = (1..=10).collect();\n    v.reverse();\n    println!("Reversed: {:?}", v);\n}`,
  },
  {
    id: 'c', label: 'C', judge0: 50, moniker: 'C',
    example: `#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    \n    int fib[] = {0, 1, 1, 2, 3, 5, 8, 13, 21, 34};\n    int n = sizeof(fib) / sizeof(fib[0]);\n    for (int i = 0; i < n; i++) {\n        printf("fib[%d] = %d\\n", i, fib[i]);\n    }\n    return 0;\n}`,
  },
  {
    id: 'cpp', label: 'C++', judge0: 54, moniker: 'Cpp',
    example: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    \n    std::vector<int> nums = {42, 17, 8, 99, 3};\n    std::sort(nums.begin(), nums.end());\n    for (int n : nums) {\n        std::cout << n << " ";\n    }\n    std::cout << std::endl;\n    return 0;\n}`,
  },
  {
    id: 'python', label: 'Python', judge0: 71, moniker: 'Py',
    example: `print("Hello from Python!")\n\ndef fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a, end=" ")\n        a, b = b, a + b\n\nfib(12)\nprint()`,
  },
  {
    id: 'javascript', label: 'JavaScript', judge0: 63, moniker: 'JS',
    example: `console.log("Hello from JavaScript!");\n\nconst fib = (n) => {\n  const seq = [0, 1];\n  for (let i = 2; i < n; i++) {\n    seq.push(seq[i - 1] + seq[i - 2]);\n  }\n  return seq;\n};\n\nconsole.log(fib(12));`,
  },
  {
    id: 'typescript', label: 'TypeScript', judge0: 74, moniker: 'Ts',
    example: `const greet = (name: string): void => {\n  console.log(\`Hello, \${name}! Welcome to TypeScript.\`);\n};\n\ngreet("Workshop");\n\ninterface Lab {\n  name: string;\n  tools: string[];\n}\n\nconst forge: Lab = {\n  name: "The Forge",\n  tools: ["Rust", "C", "Python"],\n};\n\nconsole.log(forge);`,
  },
  {
    id: 'java', label: 'Java', judge0: 62, moniker: 'Jv',
    example: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n        \n        int[] nums = {3, 7, 2, 9, 5};\n        java.util.Arrays.sort(nums);\n        for (int n : nums) {\n            System.out.print(n + " ");\n        }\n        System.out.println();\n    }\n}`,
  },
];

// ── Syntax highlighting for canvas export ──────────────────
const KW = {
  rust: /\b(fn|let|mut|if|else|for|while|return|match|use|mod|pub|struct|impl|trait|enum|const|static|type|where|as|in|loop|break|continue|move|ref|self|super|crate|true|false|println|vec|collect|push|iter|map|filter)\b/g,
  c: /\b(include|define|ifdef|ifndef|endif|printf|scanf|sizeof|typedef|struct|union|enum|return|if|else|for|while|do|switch|case|break|continue|goto|int|char|float|double|void|long|short|unsigned|signed|const|static|extern|volatile|malloc|free|null|NULL|stdin|stdout|fprintf)\b/g,
  cpp: /\b(include|using|namespace|std|cout|cin|endl|return|if|else|for|while|do|switch|case|break|continue|class|public|private|protected|virtual|override|new|delete|nullptr|true|false|auto|const|static|template|typename|vector|sort|begin|end|push_back|size|iostream|algorithm|string)\b/g,
  python: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|yield|lambda|pass|break|continue|and|or|not|in|is|True|False|None|print|range|len|list|dict|set|tuple|int|str|float|bool|input|open|sorted|enumerate|zip|map|filter|append|end|sep)\b/g,
  javascript: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|class|extends|super|this|null|undefined|true|false|try|catch|finally|throw|async|await|import|export|default|from|of|in|console|log|length|push|pop|map|filter|reduce|forEach|slice|splice|indexOf|Array|Object|String|Number|Math|JSON|Promise)\b/g,
  typescript: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|class|extends|super|this|null|undefined|true|false|try|catch|finally|throw|async|await|import|export|default|from|of|in|interface|type|enum|implements|abstract|readonly|private|protected|public|static|console|log|void|string|number|boolean|any|never|unknown|Record|Partial|Required|Pick|Omit)\b/g,
  java: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|new|this|super|null|true|false|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|void|int|char|float|double|long|short|byte|boolean|String|Object|System|out|println|print|Arrays|List|ArrayList|Map|HashMap|import|package)\b/g,
};

const TOKEN_COLORS = {
  keyword: '#8b7355',
  string: '#6a8a5a',
  comment: '#a8a8a8',
  number: '#b07219',
  text: '#2b2b2b',
};

function tokenizeLine(line, langId) {
  const tokens = [];
  const kw = KW[langId];
  // Reset regex lastIndex
  if (kw) kw.lastIndex = 0;

  // Find comments first
  const commentMatch = line.match(/^(\/\/.*|#.*$|\/\*[\s\S]*?\*\/)/);
  if (commentMatch) {
    tokens.push({ text: line.substring(0, commentMatch[0].length), type: 'comment' });
    const rest = line.substring(commentMatch[0].length);
    if (rest) tokens.push({ text: rest, type: 'text' });
    return tokens;
  }

  // Find strings
  const strRegex = /(["'`])(?:(?!\1|\\).|\\.)*\1/g;
  let lastIdx = 0;
  let match;
  const parts = [];

  while ((match = strRegex.exec(line)) !== null) {
    if (match.index > lastIdx) {
      parts.push({ text: line.substring(lastIdx, match.index), type: 'code' });
    }
    parts.push({ text: match[0], type: 'string' });
    lastIdx = strRegex.lastIndex;
  }
  if (lastIdx < line.length) {
    parts.push({ text: line.substring(lastIdx), type: 'code' });
  }

  // Now highlight keywords and numbers in 'code' parts
  for (const part of parts) {
    if (part.type === 'string') {
      tokens.push(part);
      continue;
    }
    // Highlight keywords
    if (kw) {
      kw.lastIndex = 0;
      let codeLast = 0;
      let m;
      while ((m = kw.exec(part.text)) !== null) {
        if (m.index > codeLast) {
          tokens.push({ text: part.text.substring(codeLast, m.index), type: 'text' });
        }
        tokens.push({ text: m[0], type: 'keyword' });
        codeLast = kw.lastIndex;
      }
      if (codeLast < part.text.length) {
        const remaining = part.text.substring(codeLast);
        // Highlight numbers in remaining
        const numRegex = /\b(\d+\.?\d*)\b/g;
        let numLast = 0;
        let nm;
        while ((nm = numRegex.exec(remaining)) !== null) {
          if (nm.index > numLast) {
            tokens.push({ text: remaining.substring(numLast, nm.index), type: 'text' });
          }
          tokens.push({ text: nm[0], type: 'number' });
          numLast = numRegex.lastIndex;
        }
        if (numLast < remaining.length) {
          tokens.push({ text: remaining.substring(numLast), type: 'text' });
        }
      }
    } else {
      tokens.push({ text: part.text, type: 'text' });
    }
  }

  return tokens.length ? tokens : [{ text: line, type: 'text' }];
}

async function runOnJudge0(lang, code, stdin) {
  const resp = await fetch(`${JUDGE0_URL}?base64_encoded=false&wait=true`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: code,
      language_id: lang.judge0,
      stdin: stdin || '',
    }),
  });
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  return await resp.json();
}

function runJSInBrowser(code, stdin) {
  const lines = [];
  const mockConsole = { log: (...args) => lines.push(args.map(String).join(' ')) };
  const mockInput = stdin || '';
  try {
    const fn = new Function('console', 'input', code);
    fn(mockConsole, mockInput);
    return { stdout: lines.join('\n'), stderr: '' };
  } catch (e) {
    return { stdout: '', stderr: String(e) };
  }
}

async function runCode(langId, code, stdin) {
  const lang = LANGUAGES.find(l => l.id === langId);
  if (!lang) throw new Error(`Unknown language: ${langId}`);

  if (langId === 'javascript') {
    return runJSInBrowser(code, stdin);
  }

  const result = await runOnJudge0(lang, code, stdin);
  return {
    stdout: result.stdout || '',
    stderr: result.compile_output
      ? `${result.compile_output}\n${result.stderr || ''}`.trim()
      : (result.stderr || ''),
  };
}

// ── TechStack Component ──────────────────────────────────────

export default function TechStack() {
  const categories = [
    {
      id: "foundry", index: "01", label: "The Foundry", sublabel: "Core Languages",
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><polygon points="9,2 16,6 16,12 9,16 2,12 2,6"/><line x1="9" y1="2" x2="9" y2="16"/><line x1="2" y1="6" x2="16" y2="12"/><line x1="16" y1="6" x2="2" y2="12"/></svg>`,
      note: "where systems begin",
      tools: [{ name: "Rust", glyph: "Rs" }, { name: "C", glyph: "C" }, { name: "C++", glyph: "Cpp" }, { name: "Python", glyph: "Py" }, { name: "TypeScript", glyph: "Ts" }],
    },
    {
      id: "archives", index: "02", label: "The Archives", sublabel: "Persistence & State",
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="2" width="14" height="3.5"/><rect x="2" y="7.5" width="14" height="3.5"/><rect x="2" y="13" width="14" height="3"/><line x1="5" y1="3.75" x2="7" y2="3.75"/><line x1="5" y1="9.25" x2="7" y2="9.25"/></svg>`,
      note: "relational truth · distributed scale",
      tools: [{ name: "PostgreSQL", glyph: "PG", note: "relational truth" }, { name: "Cassandra", glyph: "CS", note: "distributed scale" }, { name: "Redis", glyph: "RD", note: "high-velocity state" }],
    },
    {
      id: "architecture", index: "03", label: "The Architecture", sublabel: "Systems & Theory",
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><circle cx="9" cy="9" r="7"/><line x1="9" y1="2" x2="9" y2="16"/><line x1="2" y1="9" x2="16" y2="9"/><ellipse cx="9" cy="9" rx="4" ry="7"/></svg>`,
      note: "where precision lives",
      tools: [{ name: "Distributed Systems", glyph: "DS" }, { name: "Kernels", glyph: "KN" }, { name: "Concurrency", glyph: "CC" }, { name: "Probabilistic DSA", glyph: "PD" }],
      artifact: { label: "BloomCraft ↗", note: "open-source Rust library" },
    },
    {
      id: "canvas", index: "04", label: "The Canvas", sublabel: "Frontend Craft",
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="3" width="14" height="12" rx="1"/><line x1="2" y1="7" x2="16" y2="7"/><line x1="6" y1="3" x2="6" y2="7"/></svg>`,
      note: "tools that render thought",
      tools: [{ name: "Vite", glyph: "Vt" }, { name: "GSAP", glyph: "GS" }, { name: "Vanilla JS", glyph: "JS" }, { name: "Three.js", glyph: "3J" }],
    },
  ];

  const cards = categories.map((cat, i) => {
    const tools = cat.tools.map((t) =>
      `<div class="techstack-tool group relative flex items-center gap-2.5 py-1.5 cursor-default" data-tool="${t.name}">` +
        `<span class="font-mono text-[10px] text-sepia/60 w-5 shrink-0 select-none">${t.glyph}</span>` +
        `<span class="font-mono text-xs text-charcoal/70 tracking-wide group-hover:text-charcoal transition-colors duration-200">${t.name}</span>` +
        (t.note ? `<span class="hidden md:inline font-serif text-[10px] text-sepia/40 italic ml-auto">${t.note}</span>` : '') +
      `</div>`
    ).join('<div class="h-px bg-charcoal/8 my-0.5"></div>');
    const off = i % 2 === 1 ? 'md:mt-10' : '';
    return `<article class="techstack-card ${off} relative border border-charcoal/10 bg-paper p-6 rounded-sm hover:border-sepia/30 transition-all duration-300 group/card" style="opacity:0;transform:translateY(24px)">` +
      `<div class="absolute inset-0 bg-grid-pattern opacity-[0.03] rounded-sm pointer-events-none"></div>` +
      `<div class="absolute -top-3 left-5 h-6 w-20 bg-sepia/15 rounded-sm rotate-[-0.8deg] flex items-center justify-center"><span class="font-mono text-[8px] text-sepia/50 tracking-[0.2em] uppercase">${cat.index}</span></div>` +
      `<div class="flex items-start justify-between mb-5">` +
        `<div><div class="text-sepia/70 mb-2 techstack-card-icon">${cat.icon}</div><h3 class="font-serif text-lg text-charcoal leading-tight" style="font-weight:500">${cat.label}</h3><span class="font-mono text-[9px] text-sepia/50 tracking-widest uppercase">${cat.sublabel}</span></div>` +
        `<div class="text-charcoal/10 group-hover/card:text-sepia/20 transition-colors duration-300"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="0.7"><path d="M20 0 L20 20 L0 20"/><path d="M20 0 L20 12 L8 20" opacity="0.5"/></svg></div>` +
      `</div>` +
      `<div class="space-y-0">${tools}</div>` +
      (cat.artifact
        ? `<div class="mt-5 pt-4 border-t border-charcoal/8"><div class="flex items-center gap-2 mb-2"><div class="h-px w-3 bg-sepia/30"></div><span class="font-mono text-[9px] text-sepia/55 tracking-[0.24em] uppercase">Artifact</span></div><div class="flex items-center justify-between gap-3"><span class="font-mono text-[11px] text-sepia tracking-wide">${cat.artifact.label}</span><span class="font-serif text-[10px] text-sepia/45 italic">${cat.artifact.note}</span></div></div>`
        : `<div class="mt-5 pt-4 border-t border-charcoal/8 flex items-center gap-2"><div class="h-px w-3 bg-sepia/30"></div><span class="font-serif text-[10px] text-sepia/45 italic">${cat.note}</span></div>`
      ) +
    `</article>`;
  }).join('');

  const LANG_COLORS = {
    rust: '#dea584', c: '#555555', cpp: '#f34b7d', python: '#3572A5',
    javascript: '#f1e05a', typescript: '#3178c6', java: '#b07219',
  };

  const langButtons = LANGUAGES.map((lang, i) => {
    const color = LANG_COLORS[lang.id] || '#8b7355';
    return `<button class="ws-lang font-mono text-[10px] px-2.5 py-1.5 rounded-sm transition-all duration-200 whitespace-nowrap ${i === 0 ? 'ws-lang-active' : 'text-charcoal/40 hover:text-charcoal'}" data-lang="${lang.id}"><span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style="background:${color}"></span>${lang.moniker}</button>`;
  }).join('');

  return `<section class="py-28 px-8 md:px-20 relative overflow-hidden" id="techstack">` +
    `<div class="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none text-charcoal" style="opacity:0.025" aria-hidden="true">` +
      `<svg width="280" height="280" viewBox="0 0 280 280" fill="none" stroke="currentColor">` +
        `<circle cx="140" cy="140" r="130" stroke-width="0.5"/><circle cx="140" cy="140" r="100" stroke-width="0.4"/><circle cx="140" cy="140" r="60" stroke-width="0.4"/><circle cx="140" cy="140" r="20" stroke-width="0.5"/>` +
        `<line x1="140" y1="10" x2="140" y2="270" stroke-width="0.5"/><line x1="10" y1="140" x2="270" y2="140" stroke-width="0.5"/>` +
        `<line x1="47" y1="47" x2="233" y2="233" stroke-width="0.3"/><line x1="233" y1="47" x2="47" y2="233" stroke-width="0.3"/>` +
        `<polygon points="140,10 134,35 140,28 146,35" fill="currentColor"/><polygon points="140,270 134,245 140,252 146,245" fill="currentColor"/>` +
        `<polygon points="10,140 35,134 28,140 35,146" fill="currentColor"/><polygon points="270,140 245,134 252,140 245,146" fill="currentColor"/>` +
      `</svg>` +
    `</div>` +
    `<div class="flex items-center gap-3 mb-16"><span class="font-mono text-[10px] text-sepia/50 tracking-[0.25em] uppercase">Field Kit</span><div class="h-px flex-1 max-w-xs bg-charcoal/8"></div></div>` +
    `<div class="mb-16">` +
      `<div class="flex items-center gap-3 mb-3">` +
        `<h2 class="font-serif text-3xl md:text-4xl text-charcoal" style="font-weight:500">The Workshop</h2>` +
        `<button id="open-forge" class="forge-fab inline-flex items-center justify-center p-2.5 bg-paper border border-sepia/30 rounded-full shadow-lg hover:shadow-xl hover:border-sepia/50 transition-all duration-300 cursor-pointer group" title="Enter the Forge">` +
          `<svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="forge-fab-icon">` +
            `<polyline points="1,7.5 5,3.5 1,0" transform="translate(0, 1)" />` +
            `<line x1="7" y1="8" x2="14" y2="8" />` +
          `</svg>` +
        `</button>` +
        `<span class="forge-fab-hint font-mono text-[10px] text-charcoal/0 tracking-wider transition-colors duration-300">Enter the Forge</span>` +
      `</div>` +
      `<p class="font-serif text-base text-charcoal/50 italic">Tools chosen for precision, not popularity.</p>` +
    `</div>` +
    `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start" id="techstack-grid">${cards}</div>` +

    // ── Workshop Overlay ──
    `<div id="forge-overlay" class="forge-overlay">` +
      `<div class="forge-panel" data-lenis-prevent>` +
        // Corner brackets
        `<div class="forge-corner forge-corner-tl"></div>` +
        `<div class="forge-corner forge-corner-tr"></div>` +
        `<div class="forge-corner forge-corner-bl"></div>` +
        `<div class="forge-corner forge-corner-br"></div>` +

        // Title bar
        `<div class="forge-titlebar flex items-center justify-between px-5 py-3">` +
          `<div class="flex items-center gap-3">` +
            `<div class="forge-traffic-lights flex gap-2">` +
              `<button id="close-forge" class="forge-tl forge-tl-close" title="Close"></button>` +
              `<button class="forge-tl forge-tl-minimize" title="Minimize"></button>` +
              `<button class="forge-tl forge-tl-maximize" title="Maximize"></button>` +
            `</div>` +
            `<span class="font-serif text-xs text-charcoal/40 italic ml-1">The Forge</span>` +
          `</div>` +
          `<div class="flex items-center gap-2">` +
            `<button id="forge-font-dec" class="forge-title-btn" title="Decrease font size (Ctrl+-)">` +
              `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><text x="1" y="10" font-size="9" font-family="monospace" fill="currentColor" stroke="none">A</text><line x1="3" y1="11" x2="9" y2="11" stroke-width="1"/></svg>` +
            `</button>` +
            `<span id="forge-font-size" class="font-mono text-[9px] text-charcoal/25 w-6 text-center">13</span>` +
            `<button id="forge-font-inc" class="forge-title-btn" title="Increase font size (Ctrl+/)">` +
              `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><text x="0" y="10" font-size="11" font-family="monospace" fill="currentColor" stroke="none">A</text></svg>` +
            `</button>` +
            `<div class="w-px h-3 bg-charcoal/10 mx-1"></div>` +
            `<button id="forge-fullscreen" class="forge-title-btn" title="Toggle fullscreen (F11)">` +
              `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><polyline points="1,4 1,1 4,1"/><polyline points="8,1 11,1 11,4"/><polyline points="11,8 11,11 8,11"/><polyline points="4,11 1,11 1,8"/></svg>` +
            `</button>` +
            `<button id="forge-help-btn" class="forge-title-btn" title="Keyboard shortcuts (?)">?` +
            `</button>` +
            `<div class="w-px h-3 bg-charcoal/10 mx-1"></div>` +
            `<span class="forge-lang-badge font-mono text-[9px] text-charcoal/30 tracking-wider" id="forge-lang-label">${LANGUAGES[0].label}</span>` +
          `</div>` +
        `</div>` +

        // Language selector
        `<div class="ws-langbar flex items-center gap-1 px-5 py-2 overflow-x-auto">` +
          `${langButtons}` +
          `<span class="ml-auto font-mono text-[8px] text-charcoal/15 tracking-wider shrink-0 hidden md:inline">⌘ + ⏎</span>` +
        `</div>` +

        // Editor + Output
        `<div class="forge-workspace">` +
          `<div class="forge-pane relative">` +
            `<div class="ws-editor-label">EDITOR</div>` +
            `<div class="forge-lines" id="forge-lines">1</div>` +
            `<div class="forge-current-line" id="forge-current-line"></div>` +
            `<textarea id="forge-editor" class="ws-editor" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">${LANGUAGES[0].example}</textarea>` +
          `</div>` +
          `<div class="forge-pane relative">` +
            `<div class="ws-output-label flex items-center gap-2">OUTPUT<button id="forge-copy" class="forge-copy-btn opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono text-[8px] text-charcoal/20 hover:text-charcoal/50 tracking-wider" title="Copy output">COPY</button></div>` +
            `<textarea id="forge-output" class="ws-output" readonly spellcheck="false"></textarea>` +
          `</div>` +
        `</div>` +

        // Stdin panel
        `<div class="forge-stdin" id="forge-stdin-panel" style="display:none">` +
          `<div class="flex items-center justify-between mb-1">` +
            `<span class="font-mono text-[9px] text-charcoal/30 tracking-wider uppercase">Stdin</span>` +
            `<button id="forge-stdin-close" class="font-mono text-[9px] text-charcoal/20 hover:text-charcoal/50">✕</button>` +
          `</div>` +
          `<textarea id="forge-stdin" class="forge-stdin-input" placeholder="Enter standard input…" rows="2" spellcheck="false"></textarea>` +
        `</div>` +

        // Bottom bar
        `<div class="ws-statusbar flex items-center justify-between px-5 py-2">` +
          `<div class="flex items-center gap-3">` +
            `<span id="forge-status" class="font-mono text-[10px] text-charcoal/30">Ready</span>` +
            `<button id="forge-stdin-toggle" class="forge-status-btn font-mono text-[9px] text-charcoal/20 hover:text-charcoal/50 tracking-wider" title="Toggle stdin input">STDIN</button>` +
          `</div>` +
          `<div class="flex items-center gap-2">` +
            `<button id="forge-download" class="forge-status-btn font-mono text-[9px] text-charcoal/20 hover:text-charcoal/50 tracking-wider" title="Download output">` +
              `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" class="inline mr-0.5"><path d="M5 1v6M2 5l3 3 3-3"/><line x1="1" y1="9" x2="9" y2="9"/></svg>SAVE` +
            `</button>` +
            `<button id="forge-share" class="forge-status-btn font-mono text-[9px] text-charcoal/20 hover:text-charcoal/50 tracking-wider" title="Copy shareable link">` +
              `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" class="inline mr-0.5"><circle cx="7.5" cy="2.5" r="1.5"/><circle cx="2.5" cy="5" r="1.5"/><circle cx="7.5" cy="7.5" r="1.5"/><line x1="3.8" y1="4.3" x2="6.2" y2="3.2"/><line x1="3.8" y1="5.7" x2="6.2" y2="6.8"/></svg>SHARE` +
            `</button>` +
            `<button id="forge-export-img" class="forge-status-btn font-mono text-[9px] text-charcoal/20 hover:text-charcoal/50 tracking-wider" title="Export as image">` +
              `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" class="inline mr-0.5"><rect x="1" y="1" width="8" height="8" rx="1"/><circle cx="3.5" cy="3.5" r="1"/><polyline points="1,7 4,4.5 6,6 7.5,5 9,7"/></svg>IMAGE` +
            `</button>` +
            `<div class="w-px h-3 bg-charcoal/10"></div>` +
            `<button id="forge-run" class="ws-run-btn font-mono text-[11px] tracking-wider px-5 py-2 bg-charcoal text-paper rounded-sm hover:bg-sepia transition-colors duration-200 flex items-center gap-2 disabled:opacity-40">` +
              `<span><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><polygon points="2,0 12,6 2,12"/></svg></span><span>RUN</span>` +
            `</button>` +
          `</div>` +
        `</div>` +

        // Terminal
        `<div class="forge-terminal">` +
          `<span class="forge-terminal-prompt">$</span>` +
          `<input id="forge-terminal-input" class="forge-terminal-input" type="text" placeholder="type a command…" autocomplete="off" spellcheck="false" />` +
        `</div>` +
      `</div>` +
    `</div>` +

    // ── Help modal ──
    `<div id="forge-help-modal" class="forge-help-overlay" style="display:none">` +
      `<div class="forge-help-panel">` +
        `<div class="flex items-center justify-between mb-4">` +
          `<h3 class="font-serif text-sm text-charcoal" style="font-weight:500">Keyboard Shortcuts</h3>` +
          `<button id="forge-help-close" class="forge-title-btn">✕</button>` +
        `</div>` +
        `<div class="space-y-2 font-mono text-[11px]">` +
          `<div class="flex justify-between"><span class="text-charcoal/50">Run code</span><span class="text-charcoal/30">Ctrl + Enter</span></div>` +
          `<div class="flex justify-between"><span class="text-charcoal/50">Clear output</span><span class="text-charcoal/30">Ctrl + K</span></div>` +
          `<div class="flex justify-between"><span class="text-charcoal/50">Clear editor</span><span class="text-charcoal/30">Ctrl + L</span></div>` +
          `<div class="flex justify-between"><span class="text-charcoal/50">Increase font</span><span class="text-charcoal/30">Ctrl + /</span></div>` +
          `<div class="flex justify-between"><span class="text-charcoal/50">Decrease font</span><span class="text-charcoal/30">Ctrl + -</span></div>` +
          `<div class="flex justify-between"><span class="text-charcoal/50">Fullscreen</span><span class="text-charcoal/30">F11</span></div>` +
          `<div class="flex justify-between"><span class="text-charcoal/50">Close overlay</span><span class="text-charcoal/30">Escape</span></div>` +
          `<div class="flex justify-between"><span class="text-charcoal/50">Command history</span><span class="text-charcoal/30">↑ / ↓</span></div>` +
          `<div class="flex justify-between"><span class="text-charcoal/50">Insert tab</span><span class="text-charcoal/30">Tab</span></div>` +
          `<div class="flex justify-between"><span class="text-charcoal/50">Help</span><span class="text-charcoal/30">?</span></div>` +
        `</div>` +
        `<div class="mt-4 pt-3 border-t border-charcoal/8 font-mono text-[9px] text-charcoal/20">The Workshop — multi-language code runner</div>` +
      `</div>` +
    `</div>` +
  `</section>`;
}

// ── Init ──────────────────────────────────────────────────────

export function initTechStack(lenis) {
  const cards = document.querySelectorAll('.techstack-card');
  const forgeOverlay = document.getElementById('forge-overlay');
  const openBtn = document.getElementById('open-forge');
  const closeBtn = document.getElementById('close-forge');
  const editor = document.getElementById('forge-editor');
  const output = document.getElementById('forge-output');
  const runBtn = document.getElementById('forge-run');
  const status = document.getElementById('forge-status');
  const langBtns = document.querySelectorAll('.ws-lang');
  const langLabel = document.getElementById('forge-lang-label');
  const linesEl = document.getElementById('forge-lines');
  const copyBtn = document.getElementById('forge-copy');
  const panel = document.querySelector('.forge-panel');
  const currentLine = document.getElementById('forge-current-line');
  const termInput = document.getElementById('forge-terminal-input');
  const fontDec = document.getElementById('forge-font-dec');
  const fontInc = document.getElementById('forge-font-inc');
  const fontLabel = document.getElementById('forge-font-size');
  const fullscreenBtn = document.getElementById('forge-fullscreen');
  const helpBtn = document.getElementById('forge-help-btn');
  const helpModal = document.getElementById('forge-help-modal');
  const helpClose = document.getElementById('forge-help-close');
  const stdinPanel = document.getElementById('forge-stdin-panel');
  const stdinInput = document.getElementById('forge-stdin');
  const stdinToggle = document.getElementById('forge-stdin-toggle');
  const stdinClose = document.getElementById('forge-stdin-close');
  const downloadBtn = document.getElementById('forge-download');
  const shareBtn = document.getElementById('forge-share');
  const exportImgBtn = document.getElementById('forge-export-img');

  let currentLang = LANGUAGES[0].id;
  let running = false;
  let fontSize = 13;
  let commandHistory = [];
  let commandHistoryIdx = -1;
  let recentExecutions = [];
  let isFullscreen = false;

  // ── Auto-save helpers ──
  function saveKey(langId) { return `forge-code-${langId}`; }
  function saveCode(langId, code) { try { localStorage.setItem(saveKey(langId), code); } catch(e) {} }
  function loadCode(langId) { try { return localStorage.getItem(saveKey(langId)); } catch(e) { return null; } }

  // ── Line numbers ──
  function updateLines() {
    if (!linesEl || !editor) return;
    const count = (editor.value.match(/\n/g) || []).length + 1;
    linesEl.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
  }

  // ── Current line highlight ──
  function updateCurrentLine() {
    if (!currentLine || !editor) return;
    const pos = editor.selectionStart;
    const textBefore = editor.value.substring(0, pos);
    const lineNum = textBefore.split('\n').length;
    const cs = getComputedStyle(editor);
    const lh = parseFloat(cs.lineHeight);
    const pt = parseFloat(cs.paddingTop);
    const st = editor.scrollTop;
    const top = pt + (lineNum - 1) * lh - st;
    currentLine.style.top = top + 'px';
    currentLine.style.height = lh + 'px';
  }

  // ── Font size ──
  function applyFontSize() {
    if (editor) editor.style.fontSize = fontSize + 'px';
    if (output) output.style.fontSize = fontSize + 'px';
    if (fontLabel) fontLabel.textContent = fontSize;
    updateLines();
    updateCurrentLine();
  }
  function changeFontSize(delta) {
    fontSize = Math.max(10, Math.min(22, fontSize + delta));
    applyFontSize();
  }

  // ── Lenis prevention ──
  if (panel) panel.setAttribute('data-lenis-prevent', '');

  // ── Card animations ──
  if (cards.length) {
    import('gsap').then(({ default: gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        cards.forEach((card, i) => {
          const icon = card.querySelector('.techstack-card-icon');
          gsap.to(card, { scrollTrigger: { trigger: card, start: 'top 88%' }, opacity: 1, y: 0, duration: 0.8, delay: i * 0.08, ease: 'power3.out' });
          if (icon) {
            card.addEventListener('mouseenter', () => gsap.to(icon, { y: -2, rotation: -2, duration: 0.22, ease: 'power2.out' }));
            card.addEventListener('mouseleave', () => gsap.to(icon, { y: 0, rotation: 0, duration: 0.22, ease: 'power2.out' }));
          }
        });
      });
    });
  }

  // ── Overlay open/close ──
  function closeOverlay() {
    forgeOverlay?.classList.remove('forge-open');
    document.body.classList.remove('forge-open');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    if (isFullscreen && document.fullscreenElement) document.exitFullscreen();
  }

  if (forgeOverlay && openBtn && closeBtn) {
    openBtn.addEventListener('click', () => {
      forgeOverlay.classList.add('forge-open');
      document.body.classList.add('forge-open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      setTimeout(() => editor?.focus(), 100);
    });
    closeBtn.addEventListener('click', closeOverlay);
    forgeOverlay.addEventListener('click', (e) => { if (e.target === forgeOverlay) closeOverlay(); });
  }

  // ── Language selector ──
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const langId = btn.dataset.lang;
      const lang = LANGUAGES.find(l => l.id === langId);
      if (!lang) return;

      // Save current code before switching
      if (editor) saveCode(currentLang, editor.value);

      currentLang = langId;
      // Load saved code or example
      const saved = loadCode(langId);
      editor.value = saved !== null ? saved : lang.example;
      output.value = '';
      if (langLabel) langLabel.textContent = lang.label;
      status.textContent = `Ready · ${lang.label}`;
      status.className = 'font-mono text-[10px] text-charcoal/30';
      updateLines();
      updateCurrentLine();

      langBtns.forEach(b => {
        b.classList.remove('ws-lang-active');
        b.classList.add('text-charcoal/40');
      });
      btn.classList.add('ws-lang-active');
      btn.classList.remove('text-charcoal/40');
    });
  });

  // ── Editor ──
  if (editor) {
    editor.addEventListener('input', () => {
      updateLines();
      updateCurrentLine();
      saveCode(currentLang, editor.value);
    });
    editor.addEventListener('scroll', () => {
      if (linesEl) linesEl.scrollTop = editor.scrollTop;
      updateCurrentLine();
    });
    editor.addEventListener('click', updateCurrentLine);
    editor.addEventListener('keyup', updateCurrentLine);
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = editor.selectionStart;
        editor.value = editor.value.substring(0, s) + '  ' + editor.value.substring(editor.selectionEnd);
        editor.selectionStart = editor.selectionEnd = s + 2;
        updateLines();
        saveCode(currentLang, editor.value);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); execute(); }
    });
  }

  // ── Run ──
  if (runBtn) runBtn.addEventListener('click', execute);

  // ── Copy output ──
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value).then(() => {
        copyBtn.textContent = 'COPIED';
        setTimeout(() => { copyBtn.textContent = 'COPY'; }, 1500);
      });
    });
  }

  // ── Font size buttons ──
  if (fontDec) fontDec.addEventListener('click', () => changeFontSize(-1));
  if (fontInc) fontInc.addEventListener('click', () => changeFontSize(1));

  // ── Fullscreen ──
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      (panel || document.documentElement).requestFullscreen().then(() => { isFullscreen = true; }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => { isFullscreen = false; }).catch(() => {});
    }
  }
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

  // ── Help modal ──
  function toggleHelp() {
    if (!helpModal) return;
    const visible = helpModal.style.display !== 'none';
    helpModal.style.display = visible ? 'none' : 'flex';
  }
  if (helpBtn) helpBtn.addEventListener('click', toggleHelp);
  if (helpClose) helpClose.addEventListener('click', () => { helpModal.style.display = 'none'; });
  if (helpModal) helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.style.display = 'none'; });

  // ── Stdin panel ──
  if (stdinToggle) {
    stdinToggle.addEventListener('click', () => {
      const visible = stdinPanel.style.display !== 'none';
      stdinPanel.style.display = visible ? 'none' : 'block';
      stdinToggle.classList.toggle('forge-status-btn-active', !visible);
    });
  }
  if (stdinClose) stdinClose.addEventListener('click', () => {
    stdinPanel.style.display = 'none';
    stdinToggle?.classList.remove('forge-status-btn-active');
  });

  // ── Download output ──
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const text = output?.value;
      if (!text) return;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forge-output-${currentLang}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      downloadBtn.textContent = 'SAVED';
      setTimeout(() => { downloadBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" class="inline mr-0.5"><path d="M5 1v6M2 5l3 3 3-3"/><line x1="1" y1="9" x2="9" y2="9"/></svg>SAVE`; }, 1500);
    });
  }

  // ── Share code ──
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const code = editor?.value || '';
      const encoded = btoa(unescape(encodeURIComponent(code)));
      const url = `${window.location.origin}${window.location.pathname}#code=${encoded}&lang=${currentLang}`;
      navigator.clipboard.writeText(url).then(() => {
        shareBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" class="inline mr-0.5"><polyline points="2,5 4.5,7.5 8,3"/></svg>LINK COPIED`;
        setTimeout(() => {
          shareBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" class="inline mr-0.5"><circle cx="7.5" cy="2.5" r="1.5"/><circle cx="2.5" cy="5" r="1.5"/><circle cx="7.5" cy="7.5" r="1.5"/><line x1="3.8" y1="4.3" x2="6.2" y2="3.2"/><line x1="3.8" y1="5.7" x2="6.2" y2="6.8"/></svg>SHARE`;
        }, 2000);
      });
    });
  }

  // ── Load shared code from URL hash ──
  function loadFromHash() {
    const hash = window.location.hash;
    if (!hash || !hash.includes('code=')) return;
    try {
      const params = new URLSearchParams(hash.substring(1));
      const code = decodeURIComponent(escape(atob(params.get('code'))));
      const lang = params.get('lang');
      if (code && lang) {
        const langObj = LANGUAGES.find(l => l.id === lang);
        if (langObj && editor) {
          editor.value = code;
          currentLang = lang;
          if (langLabel) langLabel.textContent = langObj.label;
          langBtns.forEach(b => {
            b.classList.remove('ws-lang-active');
            b.classList.add('text-charcoal/40');
            if (b.dataset.lang === lang) {
              b.classList.add('ws-lang-active');
              b.classList.remove('text-charcoal/40');
            }
          });
          updateLines();
          updateCurrentLine();
          // Auto-open overlay
          if (forgeOverlay) {
            forgeOverlay.classList.add('forge-open');
            document.body.classList.add('forge-open');
            document.body.style.overflow = 'hidden';
            if (lenis) lenis.stop();
            setTimeout(() => editor?.focus(), 100);
          }
        }
      }
    } catch(e) {}
  }
  loadFromHash();
  window.addEventListener('hashchange', loadFromHash);

  // ── Export as image (canvas) ──
  if (exportImgBtn) {
    exportImgBtn.addEventListener('click', exportCodeImage);
  }

  function exportCodeImage() {
    const code = editor?.value || '';
    if (!code.trim()) return;
    const lines = code.split('\n');
    const lineCount = lines.length;
    const isNight = document.body.classList.contains('night-mode');

    const dpr = 2;
    const w = 800;
    const lineH = 22;
    const padTop = 56;
    const padBot = 24;
    const padSide = 32;
    const lineNumW = 40;
    const h = padTop + lineCount * lineH + padBot;

    const canvas = document.createElement('canvas');
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (isNight) {
      grad.addColorStop(0, '#1b2435');
      grad.addColorStop(1, '#141b29');
    } else {
      grad.addColorStop(0, '#f9f7f0');
      grad.addColorStop(1, '#f0e8d8');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle grain overlay
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Title bar
    const tbH = 40;
    ctx.fillStyle = isNight ? 'rgba(20,27,41,0.6)' : 'rgba(230,223,210,0.6)';
    ctx.fillRect(0, 0, w, tbH);
    ctx.strokeStyle = isNight ? 'rgba(155,178,214,0.08)' : 'rgba(139,115,85,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, tbH);
    ctx.lineTo(w, tbH);
    ctx.stroke();

    // Traffic lights
    const tlY = tbH / 2;
    const tlColors = ['#c0604a', '#d4a855', '#7a9a6b'];
    tlColors.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(20 + i * 20, tlY, 5, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    });

    // Language badge
    const lang = LANGUAGES.find(l => l.id === currentLang);
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = isNight ? 'rgba(186,197,216,0.35)' : 'rgba(43,43,43,0.3)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(lang ? lang.label : currentLang, w - padSide, tlY);
    ctx.textAlign = 'left';

    // Watermark
    ctx.font = 'italic 10px "EB Garamond", serif';
    ctx.fillStyle = isNight ? 'rgba(186,197,216,0.12)' : 'rgba(43,43,43,0.1)';
    ctx.textAlign = 'right';
    ctx.fillText('The Workshop', w - padSide, h - 10);
    ctx.textAlign = 'left';

    // Code area
    ctx.font = '13px "IBM Plex Mono", monospace';
    ctx.textBaseline = 'top';

    lines.forEach((line, i) => {
      const y = padTop + i * lineH;

      // Line number
      ctx.fillStyle = isNight ? 'rgba(186,197,216,0.15)' : 'rgba(43,43,43,0.15)';
      ctx.textAlign = 'right';
      ctx.fillText(String(i + 1), padSide + lineNumW - 10, y + 4);
      ctx.textAlign = 'left';

      // Syntax highlighted tokens
      const tokens = tokenizeLine(line, currentLang);
      let x = padSide + lineNumW;
      for (const token of tokens) {
        ctx.fillStyle = isNight
          ? (token.type === 'text' ? '#c8d4e8'
            : token.type === 'keyword' ? '#d8b86a'
            : token.type === 'string' ? '#8aba7a'
            : token.type === 'comment' ? '#6a7a8a'
            : token.type === 'number' ? '#d4a060'
            : '#c8d4e8')
          : TOKEN_COLORS[token.type] || TOKEN_COLORS.text;
        ctx.fillText(token.text, x, y + 4);
        x += ctx.measureText(token.text).width;
      }
    });

    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forge-${currentLang}-code.png`;
      a.click();
      URL.revokeObjectURL(url);
      exportImgBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" class="inline mr-0.5"><polyline points="2,5 4.5,7.5 8,3"/></svg>EXPORTED`;
      setTimeout(() => {
        exportImgBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" class="inline mr-0.5"><rect x="1" y="1" width="8" height="8" rx="1"/><circle cx="3.5" cy="3.5" r="1"/><polyline points="1,7 4,4.5 6,6 7.5,5 9,7"/></svg>IMAGE`;
      }, 2000);
    }, 'image/png');
  }

  // ── Init line numbers + current line ──
  updateLines();
  updateCurrentLine();

  // ── Terminal commands ──
  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      // Command history navigation
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
          commandHistoryIdx = Math.max(0, commandHistoryIdx - 1);
          termInput.value = commandHistory[commandHistoryIdx] || '';
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (commandHistoryIdx < commandHistory.length - 1) {
          commandHistoryIdx++;
          termInput.value = commandHistory[commandHistoryIdx] || '';
        } else {
          commandHistoryIdx = commandHistory.length;
          termInput.value = '';
        }
        return;
      }

      if (e.key !== 'Enter') return;
      const cmd = termInput.value.trim().toLowerCase();
      termInput.value = '';
      if (!cmd) return;

      commandHistory.push(cmd);
      commandHistoryIdx = commandHistory.length;

      if (cmd === 'run' || cmd === 'exec') {
        execute();
      } else if (cmd === 'clear' || cmd === 'cls') {
        output.value = '';
        output.className = 'ws-output';
        status.textContent = 'cleared';
        status.className = 'font-mono text-[10px] text-charcoal/30';
      } else if (cmd === 'help') {
        output.value = 'Commands:\n  run / exec   — execute code\n  clear / cls   — clear output\n  lang <name>   — switch language\n  history       — recent executions\n  help          — show this message\n  whoami        — about the forge';
        output.className = 'ws-output ws-output-success';
      } else if (cmd.startsWith('lang ')) {
        const name = cmd.slice(5).trim();
        const lang = LANGUAGES.find(l => l.id === name || l.label.toLowerCase() === name);
        if (lang) {
          const btn = document.querySelector(`.ws-lang[data-lang="${lang.id}"]`);
          if (btn) btn.click();
          status.textContent = `switched to ${lang.label}`;
          status.className = 'font-mono text-[10px] text-charcoal/30';
        } else {
          output.value = `Unknown language: "${name}"\nAvailable: ${LANGUAGES.map(l => l.id).join(', ')}`;
          output.className = 'ws-output ws-output-error';
        }
      } else if (cmd === 'whoami') {
        output.value = 'The Forge- a multi-language code runner.\nSupports Rust, C, C++, Python, JavaScript, TypeScript, Java.\nPowered by Judge0 CE API.';
        output.className = 'ws-output ws-output-success';
      } else if (cmd === 'history') {
        if (recentExecutions.length === 0) {
          output.value = 'No recent executions.';
          output.className = 'ws-output ws-output-success';
        } else {
          const lines = recentExecutions.slice(0, 10).map((ex, i) => {
            const t = new Date(ex.time).toLocaleTimeString();
            const lang = LANGUAGES.find(l => l.id === ex.lang);
            const preview = ex.code.split('\n')[0].substring(0, 50);
            return `${i + 1}. [${t}] ${lang?.label || ex.lang} — ${preview}…`;
          });
          output.value = `Recent executions:\n${lines.join('\n')}`;
          output.className = 'ws-output ws-output-success';
        }
      } else {
        output.value = `Unknown command: "${cmd}"\nType "help" for available commands.`;
        output.className = 'ws-output ws-output-error';
      }
    });
  }

  // ── Execute ──
  async function execute() {
    const code = editor?.value?.trim();
    if (!code || running) return;

    const stdin = stdinInput?.value || '';

    running = true;
    runBtn.disabled = true;
    runBtn.classList.add('ws-run-pulse');
    output.value = '';
    output.className = 'ws-output';
    status.textContent = 'Compiling…';
    status.className = 'font-mono text-[10px] text-sepia/60';

    const t0 = performance.now();

    try {
      const result = await runCode(currentLang, code, stdin);
      const ms = Math.round(performance.now() - t0);
      if (result.stderr) {
        output.value = result.stderr;
        output.classList.add('ws-output-error');
        status.textContent = `error · ${ms}ms`;
        status.className = 'font-mono text-[10px] text-red-500/60';
      } else {
        output.value = result.stdout || '(no output)';
        output.classList.add('ws-output-success');
        status.textContent = `ok · ${ms}ms`;
        status.className = 'font-mono text-[10px] text-charcoal/40';
      }
      // Track execution
      recentExecutions.unshift({ lang: currentLang, code: editor.value, output: output.value, time: Date.now() });
      if (recentExecutions.length > 20) recentExecutions.pop();
    } catch (e) {
      output.value = `Error: ${e.message}`;
      output.classList.add('ws-output-error');
      status.textContent = 'failed';
      status.className = 'font-mono text-[10px] text-red-500/60';
    }

    runBtn.classList.remove('ws-run-pulse');
    running = false;
    runBtn.disabled = false;
  }

  // ── Global keyboard shortcuts ──
  document.addEventListener('keydown', (e) => {
    const isOpen = forgeOverlay?.classList.contains('forge-open');
    if (!isOpen) return;

    // Escape handled above in overlay close

    // Ctrl+K: clear output
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      output.value = '';
      output.className = 'ws-output';
      status.textContent = 'cleared';
      status.className = 'font-mono text-[10px] text-charcoal/30';
    }

    // Ctrl+L: clear editor
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      editor.value = '';
      updateLines();
      updateCurrentLine();
      saveCode(currentLang, '');
      editor.focus();
    }

    // Ctrl+/: increase font
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      changeFontSize(1);
    }

    // Ctrl+-: decrease font
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      changeFontSize(-1);
    }

    // F11: fullscreen
    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullscreen();
    }

    // ?: show help (only when not typing in an input)
    if (e.key === '?' && document.activeElement !== editor && document.activeElement !== termInput && document.activeElement !== stdinInput) {
      e.preventDefault();
      toggleHelp();
    }
  });

  // ── Load saved code for default language ──
  const savedDefault = loadCode(currentLang);
  if (savedDefault !== null && editor) {
    editor.value = savedDefault;
    updateLines();
    updateCurrentLine();
  }
}
