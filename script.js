/* script.js - Controle de Animações, GSAP e Lenis */

window.addEventListener("DOMContentLoaded", () => {
  // GSAP Registration
  // (Assuming global gsap, ScrollTrigger, ScrollToPlugin, SplitText are loaded via CDN)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof SplitText !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText);
  } else {
    console.warn("GSAP plugins not found.");
  }

  // 1. Instanciação e controle do Lenis (Smooth Scroll Obrigatório)
  // Desativado em telas menores que 1024px conforme recomendação global
  const isMobile = window.innerWidth < 1024;
  
  let lenis;
  if (!isMobile && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    // Sincronização Lenis e ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }
  }

  // 2. Animações de Títulos com SplitText e ScrollTrigger
  if (typeof SplitText !== 'undefined') {
      const titles = document.querySelectorAll("h1, h2");
      titles.forEach(title => {
        const split = new SplitText(title, { types: "words,chars" });
        
        gsap.from(split.chars, {
          opacity: 0,
          y: 20,
          filter: "blur(5px)",
          stagger: 0.02,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: title,
            start: "top 90%",
            toggleActions: "play none none reverse",
          }
        });
      });
  }

  // 3. Efeitos de FadeIn nas Seções
  const sections = document.querySelectorAll("section");
  sections.forEach(section => {
    // Não aplica na primeira seção para não piscar no carregamento
    if (section === sections[0]) return;
    
    gsap.from(section, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reverse",
      }
    });
  });

  // 4. Cinematic Curtain Transition (Navegação via links âncora)
  const navLinks = document.querySelectorAll('header nav a[href^="#"]');
  const curtain = document.getElementById("cinematic-curtain");
  const logo = curtain ? curtain.querySelector(".logo") : null;

  if (curtain && logo) {
      navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const targetId = link.getAttribute("href");
          const targetSection = document.querySelector(targetId);
          
          if (!targetSection) return;
    
          const tl = gsap.timeline();
          
          // Descida da cortina
          tl.to(curtain, {
            y: 0,
            duration: 0.8,
            ease: "power3.inOut"
          })
          // Sugimento do branding
          .to(logo, {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.7)"
          }, "-=0.2")
          // Pulo instantâneo
          .add(() => {
            const headerOffset = 96; // h-24 da classe tailwind
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
            window.scrollTo({
              top: offsetPosition,
              behavior: "instant"
            });
          })
          // Desaparecimento da logo
          .to(logo, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            delay: 0.2
          })
          // Retorno da cortina
          .to(curtain, {
            y: "-100%",
            duration: 0.8,
            ease: "power3.inOut"
          });
        });
      });
  }
});
