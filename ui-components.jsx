// ui-components.jsx — Atoms used across the ElectRAM site.
// Loaded as a Babel script BEFORE app.jsx. Exports to window.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Aircraft mark / placeholder ─────────────────────────────────────────────
function EchoMark({ size = 18, color = "currentColor" }) {
  // Stylized side-profile aircraft glyph — simple, original, used in nav + buttons.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 13 L22 11 L22 13 L14 14 L11 20 L9 20 L10 14 L5 14 L4 16 L2.5 16 L3 13 Z"
            fill={color}/>
    </svg>
  );
}

// Striped image placeholder — used wherever a real ECHO photo should drop in.
function ImageSlot({ label, height = 320, ratio, tone = "maroon", style }) {
  const bg = tone === "maroon"
    ? "repeating-linear-gradient(135deg, #6e1834 0 14px, #5a142b 14px 28px)"
    : tone === "ink"
    ? "repeating-linear-gradient(135deg, #18191c 0 14px, #0f1013 14px 28px)"
    : "repeating-linear-gradient(135deg, #ebe7dc 0 14px, #e1ddd1 14px 28px)";
  const fg = tone === "paper" ? "#5a5247" : "#f3ede1";
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: ratio ? undefined : height,
        aspectRatio: ratio,
        background: bg,
        color: fg,
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 6, padding: 24, textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 10, letterSpacing: ".22em", opacity: .7,
        }}>
          DROP IMAGE
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase",
          maxWidth: 360, lineHeight: 1.4,
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// Monospace technical label — used for things like "DEP / ARR / DUR"
function TechLabel({ children, style }) {
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: 10, letterSpacing: ".18em",
      textTransform: "uppercase",
      color: "var(--ink-3)",
      ...style,
    }}>
      {children}
    </span>
  );
}

// Pill / chip
function Chip({ children, tone = "default", style }) {
  const tones = {
    default: { bg: "#efece3", fg: "var(--ink-1)", bd: "transparent" },
    maroon:  { bg: "transparent", fg: "var(--maroon)", bd: "var(--maroon)" },
    orange:  { bg: "var(--orange)", fg: "#fff", bd: "transparent" },
    ghost:   { bg: "transparent", fg: "var(--ink-2)", bd: "var(--rule)" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 9px",
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase",
      background: t.bg, color: t.fg,
      border: `1px solid ${t.bd}`,
      ...style,
    }}>
      {children}
    </span>
  );
}

// Hairline maroon underline used for serif headers
function Rule({ color = "var(--maroon)", height = 1, style }) {
  return <div style={{ height, background: color, ...style }} />;
}

// Big serif display number — used for prices and time savings
function DisplayNumber({ value, prefix, suffix, size = 56, style }) {
  return (
    <span style={{
      fontFamily: "'Newsreader', Georgia, serif",
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: "-0.01em",
      color: "var(--ink-0)",
      fontVariantNumeric: "tabular-nums",
      ...style,
    }}>
      {prefix && <span style={{ fontSize: size * 0.55, verticalAlign: "0.18em", marginRight: 2 }}>{prefix}</span>}
      {value}
      {suffix && <span style={{ fontSize: size * 0.5, marginLeft: 4, color: "var(--ink-2)" }}>{suffix}</span>}
    </span>
  );
}

// Minimal segmented control
function Segmented({ value, onChange, options, style }) {
  return (
    <div style={{
      display: "inline-flex", border: "1px solid var(--rule-strong)",
      background: "var(--paper)", ...style,
    }}>
      {options.map((opt) => {
        const v = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              padding: "10px 18px",
              background: active ? "var(--ink-0)" : "transparent",
              color: active ? "#fff" : "var(--ink-1)",
              border: "none",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Stepper for passenger count
function Stepper({ value, onChange, min = 1, max = 9 }) {
  const Btn = ({ children, disabled, onClick }) => (
    <button type="button" disabled={disabled} onClick={onClick} style={{
      width: 36, height: 36, border: "1px solid var(--rule-strong)",
      background: disabled ? "transparent" : "var(--paper)",
      color: disabled ? "var(--ink-3)" : "var(--ink-0)",
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "'JetBrains Mono', monospace", fontSize: 14, lineHeight: 1,
    }}>{children}</button>
  );
  return (
    <div style={{ display: "inline-flex", alignItems: "stretch", gap: 0 }}>
      <Btn disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</Btn>
      <div style={{
        width: 48, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule-strong)",
        fontFamily: "'Newsreader', serif", fontSize: 18, fontWeight: 500,
      }}>{value}</div>
      <Btn disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</Btn>
    </div>
  );
}

// Native-looking select wrapped in our rules
function FieldSelect({ value, onChange, options, label, hint }) {
  return (
    <label style={{ display: "block" }}>
      <TechLabel>{label}</TechLabel>
      <div style={{ position: "relative", marginTop: 6 }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", appearance: "none",
            padding: "12px 36px 12px 14px",
            background: "var(--paper)", color: "var(--ink-0)",
            border: "1px solid var(--rule-strong)",
            fontFamily: "'Newsreader', serif", fontSize: 18, fontWeight: 500,
            cursor: "pointer", borderRadius: 0,
          }}
        >
          {options.map(([code, name]) => (
            <option key={code} value={code}>{code} · {name}</option>
          ))}
        </select>
        <span style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          pointerEvents: "none", color: "var(--ink-2)", fontSize: 12,
        }}>▾</span>
      </div>
      {hint && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4,
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".08em",
      }}>{hint}</div>}
    </label>
  );
}

function FieldDate({ value, onChange, label, min, disabled }) {
  return (
    <label style={{ display: "block", opacity: disabled ? 0.45 : 1 }}>
      <TechLabel>{label}</TechLabel>
      <input
        type="date"
        value={value}
        min={min}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          marginTop: 6, width: "100%",
          padding: "12px 14px",
          background: "var(--paper)", color: "var(--ink-0)",
          border: "1px solid var(--rule-strong)",
          fontFamily: "'Newsreader', serif", fontSize: 18, fontWeight: 500,
          borderRadius: 0,
        }}
      />
    </label>
  );
}

Object.assign(window, {
  EchoMark, ImageSlot, TechLabel, Chip, Rule, DisplayNumber,
  Segmented, Stepper, FieldSelect, FieldDate,
});
