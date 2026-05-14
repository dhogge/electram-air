// flight-card.jsx — ECHO flight result card + the 3 comparison variations.

const { useState: useState_FC } = React;

function fmtTime(h, m) { return window.FL.fmtTime(h, m); }
function minStr(m) { return window.FL.minutesToStr(m); }

// ── Small leg readout: dep time -> arr time, with route codes ───────────────
function LegReadout({ depH, depM, arrH, arrM, depCode, arrCode, durH, durM, mode = "echo" }) {
  const [dt, dap] = fmtTime(depH, depM);
  const [at, aap] = fmtTime(arrH, arrM);
  const dur = durM ? `${durH}h ${durM}m` : `${durH}h`;
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const timeSize = isMobile ? 30 : 40;
  const ampmSize = isMobile ? 13 : 16;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 14 : 32 }}>
      <div>
        <div style={{
          fontFamily: "'Newsreader', serif", fontSize: timeSize, fontWeight: 500,
          lineHeight: 1, color: "var(--ink-0)", letterSpacing: "-0.01em",
        }}>
          {dt}<span style={{
            fontSize: ampmSize, marginLeft: 4, color: "var(--ink-2)", verticalAlign: "0.4em",
          }}>{dap}</span>
        </div>
        <div style={{
          marginTop: 8, fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, letterSpacing: ".12em", color: "var(--ink-2)",
        }}>{depCode}</div>
      </div>

      <div style={{ flex: 1, minWidth: isMobile ? 60 : 120, textAlign: "center" }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: ".18em", color: "var(--ink-2)", marginBottom: 8,
        }}>{dur} · {mode === "echo" ? "NONSTOP" : "1 STOP"}</div>
        <div style={{
          height: 1, background: "var(--ink-2)", position: "relative",
        }}>
          <span style={{
            position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
            background: "var(--paper)", padding: "0 6px",
            fontSize: 14, color: "var(--ink-2)",
          }}>✈</span>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{
          fontFamily: "'Newsreader', serif", fontSize: timeSize, fontWeight: 500,
          lineHeight: 1, color: "var(--ink-0)", letterSpacing: "-0.01em",
        }}>
          {at}<span style={{
            fontSize: ampmSize, marginLeft: 4, color: "var(--ink-2)", verticalAlign: "0.4em",
          }}>{aap}</span>
        </div>
        <div style={{
          marginTop: 8, fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, letterSpacing: ".12em", color: "var(--ink-2)",
        }}>{arrCode}</div>
      </div>
    </div>
  );
}

// ── Time advantage callout (drive vs fly) ───────────────────────────────────
function TimeAdvantage({ flight }) {
  const drive = window.FL.getDrive(flight.dep_code, flight.arr_code);
  if (!drive) return null;
  const driveM = drive.h * 60 + drive.m;
  const flyM = flight.dur_h * 60 + flight.dur_m;
  const saved = driveM - flyM;
  if (saved <= 0) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      padding: "10px 14px",
      background: "rgba(229,117,31,.07)",
      borderLeft: "2px solid var(--orange)",
      marginTop: 14,
    }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: ".18em", color: "var(--orange)", fontWeight: 600,
      }}>TIME ADVANTAGE</span>
      <span style={{ fontSize: 13, color: "var(--ink-1)" }}>
        Drive <strong style={{ color: "var(--ink-0)" }}>{minStr(driveM)}</strong>
        {" · "}
        Fly <strong style={{ color: "var(--ink-0)" }}>{minStr(flyM)}</strong>
        {" · "}
        <span style={{ color: "var(--orange)", fontWeight: 600 }}>
          You save {minStr(saved)}
        </span>
      </span>
    </div>
  );
}

// ── Conventional comparison: inline expanding row inside a card ─────────────
function InlineCompare({ flight }) {
  const [open, setOpen] = useState_FC(false);
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const L = flight.legacy;
  return (
    <div style={{
      borderTop: "1px solid var(--rule)",
      marginTop: 18,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", textAlign: "left",
        background: "transparent", border: "none", cursor: "pointer",
        padding: "12px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        letterSpacing: ".14em", textTransform: "uppercase",
        color: "var(--maroon)",
      }}>
        <span>
          Compare to a regional jet via {L.hub} →
        </span>
        <span style={{ fontSize: 14 }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div style={{
          padding: "8px 0 18px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 14 : 24,
        }}>
          {/* ECHO column */}
          <div style={{
            padding: 16,
            background: "rgba(134,31,65,.05)",
            border: "1px solid rgba(134,31,65,.2)",
          }}>
            <Chip tone="maroon">E.C.H.O. · this booking</Chip>
            <div style={{ marginTop: 16 }}>
              <TechLabel>Door to gate</TechLabel>
              <div style={{
                fontFamily: "'Newsreader', serif", fontSize: 32,
                fontWeight: 500, color: "var(--ink-0)", marginTop: 4,
                lineHeight: 1,
              }}>{minStr(L.echoTotalMin)}</div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--ink-1)", lineHeight: 1.7 }}>
              <Row label="Drive to airport" value="On-site or 15 min" />
              <Row label="Check-in window" value="15 min" />
              <Row label="Flight time" value={minStr(flight.dur_h * 60 + flight.dur_m)} />
              <Row label="Connections" value="None" />
            </div>
          </div>

          {/* Legacy column */}
          <div style={{
            padding: 16,
            background: "rgba(14,15,18,.04)",
            border: "1px solid var(--rule)",
          }}>
            <Chip tone="ghost">Regional Jet · via {L.hub}</Chip>
            <div style={{ marginTop: 16 }}>
              <TechLabel>Door to gate</TechLabel>
              <div style={{
                fontFamily: "'Newsreader', serif", fontSize: 32,
                fontWeight: 500, color: "var(--ink-0)", marginTop: 4,
                lineHeight: 1,
              }}>{minStr(L.totalMin)}</div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--ink-1)", lineHeight: 1.7 }}>
              <Row label={`Drive to ${L.hub}`} value={minStr(L.driveOutMin)} />
              <Row label="Security & boarding" value={minStr(L.securityMin)} />
              <Row label="Flight time" value={minStr(L.flightMin)} />
              <Row label="Bag claim & drive" value={minStr(L.baggageMin + L.driveInMin)} />
            </div>
          </div>
        </div>
      )}

      {open && (
        <div style={{
          padding: "14px 16px",
          background: "var(--ink-0)", color: "#fff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 16, flexWrap: "wrap",
        }}>
          <div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              letterSpacing: ".2em", color: "var(--orange)",
            }}>YOU SAVE</div>
            <div style={{
              fontFamily: "'Newsreader', serif", fontSize: 26,
              fontWeight: 500, marginTop: 2,
            }}>
              {minStr(L.timeSavedMin)} <span style={{ color: "rgba(255,255,255,.55)", fontSize: 16 }}>·</span> ${L.legacyPrice - flight.display_price}
            </div>
          </div>
          <div style={{
            fontSize: 12, color: "rgba(255,255,255,.7)", maxWidth: 340,
          }}>
            Regional jet itinerary estimate. Real legacy fares vary by booking
            window and demand.
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
      <span style={{ color: "var(--ink-2)" }}>{label}</span>
      <span style={{ color: "var(--ink-0)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

// ── ECHO Flight Card ────────────────────────────────────────────────────────
function FlightCard({ flight, comparisonStyle, bookingMode, passengers, onSelect }) {
  const displayPrice = bookingMode === "Charter Aircraft" ? flight.charter_price : flight.price;
  flight.display_price = displayPrice;
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;

  return (
    <article style={{
      background: "var(--paper)",
      border: "1px solid var(--rule)",
      marginBottom: 16,
      position: "relative",
    }}>
      {/* Popular ribbon */}
      {flight.popular && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          background: "var(--maroon)", color: "#fff",
          padding: "5px 14px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5, letterSpacing: ".24em",
        }}>★ MOST POPULAR</div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 240px",
        gap: 0,
      }}>
        {/* Left: itinerary */}
        <div style={{ padding: isMobile ? "22px 18px 18px" : "28px 28px 24px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 18, flexWrap: "wrap",
          }}>
            <Chip tone="ghost">
              <EchoMark size={10} color="var(--maroon)" />
              <span style={{ marginLeft: 4 }}>E.C.H.O. · 19 seats</span>
            </Chip>
            {flight.seats_left && (
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                letterSpacing: ".14em", color: "var(--orange)",
              }}>{flight.seats_left} SEATS LEFT</span>
            )}
          </div>

          <LegReadout
            depH={flight.dep_h} depM={flight.dep_m}
            arrH={flight.arr_h} arrM={flight.arr_m}
            depCode={flight.dep_code} arrCode={flight.arr_code}
            durH={flight.dur_h} durM={flight.dur_m}
          />

          <div style={{
            marginTop: 14,
            fontSize: 12.5, color: "var(--ink-2)",
            display: "flex", gap: 12, flexWrap: "wrap",
          }}>
            <span>{flight.dep_city}</span>
            <span style={{ color: "var(--rule-strong)" }}>·</span>
            <span>{flight.arr_city}</span>
          </div>

          <TimeAdvantage flight={flight} />

          {comparisonStyle === "inline" && <InlineCompare flight={flight} />}
        </div>

        {/* Right: price + select */}
        <div style={{
          borderLeft: isMobile ? "none" : "1px solid var(--rule)",
          borderTop: isMobile ? "1px solid var(--rule)" : "none",
          padding: isMobile ? "20px 18px" : "28px 24px",
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          alignItems: isMobile ? "center" : "stretch",
          justifyContent: "space-between",
          gap: isMobile ? 16 : 0,
          background: "linear-gradient(180deg, transparent, rgba(134,31,65,.025))",
        }}>
          <div>
            <TechLabel>{bookingMode === "Charter Aircraft" ? "Aircraft Charter" : "Per Seat"}</TechLabel>
            <div style={{ marginTop: 6 }}>
              <DisplayNumber value={displayPrice} prefix="$" size={isMobile ? 36 : 48} />
            </div>
            {bookingMode === "Charter Aircraft" && (
              <div style={{
                marginTop: 6, fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, letterSpacing: ".12em", color: "var(--ink-2)",
              }}>UP TO 19 PASSENGERS</div>
            )}
            {bookingMode !== "Charter Aircraft" && passengers > 1 && (
              <div style={{
                marginTop: 6, fontSize: 12, color: "var(--ink-2)",
              }}>
                ${displayPrice * passengers} total · {passengers} passengers
              </div>
            )}
          </div>

          <button onClick={() => onSelect(flight)} style={{
            marginTop: isMobile ? 0 : 20,
            padding: isMobile ? "14px 22px" : "12px 18px",
            background: "var(--ink-0)", color: "#fff",
            border: "none", cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 600,
            letterSpacing: ".18em", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            Select →
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Side-by-side comparison column (variation B) ────────────────────────────
function LegacyCardEquivalent({ flight }) {
  const L = flight.legacy;
  const [dt, dap] = fmtTime(flight.dep_h, flight.dep_m);
  // Legacy depart time: shifted to account for drive to hub
  // Simulated departure approx 2h+drive earlier
  const totalShift = L.driveOutMin + L.securityMin;
  let depTotalMin = flight.dep_h * 60 + flight.dep_m - totalShift;
  if (depTotalMin < 0) depTotalMin += 24 * 60;
  const lDepH = Math.floor(depTotalMin / 60) % 24;
  const lDepM = depTotalMin % 60;
  const arrTotalMin = depTotalMin + L.totalMin;
  const lArrH = Math.floor(arrTotalMin / 60) % 24;
  const lArrM = arrTotalMin % 60;

  return (
    <article style={{
      background: "transparent",
      border: "1px solid var(--rule)",
      borderStyle: "dashed",
      marginBottom: 16,
      opacity: 0.85,
    }}>
      <div style={{ padding: "28px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 18,
        }}>
          <Chip tone="ghost">Regional Jet · via {L.hub}</Chip>
        </div>

        <LegReadout
          depH={lDepH} depM={lDepM}
          arrH={lArrH} arrM={lArrM}
          depCode={flight.dep_code} arrCode={flight.arr_code}
          durH={Math.floor(L.totalMin / 60)} durM={L.totalMin % 60}
          mode="legacy"
        />

        <div style={{
          marginTop: 14, fontSize: 12.5, color: "var(--ink-2)",
        }}>
          Door-to-door including drive to {L.hub} ({minStr(L.driveOutMin)}),
          security ({minStr(L.securityMin)}), and connection.
        </div>

        <div style={{
          marginTop: 14,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 0,
          fontSize: 12.5,
        }}>
          <div>
            <TechLabel>Ticket</TechLabel>
            <div style={{
              fontFamily: "'Newsreader', serif", fontSize: 28,
              fontWeight: 500, color: "var(--ink-0)", marginTop: 4,
            }}>${L.legacyPrice}</div>
          </div>
          <div>
            <TechLabel>Door to door</TechLabel>
            <div style={{
              fontFamily: "'Newsreader', serif", fontSize: 28,
              fontWeight: 500, color: "var(--ink-0)", marginTop: 4,
            }}>{minStr(L.totalMin)}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

Object.assign(window, {
  LegReadout, TimeAdvantage, InlineCompare, FlightCard, LegacyCardEquivalent,
});
