import gsap from "gsap";

export function initWind(lenis) {
  const targets = document.querySelectorAll(".wind");
  if (!targets.length) {
    console.warn("[initWind] No .wind elements found.");
    return;
  }

  // Make transforms predictable
  gsap.set(targets, { transformOrigin: "50% 50%" });

  const apply = (velocity) => {
    // Lenis velocity can be quite large; tune to taste
    const wind = gsap.utils.clamp(-10, 10, velocity * 0.12);

    gsap.to(targets, {
      skewX: -wind,
      rotate: wind * 0.25,
      duration: Math.abs(wind) > 0.2 ? 0.15 : 0.8,
      ease: Math.abs(wind) > 0.2 ? "power1.out" : "elastic.out(1, 0.5)",
      overwrite: "auto",
    });
  };

  if (lenis && typeof lenis.on === "function") {
    lenis.on("scroll", (e) => apply(e.velocity ?? 0));
  } else {
    console.warn("[initWind] Lenis instance not provided; falling back to window scroll.");
    let lastY = window.scrollY;
    gsap.ticker.add(() => {
      const y = window.scrollY;
      const v = y - lastY;
      lastY = y;
      apply(v);
    });
  }
}
