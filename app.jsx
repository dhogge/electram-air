// app.jsx — ElectRAM Air booking experience.
// Mounts on #root.

const { useState: useAppState, useEffect: useAppEffect, useMemo: useAppMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "comparison_style": "on-select",
  "show_legacy_pane": true,
  "theme": "modern",
  "default_route": "CRW-CLT"
} /*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const isMobile = useIsMobile();

  // Default route from tweak
  const [defaultDep, defaultArr] = (t.default_route || "CRW-ATL").split("-");

  // Default departure 10 days out, return 13 days out (matches Streamlit)
  const today = new Date();
  const fmtIso = (d) => d.toISOString().slice(0, 10);
  const depDefault = fmtIso(new Date(today.getTime() + 10 * 86400_000));
  const retDefault = fmtIso(new Date(today.getTime() + 13 * 86400_000));

  const [search, setSearch] = useAppState({
    trip_type: "Round Trip",
    booking_mode: "Seat Booking",
    depart_code: defaultDep,
    arrive_code: defaultArr,
    passengers: 1,
    depart_date: depDefault,
    return_date: retDefault
  });

  const [results, setResults] = useAppState({
    visible: true, // show by default so the page is alive on first load
    depart_code: defaultDep,
    arrive_code: defaultArr,
    depart_date: depDefault,
    return_date: retDefault,
    booking_mode: "Seat Booking",
    passengers: 1,
    trip_type: "Round Trip"
  });

  // When default_route tweak changes, sync the form
  useAppEffect(() => {
    setSearch((s) => ({ ...s, depart_code: defaultDep, arrive_code: defaultArr }));
    setResults((r) => ({ ...r, depart_code: defaultDep, arrive_code: defaultArr }));
    // eslint-disable-next-line
  }, [t.default_route]);

  const onSearch = () => {
    if (search.depart_code === search.arrive_code) {
      alert("Departure and arrival airports cannot be the same.");
      return;
    }
    setResults({
      visible: true,
      depart_code: search.depart_code,
      arrive_code: search.arrive_code,
      depart_date: search.depart_date,
      return_date: search.return_date,
      booking_mode: search.booking_mode,
      passengers: search.passengers,
      trip_type: search.trip_type
    });
    // Scroll to results
    setTimeout(() => {
      const el = document.getElementById("results");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Generate flights for the active results query
  const flights = useAppMemo(() => {
    if (!results.visible) return [];
    const d = new Date(results.depart_date + "T12:00:00");
    return window.FL.generateFlights(results.depart_code, results.arrive_code, d, 5);
  }, [results]);

  const returnFlights = useAppMemo(() => {
    if (!results.visible || results.trip_type !== "Round Trip") return [];
    const d = new Date(results.return_date + "T12:00:00");
    return window.FL.generateFlights(results.arrive_code, results.depart_code, d, 5);
  }, [results]);

  // Selected flight (for summary modal)
  const [selected, setSelected] = useAppState(null);
  const onSelect = (flight) => {
    flight.display_price = results.booking_mode === "Charter Aircraft" ?
    flight.charter_price : flight.price;
    setSelected({ flight, passengers: results.passengers, bookingMode: results.booking_mode });
  };

  // Date formatting for header
  const fmtDate = (iso) => {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const opDays = window.FL.operatingDaysText(results.depart_code, results.arrive_code);

  return (
    <>
      <TopNav />
      <Hero />
      <SearchPanel state={search} setState={setSearch} onSearch={onSearch} />

      {/* Results */}
      {results.visible &&
      <section id="results" data-screen-label="Results"
      style={{ padding: isMobile ? "60px 0 80px" : "80px 0 100px", background: "var(--bg)" }}>
          <div className="container" style={{ padding: isMobile ? "0 20px" : "0 32px" }}>

            {/* Results header */}
            <Reveal y={28} duration={900}>
              <div style={{
              display: "flex", alignItems: "flex-end",
              justifyContent: "space-between", flexWrap: "wrap", gap: 24,
              marginBottom: 36
            }}>
              <div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  letterSpacing: ".22em", color: "var(--maroon)",
                  textTransform: "uppercase", marginBottom: 12
                }}>
                  {results.trip_type === "Round Trip" ? "Round Trip" : "One Way"} · {results.passengers} passenger{results.passengers > 1 ? "s" : ""}
                </div>
                <h2 className="em-results-h2" style={{
                  fontFamily: "'Newsreader', serif", fontWeight: 400,
                  fontSize: "clamp(40px, 4.8vw, 68px)", lineHeight: 1,
                  letterSpacing: "-0.015em", margin: 0
                }}>
                  {results.depart_code} <span style={{ color: "var(--maroon)" }}>→</span> {results.arrive_code}
                  {results.trip_type === "Round Trip" && <>
                    {" "}<span style={{ color: "var(--maroon)" }}>→</span> {results.depart_code}
                  </>}
                </h2>
                <div style={{
                  marginTop: 12, fontSize: 14, color: "var(--ink-2)",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: ".08em"
                }}>
                  {fmtDate(results.depart_date)}
                  {results.trip_type === "Round Trip" && <> – {fmtDate(results.return_date)}</>}
                  {opDays && <> · OPERATES {opDays.split(",").length === 7 ? "DAILY" : opDays.toUpperCase()}</>}
                </div>
              </div>

              {/* Comparison style indicator */}
              <div style={{
                padding: "10px 16px", border: "1px solid var(--rule-strong)",
                background: "var(--paper)",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                letterSpacing: ".16em", color: "var(--ink-2)"
              }}>
                COMPARISON · {
                t.comparison_style === "inline" ? "INLINE EXPAND" :
                t.comparison_style === "side-by-side" ? "SIDE BY SIDE" :
                "ON SELECTION"
                }
              </div>
            </div>
            </Reveal>

            {/* Section header */}
            <SectionHeader
            label={`Outbound · ${results.depart_code} → ${results.arrive_code} · ${fmtDate(results.depart_date)}`} />
          

            {flights.length === 0 ?
          <NoFlights
            dep={results.depart_code} arr={results.arrive_code}
            date={fmtDate(results.depart_date)} /> :

          t.comparison_style === "side-by-side" ?
          <SideBySide flights={flights} bookingMode={results.booking_mode}
          passengers={results.passengers} onSelect={onSelect}
          showLegacy={t.show_legacy_pane} /> :

          <FlightList flights={flights} bookingMode={results.booking_mode}
          passengers={results.passengers} onSelect={onSelect}
          comparisonStyle={t.comparison_style} />
          }
          </div>
        </section>
      }

      {/* Aircraft strip — context after results */}
      <AircraftStrip />

      {/* Cabin showcase */}
      <CabinStrip />

      {/* Footer */}
      <Footer />

      {/* Savings summary modal */}
      {selected &&
      <SavingsSummary
        flight={selected.flight}
        passengers={selected.passengers}
        bookingMode={selected.bookingMode}
        onClose={() => setSelected(null)} />

      }

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Comparison" />
        <TweakRadio
          label="Style"
          value={t.comparison_style}
          options={[
          { value: "inline", label: "Inline" },
          { value: "side-by-side", label: "Side-by-side" },
          { value: "on-select", label: "On select" }]
          }
          onChange={(v) => setTweak("comparison_style", v)} />
        
        {t.comparison_style === "side-by-side" &&
        <TweakToggle
          label="Show legacy pane"
          value={t.show_legacy_pane}
          onChange={(v) => setTweak("show_legacy_pane", v)} />

        }

        <TweakSection label="Route preset" />
        <TweakSelect
          label="Default route"
          value={t.default_route}
          options={[
          { value: "CRW-ATL", label: "CRW → ATL (7h drive)" },
          { value: "CRW-CLT", label: "CRW → CLT (4h15)" },
          { value: "ROA-CLT", label: "ROA → CLT (3h)" },
          { value: "HTS-CLT", label: "HTS → CLT (4h30)" },
          { value: "TRI-ATL", label: "TRI → ATL (4h45)" }]
          }
          onChange={(v) => setTweak("default_route", v)} />
        

        <TweakSection label="Theme" />
        <TweakRadio
          label="Style"
          value={t.theme}
          options={[
          { value: "modern", label: "Modern" },
          { value: "classic", label: "Classic" }]
          }
          onChange={(v) => setTweak("theme", v)} />
        
      </TweaksPanel>
    </>);

}

function SectionHeader({ label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      paddingBottom: 16, marginBottom: 20,
      borderBottom: "1px solid var(--rule-strong)"
    }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
        letterSpacing: ".24em", color: "var(--ink-1)",
        textTransform: "uppercase", fontWeight: 600
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "transparent" }} />
    </div>);

}

function NoFlights({ dep, arr, date }) {
  const days = window.FL.operatingDaysText(dep, arr);
  return (
    <div style={{
      padding: "40px 32px",
      background: "var(--paper)", border: "1px dashed var(--rule-strong)",
      textAlign: "center"
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        letterSpacing: ".2em", color: "var(--maroon)", marginBottom: 8
      }}>NO SERVICE</div>
      <div style={{
        fontFamily: "'Newsreader', serif", fontSize: 24,
        color: "var(--ink-0)"
      }}>
        {dep} → {arr} doesn't operate on {date}.
      </div>
      {days &&
      <div style={{ marginTop: 12, color: "var(--ink-2)", fontSize: 14 }}>
          Scheduled days: <strong style={{ color: "var(--ink-1)" }}>{days}</strong>
        </div>
      }
    </div>);

}

function FlightList({ flights, bookingMode, passengers, onSelect, comparisonStyle }) {
  return (
    <div>
      {flights.map((f, i) =>
      <Reveal key={i} delay={i * 110} y={28} duration={900}>
          <FlightCard
          flight={f}
          comparisonStyle={comparisonStyle}
          bookingMode={bookingMode}
          passengers={passengers}
          onSelect={onSelect} />
        
        </Reveal>
      )}
    </div>);

}

function SideBySide({ flights, bookingMode, passengers, onSelect, showLegacy }) {
  const isMobile = useIsMobile();
  return (
    <div>
      {/* Column headers */}
      {showLegacy && !isMobile &&
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr", gap: 16,
        marginBottom: 12
      }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, background: "var(--maroon)" }} />
            <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            letterSpacing: ".2em", textTransform: "uppercase",
            color: "var(--ink-0)", fontWeight: 600
          }}>E.C.H.O. · ElectRAM Air</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, background: "var(--ink-2)" }} />
            <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            letterSpacing: ".2em", textTransform: "uppercase",
            color: "var(--ink-2)", fontWeight: 600
          }}>Regional jet · hypothetical itinerary</span>
          </div>
        </div>
      }

      <div>
        {flights.map((f, i) => {
          f.display_price = bookingMode === "Charter Aircraft" ? f.charter_price : f.price;
          return (
            <Reveal key={i} delay={i * 110} y={28} duration={900}>
              <div style={{
                display: "grid",
                gridTemplateColumns: (showLegacy && !isMobile) ? "1fr 1fr" : "1fr",
                gap: 16, marginBottom: 16,
                alignItems: "stretch"
              }}>
                <FlightCard
                  flight={f}
                  comparisonStyle="none"
                  bookingMode={bookingMode}
                  passengers={passengers}
                  onSelect={onSelect} />
                
                {showLegacy && <LegacyCardEquivalent flight={f} />}
              </div>
            </Reveal>);

        })}
      </div>
    </div>);

}

function AircraftStrip() {
  const [imgRef, imgY] = useParallax({ speed: 0.18 });
  const isMobile = useIsMobile();
  return (
    <section data-screen-label="Aircraft" style={{
      padding: isMobile ? "70px 0 70px" : "100px 0 100px",
      background: "var(--ink-0)", color: "#fff",
      overflow: "hidden"
    }}>
      <div className="container" style={{ padding: isMobile ? "0 20px" : "0 32px" }}>
        <div className="em-mobile-stack" style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 40 : 60,
          alignItems: "center"
        }}>
          <Reveal y={32} duration={1100}>
            <Chip tone="orange">The Aircraft</Chip>
            <h3 style={{
              marginTop: 18,
              fontFamily: "'Newsreader', serif", fontWeight: 400,
              fontSize: "clamp(36px, 4.4vw, 60px)",
              lineHeight: 1.02, letterSpacing: "-0.02em"
            }}>
              <SplitWords stagger={50} y={20} duration={900}>
                Built around the trips other aircraft can't make money on.
              </SplitWords>
            </h3>
            <p style={{
              marginTop: 18,
              fontSize: 16, lineHeight: 1.6,
              color: "rgba(255,255,255,.72)", maxWidth: 480
            }}>{"E.C.H.O. is a clean-sheet 19-seat commuter built for the <350 nautical mile market the hub-and-spoke system abandoned. Lower block-hour costs, shorter runways, regional-airport ready."}




            </p>

            <div style={{
              marginTop: 36,
              display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
              gap: "28px 40px", maxWidth: 480
            }}>
              {[
              ["$2,009", "BLOCK HOUR COST"],
              ["$7,450", "VS ERJ-145"],
              ["2,600 ft", "RUNWAY REQUIRED"],
              ["19", "PASSENGER SEATS"]].
              map(([num, lbl], i) =>
              <Reveal key={lbl} delay={300 + i * 80} y={14} duration={800}>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,.18)", paddingTop: 12 }}>
                    <div style={{
                    fontFamily: "'Newsreader', serif", fontSize: 28,
                    fontWeight: 500, lineHeight: 1
                  }}>{num}</div>
                    <div style={{
                    marginTop: 6,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                    letterSpacing: ".18em", color: "rgba(255,255,255,.55)"
                  }}>{lbl}</div>
                  </div>
                </Reveal>
              )}
            </div>
          </Reveal>

          <Reveal y={48} duration={1300} delay={150}>
            <div ref={imgRef} style={{
              aspectRatio: "16 / 10",
              backgroundImage: "url('images/echo-tarmac.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(255,255,255,.08)",
              width: "100%",
              transform: `translate3d(0, ${imgY}px, 0)`,
              willChange: "transform"
            }} />
          </Reveal>
        </div>
      </div>
    </section>);

}

function CabinStrip() {
  const [bgRef, bgY] = useParallax({ speed: 0.25 });
  const isMobile = useIsMobile();
  return (
    <section data-screen-label="Cabin" style={{
      position: "relative",
      minHeight: isMobile ? 480 : 560,
      background: "var(--paper)",
      overflow: "hidden"
    }}>
      <div ref={bgRef} style={{
        position: "absolute", inset: -40,
        backgroundImage: "url('images/echo-cabin.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: `translate3d(0, ${bgY}px, 0) scale(1.05)`,
        willChange: "transform"
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: isMobile
          ? "linear-gradient(180deg, rgba(250,248,242,.95) 0%, rgba(250,248,242,.88) 60%, rgba(250,248,242,.2) 100%)"
          : "linear-gradient(90deg, rgba(250,248,242,.95) 0%, rgba(250,248,242,.82) 35%, rgba(250,248,242,.0) 65%)",
        pointerEvents: "none"
      }} />

      <div className="container" style={{
        position: "relative",
        padding: isMobile ? "70px 20px" : "120px 32px",
        minHeight: isMobile ? 480 : 560,
        display: "flex", alignItems: "center"
      }}>
        <Reveal y={32} duration={1100}>
          <div style={{ maxWidth: 520 }}>
            <Chip tone="maroon">The Cabin</Chip>
            <h3 style={{
              marginTop: 18,
              fontFamily: "'Newsreader', serif", fontWeight: 400,
              fontSize: "clamp(36px, 4.4vw, 56px)",
              lineHeight: 1.04, letterSpacing: "-0.02em",
              color: "var(--ink-0)"
            }}>
              <SplitWords stagger={55} y={20} duration={900}>
                Nineteen seats. No middle. No connection.
              </SplitWords>
            </h3>
            <p style={{
              marginTop: 18, fontSize: 16, lineHeight: 1.6,
              color: "var(--ink-1)", maxWidth: 460
            }}>
              ElectRAM Air operates the E.C.H.O. in a 1-2 commuter layout.
              Window seats only on one side, paired seats on the other.
              Carry-on goes in the cabin with you, walk-on boarding fifteen
              minutes before push, no separate seat selection fee.
            </p>

            <div style={{
              marginTop: 32,
              display: "grid", gridTemplateColumns: "repeat(3, auto)",
              gap: "0 36px", alignItems: "baseline"
            }}>
              {[
              ["15 min", "CHECK-IN"],
              ["1 bag", "CARRY-ON INCLUDED"],
              ["0", "MIDDLE SEATS"]].
              map(([num, lbl], i) =>
              <Reveal key={lbl} delay={400 + i * 100} y={14} duration={800}>
                  <div style={{
                  fontFamily: "'Newsreader', serif", fontSize: 26,
                  fontWeight: 500, lineHeight: 1, color: "var(--ink-0)"
                }}>{num}</div>
                  <div style={{
                  marginTop: 6,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  letterSpacing: ".18em", color: "var(--ink-2)"
                }}>{lbl}</div>
                </Reveal>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>);

}

function Footer() {
  const isMobile = useIsMobile();
  return (
    <footer style={{
      background: "var(--paper)",
      borderTop: "1px solid var(--rule)",
      padding: isMobile ? "40px 0 30px" : "60px 0 40px"
    }}>
      <div className="container em-mobile-stack" style={{
        padding: isMobile ? "0 20px" : "0 32px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr",
        gap: isMobile ? 32 : 40
      }}>
        <div>
          <Logo />
          <p style={{
            marginTop: 18, fontSize: 13, color: "var(--ink-2)",
            maxWidth: 360, lineHeight: 1.5
          }}>ElectRAM Air operates under FAA Part 380 as a public charter operator. Concept design by team ElectRAM at Virginia Tech under the RAM RFP.


          </p>
        </div>
        {[
        ["Book", ["Flights", "Charter", "Routes", "Schedule"]],
        ["Aircraft", ["E.C.H.O.", "Operations", "Safety", "Press"]],
        ["Company", ["About", "Careers", "Contact", "Investors"]]].
        map(([title, links]) =>
        <div key={title}>
            <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: ".22em", color: "var(--ink-1)",
            marginBottom: 12, textTransform: "uppercase", fontWeight: 600
          }}>{title}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0,
            display: "flex", flexDirection: "column", gap: 8 }}>
              {links.map((l) =>
            <li key={l}>
                  <a href="#" style={{
                color: "var(--ink-1)", textDecoration: "none", fontSize: 13.5
              }}>{l}</a>
                </li>
            )}
            </ul>
          </div>
        )}
      </div>
      <div className="container" style={{
        padding: isMobile ? "30px 20px 0" : "40px 32px 0",
        marginTop: isMobile ? 28 : 40,
        borderTop: "1px solid var(--rule)",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        gap: isMobile ? 8 : 0,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
        letterSpacing: ".14em", color: "var(--ink-3)",
        textTransform: "uppercase"
      }}>
        <span>© 2026 ElectRAM Air</span>
        <span>Part 380 Charter · Concept Demonstrator</span>
      </div>
    </footer>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);