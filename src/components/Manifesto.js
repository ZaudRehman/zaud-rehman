export default function Manifesto() {
  return `
    <section class="py-24 px-6 md:px-20 max-w-4xl mx-auto text-center" id="manifesto">
      <p class="font-serif text-2xl md:text-4xl leading-relaxed text-charcoal">
        I treat code like composition. Clean functions. <br> Tight loops.
      </p>
      <div class="w-16 h-[1px] bg-charcoal/30 mx-auto my-12"></div>
      <p class="font-serif text-xl md:text-2xl text-charcoal/80">
        Currently building a deterministic kernel <span class="font-mono text-base">(AchronOS)</span> and optimizing probabilistic data structures in Rust.
      </p>
      <p class="mt-8 font-serif text-lg text-charcoal/60 italic">
        After hours: I write poetry. Because engineering without art is just... engineering.
      </p>
    </section>
  `;
}
