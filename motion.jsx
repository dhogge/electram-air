// motion.jsx — Scroll-reveal, count-up and parallax hooks.
// Apple/Joby-style scroll choreography. Lightweight, no library dependencies.

const { useEffect: useME, useRef: useMR, useState: useMS } = React;

// ── Reveal: fade + slide in when element enters viewport ───────────────────
function useReveal({ delay = 0, threshold = 0.15, once = true } = {}) {
  const ref = useMR(null);
  const [shown, setShown] = useMS(false);
  useME(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setShown(true), delay);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, threshold, once]);
  return [ref, shown];
}

// Reveal wrapper: applies the fade+slide style for you
function Reveal({ children, delay = 0, y = 24, duration = 800, as = "div", style, ...rest }) {
  const [ref, shown] = useReveal({ delay });
  const Tag = as;
  return (
    <Tag
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
        transition: `opacity ${duration}ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── Hero entry on mount: triggered once shortly after load ─────────────────
function HeroEntry({ children, delay = 0, y = 32, duration = 1100, style, ...rest }) {
  const [shown, setShown] = useMS(false);
  useME(() => {
    const id = requestAnimationFrame(() =>
      setTimeout(() => setShown(true), delay)
    );
    return () => cancelAnimationFrame(id);
  }, [delay]);
  return (
    <div
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
        transition: `opacity ${duration}ms cubic-bezier(.2,.7,.2,1), transform ${duration}ms cubic-bezier(.2,.7,.2,1)`,
        willChange: "opacity, transform",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ── Count-up for stat numbers ──────────────────────────────────────────────
function CountUp({ to, from = 0, duration = 1800, prefix = "", suffix = "",
                   format = (n) => Math.round(n).toLocaleString(),
                   approx = false }) {
  const [ref, shown] = useReveal({ threshold: 0.4 });
  const [val, setVal] = useMS(from);
  useME(() => {
    if (!shown) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, to, from, duration]);
  return (
    <span ref={ref}>
      {approx && shown && "~"}{prefix}{format(val)}{suffix}
    </span>
  );
}

// ── Parallax: translate Y based on element's scroll progress ───────────────
function useParallax({ speed = 0.3 } = {}) {
  const ref = useMR(null);
  const [y, setY] = useMS(0);
  useME(() => {
    const el = ref.current;
    if (!el) return;
    let raf = null;
    const update = () => {
      raf = null;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // -1 at bottom of viewport, +1 at top
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      setY(-progress * speed * 100);
    };
    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);
  return [ref, y];
}

// ── Hero parallax: subtle scale + drift on the background image as you scroll ─
function useHeroParallax() {
  const [y, setY] = useMS(0);
  useME(() => {
    let raf = null;
    const update = () => {
      raf = null;
      const sy = window.scrollY;
      // Only respond while hero is in view
      setY(Math.min(sy, 600));
    };
    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return y;
}

// ── Word-by-word reveal for headlines ──────────────────────────────────────
function SplitWords({ children, delay = 0, stagger = 60, y = 18,
                      duration = 900, style, trigger = "scroll" }) {
  // Flatten children to a plain text string. JSX whitespace + the editor's
  // jsx-tagging wrapper can hand us strings, arrays, or React elements with
  // a .props.children chain. Pull every leaf string out and join.
  const flatten = (node) => {
    if (node == null || node === false || node === true) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(flatten).join("");
    if (node && typeof node === "object") {
      if (node.props && node.props.children !== undefined) return flatten(node.props.children);
      return "";
    }
    return "";
  };
  const text = flatten(children).replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ") : [];
  const [ref, shown] = useReveal({ threshold: 0.2 });
  const [mountShown, setMountShown] = useMS(trigger === "scroll" ? false : false);
  useME(() => {
    if (trigger === "mount") {
      const t = setTimeout(() => setMountShown(true), delay);
      return () => clearTimeout(t);
    }
  }, [trigger, delay]);
  const active = trigger === "mount" ? mountShown : shown;
  return (
    <span ref={trigger === "mount" ? undefined : ref} style={style}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: "inline-block",
          overflow: "hidden",
          marginRight: "0.28em",
        }}>
          <span style={{
            display: "inline-block",
            opacity: active ? 1 : 0,
            transform: active ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
            transition: `opacity ${duration}ms cubic-bezier(.2,.7,.2,1) ${i * stagger + delay}ms, transform ${duration}ms cubic-bezier(.2,.7,.2,1) ${i * stagger + delay}ms`,
            willChange: "opacity, transform",
          }}>
            {w}
          </span>
        </span>
      ))}
    </span>
  );
}

Object.assign(window, {
  useReveal, Reveal, HeroEntry, CountUp, useParallax, useHeroParallax, SplitWords,
});
