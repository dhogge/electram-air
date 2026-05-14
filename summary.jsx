// summary.jsx — Post-select "you saved X" confirmation screen (variation C).

function SavingsSummary({ flight, passengers, bookingMode, onClose }) {
  const L = flight.legacy;
  const displayPrice = flight.display_price;
  const priceSaved = L.legacyPrice - displayPrice;
  const totalEcho = bookingMode === "Charter Aircraft" ? displayPrice : displayPrice * passengers;
  const totalLegacy = L.legacyPrice * passengers;
  const [dt, dap] = window.FL.fmtTime(flight.dep_h, flight.dep_m);

  return (
    <div
      data-screen-label="Savings summary"
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(14,15,18,.65)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 32, overflowY: "auto",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--paper)",
        maxWidth: 920, width: "100%",
        border: "1px solid var(--ink-0)",
        position: "relative",
      }}>
        {/* Maroon header bar */}
        <div style={{
          background: "var(--maroon)", color: "#fff",
          padding: "18px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, background: "var(--orange)", borderRadius: "50%" }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              letterSpacing: ".24em", textTransform: "uppercase",
            }}>Flight Selected · Pending Confirmation</span>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: "#fff",
            fontSize: 18, cursor: "pointer", padding: 4,
          }}>×</button>
        </div>

        <div style={{ padding: "44px 56px 32px" }}>
          {/* Itinerary line */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 6 }}>
            <span style={{
              fontFamily: "'Newsreader', serif", fontSize: 64, fontWeight: 500,
              lineHeight: 1, letterSpacing: "-0.02em",
            }}>
              {flight.dep_code}
            </span>
            <span style={{ fontSize: 28, color: "var(--maroon)" }}>→</span>
            <span style={{
              fontFamily: "'Newsreader', serif", fontSize: 64, fontWeight: 500,
              lineHeight: 1, letterSpacing: "-0.02em",
            }}>
              {flight.arr_code}
            </span>
          </div>
          <div style={{
            fontSize: 14, color: "var(--ink-2)",
            display: "flex", gap: 14, flexWrap: "wrap",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: ".08em",
          }}>
            <span>{flight.dep_city.toUpperCase()}</span>
            <span>·</span>
            <span>{flight.arr_city.toUpperCase()}</span>
            <span>·</span>
            <span>{dt}{dap}</span>
            <span>·</span>
            <span>{window.FL.durStr(flight.dur_h, flight.dur_m)} NONSTOP</span>
          </div>

          {/* Big saved numbers */}
          <div style={{
            marginTop: 44,
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 0,
            border: "1px solid var(--ink-0)",
          }}>
            <div style={{
              padding: "32px 28px",
              borderRight: "1px solid var(--ink-0)",
              background: "var(--ink-0)", color: "#fff",
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                letterSpacing: ".22em", color: "var(--orange)",
              }}>YOU SAVED</div>
              <div style={{
                fontFamily: "'Newsreader', serif", fontSize: 84,
                fontWeight: 400, lineHeight: 0.95, marginTop: 14,
                letterSpacing: "-0.02em",
              }}>
                {window.FL.minutesToStr(L.timeSavedMin)}
              </div>
              <div style={{
                fontSize: 13, color: "rgba(255,255,255,.6)", marginTop: 8,
              }}>vs a regional jet via {L.hub}</div>
            </div>

            <div style={{
              padding: "32px 28px",
              background: "var(--paper)",
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                letterSpacing: ".22em", color: "var(--maroon)",
              }}>YOU SAVED</div>
              <div style={{
                fontFamily: "'Newsreader', serif", fontSize: 84,
                fontWeight: 400, lineHeight: 0.95, marginTop: 14,
                letterSpacing: "-0.02em", color: "var(--ink-0)",
              }}>
                ${priceSaved * passengers}
              </div>
              <div style={{
                fontSize: 13, color: "var(--ink-2)", marginTop: 8,
              }}>vs equivalent legacy ticket × {passengers}</div>
            </div>
          </div>

          {/* Side-by-side breakdown */}
          <div style={{
            marginTop: 32,
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 0,
          }}>
            <div style={{
              padding: "20px 24px 20px 0",
              borderRight: "1px solid var(--rule)",
            }}>
              <Chip tone="maroon">Your booking · E.C.H.O.</Chip>
              <div style={{
                marginTop: 16,
                display: "grid", gridTemplateColumns: "1fr auto",
                rowGap: 8, fontSize: 13.5,
              }}>
                <span style={{ color: "var(--ink-2)" }}>Door-to-door</span>
                <strong style={{ color: "var(--ink-0)", fontVariantNumeric: "tabular-nums" }}>
                  {window.FL.minutesToStr(L.echoTotalMin)}
                </strong>
                <span style={{ color: "var(--ink-2)" }}>Connections</span>
                <strong style={{ color: "var(--ink-0)" }}>None</strong>
                <span style={{ color: "var(--ink-2)" }}>{bookingMode === "Charter Aircraft" ? "Charter" : "Per seat"}</span>
                <strong style={{ color: "var(--ink-0)", fontVariantNumeric: "tabular-nums" }}>${displayPrice}</strong>
                <span style={{ color: "var(--ink-2)", borderTop: "1px solid var(--rule)", paddingTop: 8, marginTop: 4 }}>Total</span>
                <strong style={{
                  color: "var(--ink-0)", fontVariantNumeric: "tabular-nums",
                  borderTop: "1px solid var(--rule)", paddingTop: 8, marginTop: 4,
                  fontFamily: "'Newsreader', serif", fontSize: 17,
                }}>${totalEcho}</strong>
              </div>
            </div>

            <div style={{ padding: "20px 0 20px 24px" }}>
              <Chip tone="ghost">Hypothetical · Regional jet via {L.hub}</Chip>
              <div style={{
                marginTop: 16,
                display: "grid", gridTemplateColumns: "1fr auto",
                rowGap: 8, fontSize: 13.5,
              }}>
                <span style={{ color: "var(--ink-2)" }}>Door-to-door</span>
                <strong style={{ color: "var(--ink-0)", fontVariantNumeric: "tabular-nums" }}>
                  {window.FL.minutesToStr(L.totalMin)}
                </strong>
                <span style={{ color: "var(--ink-2)" }}>Connections</span>
                <strong style={{ color: "var(--ink-0)" }}>{L.isDirect ? "Direct" : "1 stop"}</strong>
                <span style={{ color: "var(--ink-2)" }}>Per seat</span>
                <strong style={{ color: "var(--ink-0)", fontVariantNumeric: "tabular-nums" }}>${L.legacyPrice}</strong>
                <span style={{ color: "var(--ink-2)", borderTop: "1px solid var(--rule)", paddingTop: 8, marginTop: 4 }}>Total ×{passengers}</span>
                <strong style={{
                  color: "var(--ink-0)", fontVariantNumeric: "tabular-nums",
                  borderTop: "1px solid var(--rule)", paddingTop: 8, marginTop: 4,
                  fontFamily: "'Newsreader', serif", fontSize: 17,
                }}>${totalLegacy}</strong>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            marginTop: 36, display: "flex", gap: 12, alignItems: "center",
          }}>
            <button style={{
              padding: "16px 28px",
              background: "var(--maroon)", color: "#fff",
              border: "none", cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 600,
              letterSpacing: ".18em", textTransform: "uppercase",
              flex: "1",
            }}>
              Continue to Passenger Details →
            </button>
            <button onClick={onClose} style={{
              padding: "16px 24px",
              background: "transparent", color: "var(--ink-0)",
              border: "1px solid var(--ink-0)", cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 600,
              letterSpacing: ".18em", textTransform: "uppercase",
            }}>
              Back to results
            </button>
          </div>

          <div style={{
            marginTop: 18, fontSize: 11.5, color: "var(--ink-3)",
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em",
          }}>
            Legacy-carrier itinerary modeled from typical hub-routed regional service.
            Pricing reference: ERJ-145 block-hour cost $7,450 vs E.C.H.O. $2,009.
          </div>
        </div>
      </div>
    </div>
  );
}

window.SavingsSummary = SavingsSummary;
