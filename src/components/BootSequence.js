import gsap from "gsap";

export default function BootSequence() {
  return `
    <div id="boot-overlay" class="fixed inset-0 bg-[#1a1a1a] z-[100] flex flex-col justify-end p-8 md:p-16 font-mono text-xs md:text-sm text-[#d4af37] overflow-hidden cursor-wait">
      <div id="boot-log" class="max-w-2xl whitespace-pre-wrap leading-tight font-light opacity-90"></div>
      <div class="mt-4 animate-pulse">_</div>
    </div>
  `;
}

export function runBootSequence(onComplete) {
  const log = document.getElementById("boot-log");
  const overlay = document.getElementById("boot-overlay");
  
  // The "Backend" story told through logs
  const lines = [
    "AchronOS Kernel v0.22.4-alpha ... [OK]",
    "Initializing memory allocator (jemalloc) ... [OK]",
    "Mounting /dev/soul as read-write ... [OK]",
    "Checking entropy pool ... Sufficient",
    "Loading rustc 1.76.0-nightly ... [OK]",
    "Compiling poetry_module.rs ...",
    "   Compiling gazebound v0.1.0",
    "   Compiling afsaana v0.2.0",
    "   Finished release [optimized] target(s) in 0.42s",
    "Starting interface daemon ...",
    "Connecting to visual cortex ... [ESTABLISHED]",
    "Exiting kernel space ...",
    "Hello, Zaud."
  ];

  let tl = gsap.timeline({
    onComplete: () => {
      // The "Curtain Reveal"
      gsap.to(overlay, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
        onComplete: () => {
          overlay.remove(); // Clean up DOM
          onComplete(); // Start the main site animations
        }
      });
    }
  });

  // Type out lines
  lines.forEach((line, i) => {
    tl.to(log, {
      duration: Math.random() * 0.1 + 0.05,
      text: { value: lines.slice(0, i + 1).join("\n"), delimiter: "" },
      ease: "none",
    });
  });

  return tl;
}
