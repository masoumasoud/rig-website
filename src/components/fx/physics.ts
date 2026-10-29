import Matter from "matter-js";

/**
 * Machined parts (nuts, washers, pins, chips) fall into a tray and can be
 * dragged or flicked. Purely decorative; the container's own content stays in the DOM.
 */
export function chipsScene(container: HTMLElement): () => void {
  const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body, Events } = Matter;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "absolute inset-0 size-full";
  container.prepend(canvas);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = container.clientWidth;
  let h = container.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d")!;

  const engine = Engine.create({ gravity: { y: 1 } });
  const wallOpts = { isStatic: true, render: { visible: false } };
  const walls = [
    Bodies.rectangle(w / 2, h + 30, w * 2, 60, wallOpts),
    Bodies.rectangle(-30, h / 2, 60, h * 3, wallOpts),
    Bodies.rectangle(w + 30, h / 2, 60, h * 3, wallOpts),
  ];
  Composite.add(engine.world, walls);

  type Kind = "nut" | "washer" | "pin" | "chip";
  const kinds: Kind[] = ["nut", "washer", "pin", "chip"];
  const scale = Math.max(0.7, Math.min(1.2, w / 900));
  const count = Math.round(Math.min(34, w / 28));
  const bodies: { body: Matter.Body; kind: Kind; size: number }[] = [];

  let dropped = 0;
  const dropTimer = window.setInterval(() => {
    if (dropped >= count) return window.clearInterval(dropTimer);
    const kind = kinds[dropped % kinds.length];
    const size = (18 + Math.random() * 14) * scale;
    const x = 40 + Math.random() * (w - 80);
    const opts = { restitution: 0.35, friction: 0.4, density: 0.004 };
    const body =
      kind === "nut"
        ? Bodies.polygon(x, -40, 6, size, opts)
        : kind === "washer"
          ? Bodies.circle(x, -40, size * 0.9, opts)
          : kind === "pin"
            ? Bodies.rectangle(x, -40, size * 3, size * 0.7, { ...opts, chamfer: { radius: size * 0.3 } })
            : Bodies.trapezoid(x, -40, size * 1.6, size * 0.8, 0.5, opts);
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
    Composite.add(engine.world, body);
    bodies.push({ body, kind, size });
    dropped++;
  }, 90);

  // Dragging only with a mouse: Matter's touch handlers block page scrolling on phones.
  if (window.matchMedia("(pointer: fine)").matches) {
    const mouse = Mouse.create(canvas);
    const m = mouse as unknown as { mousewheel: EventListener };
    canvas.removeEventListener("wheel", m.mousewheel);
    canvas.removeEventListener("mousewheel", m.mousewheel);
    canvas.removeEventListener("DOMMouseScroll", m.mousewheel);
    const drag = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2 } });
    Composite.add(engine.world, drag);
    Events.on(drag, "startdrag", () => (canvas.style.cursor = "grabbing"));
    Events.on(drag, "enddrag", () => (canvas.style.cursor = "grab"));
    canvas.style.cursor = "grab";
  } else {
    canvas.style.pointerEvents = "none";
  }

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (const { body, kind, size } of bodies) {
      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#111214";
      const g = ctx.createLinearGradient(-size, -size, size, size);
      g.addColorStop(0, "#e9ebee");
      g.addColorStop(0.5, "#aeb4bc");
      g.addColorStop(1, "#d7dbe0");
      ctx.fillStyle = kind === "chip" ? "#c98a3a" : g;
      ctx.beginPath();
      const verts = body.vertices.map((v) => {
        const dx = v.x - body.position.x;
        const dy = v.y - body.position.y;
        const c = Math.cos(-body.angle);
        const s = Math.sin(-body.angle);
        return { x: dx * c - dy * s, y: dx * s + dy * c };
      });
      verts.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (kind === "nut" || kind === "washer") {
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = "#f6f5f1";
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const runner = Runner.create();
  Runner.run(runner, engine);
  let raf = 0;
  const loop = () => {
    draw();
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  // Pause when off-screen.
  const io = new IntersectionObserver(([e]) => {
    runner.enabled = e.isIntersecting;
  });
  io.observe(container);

  const onResize = () => {
    w = container.clientWidth;
    h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    Body.setPosition(walls[0], { x: w / 2, y: h + 30 });
    Body.setPosition(walls[2], { x: w + 30, y: h / 2 });
  };
  window.addEventListener("resize", onResize);

  return () => {
    window.clearInterval(dropTimer);
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener("resize", onResize);
    Runner.stop(runner);
    Engine.clear(engine);
    canvas.remove();
  };
}
