export default function Footer() {
  return `
    <footer class="relative z-10 bg-paper">
      
      <div class="py-24 px-6 border-t border-charcoal/10">
        <div class="max-w-4xl mx-auto text-center">

          <h2 class="font-serif text-4xl md:text-5xl text-charcoal mb-12">Let's build something.</h2>
          
          <div class="flex flex-col md:flex-row justify-center gap-8 mb-16 font-mono text-sm">
            <a href="mailto:zaudrehman@gmail.com" class="hover:text-gold transition-colors">zaudrehman@gmail.com</a>
            <a href="https://github.com/ZaudRehman" class="hover:text-gold transition-colors">GitHub</a>
            <a href="https://linkedin.com/in/zaud-rehman-31514a288" class="hover:text-gold transition-colors">LinkedIn</a>
            <a href="/resume.pdf" class="text-sepia border-b border-sepia hover:border-transparent transition-all">Download Resume</a>
          </div>

          <p class="font-mono text-xs text-charcoal/30">
            Built with Vite, GSAP, and too much coffee.
          </p>
        </div>
      </div>
    </footer>
  `;
}
