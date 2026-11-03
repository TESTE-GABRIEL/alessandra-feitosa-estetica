/**
 * script.js
 * Data: 2026-11-03
 * Autor: Gabriel / Antigravity
 * Resumo: Controle de animações cinematográficas (GSAP), rolagem suave (Lenis), smart header suave e sutil (sem travamentos) e carrossel de depoimentos para Dra. Alessandra Feitosa.
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

  // 2. Smart Header (Oculta ao descer, reaparece ao subir de forma sutil, devagar e contínua)
  const header = document.getElementById("main-header");
  if (header) {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    let accumulatedDelta = 0;
    const hideThreshold = 30; // 30px de rolagem intencional contínua para baixo
    const showThreshold = 18; // 18px de rolagem intencional contínua para cima

    const handleScroll = (currentY) => {
      // Sempre totalmente visível perto do topo
      if (currentY <= 80) {
        header.classList.remove("-translate-y-full");
        lastScrollY = currentY;
        accumulatedDelta = 0;
        return;
      }

      const delta = currentY - lastScrollY;

      // Se a direção mudou, reseta o acumulador para evitar hesitação/travamento
      if ((delta > 0 && accumulatedDelta < 0) || (delta < 0 && accumulatedDelta > 0)) {
        accumulatedDelta = 0;
      }

      accumulatedDelta += delta;

      // Rolagem deliberada para baixo: recolhe sutilmente
      if (accumulatedDelta > hideThreshold) {
        header.classList.add("-translate-y-full");
      }
      // Rolagem deliberada para cima: reaparece calmamente
      else if (accumulatedDelta < -showThreshold) {
        header.classList.remove("-translate-y-full");
      }

      lastScrollY = currentY;
    };

    if (lenis) {
      lenis.on('scroll', (e) => {
        handleScroll(e.scroll);
      });
    } else {
      window.addEventListener("scroll", () => {
        const currentY = window.pageYOffset || document.documentElement.scrollTop;
        handleScroll(currentY);
      }, { passive: true });
    }
  }

  // 3. Animações de FadeIn suave nas seções
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

  // 4. Cinematic Curtain Transition (Navegação via links âncora)
  const navLinks = document.querySelectorAll('header nav a[href^="#"], a[href^="#procedimentos"], a[href^="#resultados"]');
  const curtain = document.getElementById("cinematic-curtain");
  const logoCurtain = curtain ? curtain.querySelector(".logo-curtain, .logo") : null;

  if (curtain && logoCurtain && typeof gsap !== 'undefined') {
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        e.preventDefault();

        // Garante que o header esteja visível na navegação
        if (header) header.classList.remove("-translate-y-full");

        const tl = gsap.timeline();
        
        // Descida da cortina cinematográfica
        tl.to(curtain, {
          y: 0,
          duration: 0.6,
          ease: "power3.inOut"
        })
        // Revelação da marca
        .to(logoCurtain, {
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
        .to(logoCurtain, {
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

  // 5. Carrossel de Depoimentos Reais (WhatsApp Feedbacks)
  const track = document.getElementById("testimonials-track");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const dotsContainer = document.getElementById("carousel-dots");

  if (track && prevBtn && nextBtn) {
    const cards = track.querySelectorAll(".carousel-card");

    // Criação dos dots indicadores
    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      cards.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.className = `size-2.5 rounded-full transition-all duration-300 ${idx === 0 ? "bg-primary w-7" : "bg-white/30 hover:bg-white/60"}`;
        dot.setAttribute("aria-label", `Ir para depoimento ${idx + 1}`);
        dot.addEventListener("click", () => {
          scrollToIndex(idx);
        });
        dotsContainer.appendChild(dot);
      });
    }

    function getCardWidth() {
      if (cards.length === 0) return 300;
      const firstCard = cards[0];
      const gap = 24; // gap-6 do Tailwind
      return firstCard.offsetWidth + gap;
    }

    function scrollToIndex(index) {
      const step = getCardWidth();
      track.scrollTo({
        left: index * step,
        behavior: "smooth"
      });
    }

    prevBtn.addEventListener("click", () => {
      const step = getCardWidth();
      track.scrollBy({
        left: -step,
        behavior: "smooth"
      });
    });

    nextBtn.addEventListener("click", () => {
      const step = getCardWidth();
      track.scrollBy({
        left: step,
        behavior: "smooth"
      });
    });

    // Atualização dos dots no scroll
    track.addEventListener("scroll", () => {
      if (!dotsContainer) return;
      const step = getCardWidth();
      const activeIndex = Math.round(track.scrollLeft / step);
      const dots = dotsContainer.querySelectorAll("button");
      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.className = "size-2.5 rounded-full transition-all duration-300 bg-primary w-7";
        } else {
          dot.className = "size-2.5 rounded-full transition-all duration-300 bg-white/30 hover:bg-white/60";
        }
      });
    });
  }
});
