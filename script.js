/**
 * script.js
 * Data: 2026-11-03
 * Autor: Gabriel / Antigravity
 * Resumo: Controle de animações cinematográficas (GSAP), rolagem suave (Lenis) e transições para o site da Dra. Alessandra Feitosa.
 */

window.addEventListener("DOMContentLoaded", () => {
  // GSAP Registration
  if (typeof gsap !== 'undefined') {
    const plugins = [];
    if (typeof ScrollTrigger !== 'undefined') plugins.push(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') plugins.push(ScrollToPlugin);
    if (typeof SplitText !== 'undefined') plugins.push(SplitText);
    if (plugins.length > 0) {
      gsap.registerPlugin(...plugins);
    }
  } else {
    console.warn("GSAP library not detected.");
  }

  // 1. Instanciação e controle do Lenis (Smooth Scroll)
  // Desativado em telas menores que 1024px conforme recomendação de performance mobile
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

  // 2. Animações de FadeIn suave nas seções
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const sections = document.querySelectorAll("section");
    sections.forEach((section, index) => {
      // Primeira seção renderiza imediatamente sem delay visual
      if (index === 0) return;
      
      gsap.from(section, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none reverse",
        }
      });
    });
  }

  // 3. Cinematic Curtain Transition (Navegação via links âncora)
  const navLinks = document.querySelectorAll('header nav a[href^="#"], a[href^="#procedimentos"]');
  const curtain = document.getElementById("cinematic-curtain");
  const logo = curtain ? curtain.querySelector(".logo") : null;

  if (curtain && logo && typeof gsap !== 'undefined') {
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        e.preventDefault();

        const tl = gsap.timeline();
        
        // Descida da cortina cinematográfica
        tl.to(curtain, {
          y: 0,
          duration: 0.6,
          ease: "power3.inOut"
        })
        // Revelação da marca
        .to(logo, {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.5)"
        }, "-=0.15")
        // Salto do scroll
        .add(() => {
          const headerOffset = 96; // h-24 da classe tailwind
          const elementPosition = targetSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "instant"
          });
        })
        // Ocultação da logo
        .to(logo, {
          opacity: 0,
          scale: 0.85,
          duration: 0.25,
          delay: 0.15
        })
        // Retração da cortina
        .to(curtain, {
          y: "-100%",
          duration: 0.6,
          ease: "power3.inOut"
        });
      });
    });
  }
});
