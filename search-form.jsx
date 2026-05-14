// search-form.jsx — Search box, hero, sticky header.
const { useState: useState_SF, useEffect: useEffect_SF, useRef: useRef_SF } = React;
const useMS = React.useState, useME = React.useEffect, useMR = React.useRef;

function Logo({ inverted, scale = 1 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 * scale }}>
      <img
        src="images/electram-logo.png"
        alt="ElectRAM"
        style={{
          height: 40 * scale,
          width: "auto",
          display: "block",
          filter: inverted ? "brightness(0) invert(1)" : "none",
        }}
      />
      <div style={{
        display: "flex", flexDirection: "column", lineHeight: 1.1,
        borderLeft: `1px solid ${inverted ? "rgba(255,255,255,.25)" : "var(--rule-strong)"}`,
        paddingLeft: 12 * scale,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5 * scale,
          letterSpacing: ".22em", color: inverted ? "#fff" : "var(--ink-0)",
          textTransform: "uppercase", fontWeight: 600,
        }}>
          ElectRAM Air
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 8 * scale,
          letterSpacing: ".22em", color: inverted ? "rgba(255,255,255,.55)" : "var(--ink-2)",
          marginTop: 3, textTransform: "uppercase",
        }}>
          E.C.H.O. · Part 380 Charter
        </span>
      </div>
    </div>
  );
}

function TopNav() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useMS(false);
  const links = [
    { label: "Book", href: "#" },
    { label: "Aircraft", href: "docs/AVD_2-3.pdf", external: true },
    { label: "Poster", href: "docs/AVD_poster_ELECTRAM.pdf", external: true },
    { label: "About", href: "https://sites.google.com/vt.edu/electram-air?usp=sharing", external: true },
  ];
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(246,244,238,.92)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--rule)",
    }}>
      <div className="container" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "12px 20px" : "16px 32px",
      }}>
        <Logo scale={isMobile ? 0.8 : 1} />

        {!isMobile && (
          <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {links.map((item, i) => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                style={{
                  color: "var(--ink-1)", textDecoration: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
                  borderBottom: i === 0 ? "1px solid var(--maroon)" : "1px solid transparent",
                  paddingBottom: 4,
                }}
              >{item.label}</a>
            ))}
            <a href="#" style={{
              color: "var(--ink-0)", textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
              border: "1px solid var(--ink-0)", padding: "8px 14px",
            }}>Sign in →</a>
          </nav>
        )}

        {isMobile && (
          <button
            aria-label="Menu"
            onClick={() => setOpen(!open)}
            style={{
              background: "transparent", border: "1px solid var(--ink-0)",
              padding: "8px 12px", cursor: "pointer",
              display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            <span style={{
              width: 18, height: 1.5, background: "var(--ink-0)",
              transform: open ? "translateY(5.5px) rotate(45deg)" : "none",
              transition: "transform .25s", transformOrigin: "center"
            }} />
            <span style={{
              width: 18, height: 1.5, background: "var(--ink-0)",
              opacity: open ? 0 : 1, transition: "opacity .15s"
            }} />
            <span style={{
              width: 18, height: 1.5, background: "var(--ink-0)",
              transform: open ? "translateY(-5.5px) rotate(-45deg)" : "none",
              transition: "transform .25s", transformOrigin: "center"
            }} />
          </button>
        )}
      </div>

      {isMobile && open && (
        <nav style={{
          display: "flex", flexDirection: "column",
          padding: "8px 20px 20px",
          borderTop: "1px solid var(--rule)",
          background: "var(--paper)",
        }}>
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={() => setOpen(false)}
              style={{
                color: "var(--ink-1)", textDecoration: "none",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase",
                padding: "14px 0", borderBottom: "1px solid var(--rule)",
              }}
            >{item.label}</a>
          ))}
          <a href="#" onClick={() => setOpen(false)} style={{
            marginTop: 16,
            color: "#fff", background: "var(--ink-0)",
            textDecoration: "none", textAlign: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase",
            padding: "14px 16px",
          }}>Sign in →</a>
        </nav>
      )}
    </header>
  );
}

function HeroVideo({ parallaxY }) {
  const videoRef = useMR(null);
  const [src, setSrc] = useMS(null);

  useME(() => {
    let blobUrl = null;
    let cancelled = false;
    fetch("media/echo-flight.mp4")
      .then((r) => r.blob())
      .then((b) => {
        if (cancelled) return;
        blobUrl = URL.createObjectURL(b);
        setSrc(blobUrl);
      })
      .catch((e) => console.warn("Hero video failed to load:", e));
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, []);

  useME(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    v.play().catch(() => {/* autoplay blocked */ });
  }, [src]);

  return (
    <div style={{
      position: "absolute", inset: 0,
      transform: `translate3d(0, ${parallaxY * 0.3}px, 0) scale(${1 + parallaxY * 0.0004})`,
      transformOrigin: "center",
      willChange: "transform",
      overflow: "hidden",
    }}>
      {/* Poster image always renders, video fades over once ready */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('images/echo-flight-clouds.png')",
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }} />
      {src && (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            minWidth: "100%", minHeight: "100%",
            width: "auto", height: "auto",
            transform: "translate(-50%, -50%)",
            objectFit: "cover",
            opacity: 1,
            transition: "opacity 800ms ease",
          }}
        />
      )}
    </div>
  );
}

function Hero() {
  const parallaxYRaw = useHeroParallax();
  const isMobile = useIsMobile();
  // Disable parallax on mobile — it can feel choppy on touch and the
  // background image is already large enough.
  const parallaxY = isMobile ? 0 : parallaxYRaw;
  return (
    <section style={{
      position: "relative",
      background: "var(--ink-0)",
      color: "#fff",
      overflow: "hidden",
    }}>
      <HeroVideo parallaxY={parallaxY} />
      <div style={{
        position: "absolute", inset: 0,
        background:
          "linear-gradient(90deg, rgba(14,15,18,.85) 0%, rgba(14,15,18,.72) 32%, rgba(14,15,18,.4) 55%, rgba(14,15,18,.05) 80%, rgba(14,15,18,.05) 100%), " +
          "linear-gradient(180deg, rgba(14,15,18,.25) 0%, rgba(14,15,18,0) 30%, rgba(14,15,18,.35) 78%, rgba(14,15,18,.85) 100%)",
        pointerEvents: "none",
      }} />

      <div className="container em-hero" style={{
        position: "relative",
        padding: isMobile ? "80px 20px 160px" : "120px 32px 220px",
      }}>
        {/* Tagline */}
        <HeroEntry delay={100}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 32, height: 1, background: "var(--orange)",
              animation: "heroRule 1.4s cubic-bezier(.2,.7,.2,1) .1s both",
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, letterSpacing: ".24em",
              color: "var(--orange)", textTransform: "uppercase",
            }}>
              Regional flight, reinvented
            </span>
          </div>
        </HeroEntry>

        <h1 style={{
          fontFamily: "'Newsreader', serif",
          fontWeight: 400,
          fontSize: "clamp(48px, 7.2vw, 104px)",
          lineHeight: 0.98,
          letterSpacing: "-0.02em",
          margin: 0,
          maxWidth: 1100,
          textWrap: "balance",
        }}>
          <span style={{ display: "block" }}>
            <SplitWords trigger="mount" delay={300} stagger={80} y={28} duration={1000}>
              Skip the hub.
            </SplitWords>
          </span>
          <em style={{ color: "var(--orange)", fontStyle: "italic", fontWeight: 400, display: "block" }}>
            <SplitWords trigger="mount" delay={650} stagger={80} y={28} duration={1000}>
              Skip the drive.
            </SplitWords>
          </em>
        </h1>

        <HeroEntry delay={1100} duration={1200}>
          <p style={{
            fontFamily: "'Newsreader', serif",
            fontSize: "clamp(18px, 1.5vw, 22px)",
            lineHeight: 1.45,
            maxWidth: 620,
            marginTop: 28,
            color: "rgba(255,255,255,.78)",
            fontWeight: 300,
          }}>
            Direct charter service between regional airports across the
            mid-Atlantic and southeast, on the 19-seat E.C.H.O., the
            aircraft built for the trips the airlines won't fly and
            you shouldn't drive.
          </p>
        </HeroEntry>

        {/* Specs row */}
        <HeroEntry delay={1400} duration={1100}>
          <div style={{
            marginTop: isMobile ? 40 : 56,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,.18)",
            maxWidth: 760,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              letterSpacing: ".22em", color: "rgba(255,255,255,.55)",
              textTransform: "uppercase", marginBottom: 24,
            }}>
              Built for the route the airlines abandoned
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(2, 1fr)",
              columnGap: isMobile ? 20 : 48,
              rowGap: isMobile ? 22 : 28,
            }}>
              {[
                {
                  cu: { to: 19, suffix: "" },
                  label: "Seats per aircraft",
                  desc: "Right-sized for charter. Under the FAA Part 380 threshold, no hub required.",
                },
                {
                  cu: { to: 13, suffix: "" },
                  label: "Cities served",
                  desc: "Regional airports across WV, VA, NC, KY, TN. Most a short drive from home.",
                },
                {
                  cu: { to: 73, suffix: "%", approx: true },
                  label: "Lower block-hour cost",
                  desc: "$2,009/hr on the E.C.H.O. vs $7,450 on the ERJ-145 it replaces.",
                },
                {
                  cu: { to: 1, suffix: "h" },
                  label: "Average flight time",
                  desc: "Door-to-door faster than driving on every route we operate.",
                },
              ].map((s, idx) => (
                <Reveal key={s.label} delay={idx * 100} y={16}>
                  <div style={{
                    fontFamily: "'Newsreader', serif",
                    fontSize: isMobile ? 38 : 56,
                    fontWeight: 500, lineHeight: 1, color: "#fff",
                    letterSpacing: "-0.015em",
                  }}>
                    <CountUp {...s.cu} duration={1600} />
                  </div>
                  <div style={{
                    marginTop: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: isMobile ? 9 : 10,
                    letterSpacing: ".2em", color: "var(--orange)",
                    textTransform: "uppercase",
                  }}>{s.label}</div>
                  <div style={{
                    marginTop: 8,
                    fontSize: isMobile ? 12 : 13, lineHeight: 1.5,
                    color: "rgba(255,255,255,.72)",
                  }}>{s.desc}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </HeroEntry>

        {/* Scroll cue */}
        {!isMobile && (
          <HeroEntry delay={1100} duration={1000} style={{ position: "absolute", left: 32, bottom: 120 }}>
            <div className="em-mobile-hide" style={{
              display: "flex", alignItems: "center", gap: 10,
              color: "rgba(255,255,255,.55)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              letterSpacing: ".22em", textTransform: "uppercase",
              animation: "heroScrollCue 2.4s ease-in-out infinite",
            }}>
              <span style={{ display: "inline-block", width: 24, height: 1, background: "currentColor" }} />
              <span>Scroll to book</span>
            </div>
          </HeroEntry>
        )}
      </div>
    </section>
  );
}

function SearchPanel({ state, setState, onSearch }) {
  const swapAirports = () => {
    setState((s) => ({ ...s, depart_code: s.arrive_code, arrive_code: s.depart_code }));
  };

  const isRound = state.trip_type === "Round Trip";
  const isMobile = useIsMobile();

  return (
    <div data-screen-label="Search" style={{
      position: "relative",
      marginTop: isMobile ? -60 : -80,
      zIndex: 10,
    }}>
      <div className="container" style={{ padding: isMobile ? "0 20px" : "0 32px" }}>
        <Reveal y={24} duration={600} delay={200}>
          <div style={{
            background: "var(--paper)",
            border: "1px solid var(--rule-strong)",
            boxShadow: "0 24px 60px -20px rgba(14,15,18,.35)",
            padding: 0,
          }}>
            {/* Top row: trip controls */}
            <div style={{
              display: "flex",
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
              padding: isMobile ? "14px 16px" : "18px 24px",
              borderBottom: "1px solid var(--rule)",
              gap: isMobile ? 12 : 24,
              flexWrap: "wrap",
              flexDirection: isMobile ? "column" : "row",
            }}>
              <div style={{
                display: "flex", gap: isMobile ? 8 : 16,
                alignItems: "center", flexWrap: "wrap",
              }}>
                <Segmented
                  value={state.trip_type}
                  onChange={(v) => setState((s) => ({ ...s, trip_type: v }))}
                  options={["Round Trip", "One Way"]}
                />
                <Segmented
                  value={state.booking_mode}
                  onChange={(v) => setState((s) => ({ ...s, booking_mode: v }))}
                  options={[
                    { value: "Seat Booking", label: "Per Seat" },
                    { value: "Charter Aircraft", label: "Full Aircraft" },
                  ]}
                />
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                justifyContent: isMobile ? "space-between" : "flex-end",
              }}>
                <TechLabel>Passengers</TechLabel>
                <Stepper
                  value={state.passengers}
                  onChange={(v) => setState((s) => ({ ...s, passengers: v }))}
                />
              </div>
            </div>

            {/* Main form */}
            <div className="em-mobile-stack" style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "1fr auto 1fr 1fr 1fr auto",
              gap: isMobile ? 14 : 16,
              alignItems: "end",
              padding: isMobile ? "18px 16px" : "24px",
            }}>
              <FieldSelect
                label="Departing"
                value={state.depart_code}
                onChange={(v) => setState((s) => ({ ...s, depart_code: v }))}
                options={window.AIRPORTS}
              />
              <button onClick={swapAirports} aria-label="Swap" className="em-mobile-full" style={{
                alignSelf: isMobile ? "center" : "end",
                marginBottom: 2,
                width: isMobile ? "100%" : 44,
                height: isMobile ? 36 : 44,
                border: "1px solid var(--rule-strong)",
                background: "var(--paper)", color: "var(--ink-0)",
                cursor: "pointer", fontSize: 18,
              }}>⇄</button>
              <FieldSelect
                label="Arriving"
                value={state.arrive_code}
                onChange={(v) => setState((s) => ({ ...s, arrive_code: v }))}
                options={window.AIRPORTS}
              />
              <div style={{
                gridColumn: isMobile ? "auto" : "span 2",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: isMobile ? 12 : 16,
              }}>
                <FieldDate
                  label="Departure"
                  value={state.depart_date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(v) => setState((s) => ({ ...s, depart_date: v }))}
                />
                <FieldDate
                  label="Return"
                  value={state.return_date}
                  min={state.depart_date}
                  disabled={!isRound}
                  onChange={(v) => setState((s) => ({ ...s, return_date: v }))}
                />
              </div>
              <button onClick={onSearch} style={{
                alignSelf: isMobile ? "stretch" : "end",
                padding: "14px 28px",
                minHeight: 50,
                marginTop: isMobile ? 6 : 0,
                background: "var(--maroon)", color: "#fff",
                border: "none", cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, fontWeight: 600,
                letterSpacing: ".18em", textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                Search →
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

Object.assign(window, { Logo, TopNav, Hero, SearchPanel });
