import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Heavier scroll-linked effects for capable devices. Returns a cleanup function. */
export function initHighFx(): () => void {
  const cleanups: (() => void)[] = [];
  const ctx = gsap.context(() => {
    heroDrill();
    toolpath();
    turret();
  });
  cleanups.push(() => ctx.revert());

  document.querySelectorAll<HTMLCanvasElement>("canvas[data-fx='sparks']").forEach((c) => cleanups.push(sparks(c)));

  // Physics scenes load lazily when they approach the viewport.
  const physicsIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        physicsIo.unobserve(e.target);
        import("./physics").then((m) => cleanups.push(m.chipsScene(e.target as HTMLElement)));
      }
    },
    { rootMargin: "200px" },
  );
  document.querySelectorAll("[data-physics]").forEach((el) => physicsIo.observe(el));
  cleanups.push(() => physicsIo.disconnect());

  return () => cleanups.forEach((fn) => fn());
}

/** Hero: the drill plunges as the visitor scrolls, cutting the underline into the heading. */
function heroDrill() {
  const hero = document.querySelector<HTMLElement>("[data-fx='hero']");
  if (!hero) return;
  const bit = hero.querySelector("[data-fx='hero-bit']");
  const cut = hero.querySelector("[data-fx='hero-cut']");
  const tl = gsap.timeline({
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom 30%", scrub: 0.6 },
  });
  if (bit) tl.to(bit, { y: 46, ease: "none" }, 0);
  if (cut) tl.fromTo(cut, { scaleX: 0.15 }, { scaleX: 1, ease: "none" }, 0);
}

/** Process: the CNC toolpath is traced in step with scrolling. */
function toolpath() {
  document.querySelectorAll<SVGPathElement>("[data-fx='toolpath'] path[data-path]").forEach((path) => {
    const section = path.closest("section") ?? path;
    gsap.fromTo(
      path,
      { strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top 70%", end: "bottom 60%", scrub: 0.5 },
      },
    );
    const head = path.ownerSVGElement?.querySelector<SVGGElement>("[data-tool]");
    if (head) {
      const len = path.getTotalLength();
      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top 70%", end: "bottom 60%", scrub: 0.5 },
        onUpdate: () => {
          const pt = path.getPointAtLength(state.p * len);
          head.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        },
      });
    }
  });
}

/** Services: the tool-changer turret indexes as the section scrolls past. */
function turret() {
  const el = document.querySelector<SVGGElement>("[data-fx='turret']");
  if (!el) return;
  const section = el.closest("section") ?? el;
  gsap.to(el, {
    rotate: 360,
    transformOrigin: "50% 50%",
    ease: "steps(10)",
    scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.4 },
  });
}

/** Hot chips flying off the drill tip; pauses off-screen to save battery. */
function sparks(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  };
  resize();
  window.addEventListener("resize", resize);

  type P = { x: number; y: number; vx: number; vy: number; life: number };
  const ps: P[] = [];
  let raf = 0;
  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  });
  io.observe(canvas);

  function loop() {
    raf = 0;
    if (!visible || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const ox = w * Number(canvas.dataset.x ?? 0.5);
    const oy = h * Number(canvas.dataset.y ?? 0.6);
    for (let i = 0; i < 2; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const sp = (2 + Math.random() * 4) * dpr;
      ps.push({ x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1 });
    }
    ctx.clearRect(0, 0, w, h);
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.vy += 0.18 * dpr;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.022;
      if (p.life <= 0) {
        ps.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(255, ${140 + 100 * p.life}, 40, ${p.life})`;
      ctx.lineWidth = 1.6 * dpr;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
      ctx.stroke();
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener("resize", resize);
  };
}
