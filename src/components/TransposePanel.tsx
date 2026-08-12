import { majorKeys, minorKeys, type Accidental, type Notation } from "../lib/transpose";

/** Perilla de dos posiciones con pastilla deslizante. */
function Knob<T extends string>({
  value,
  options,
  onChange,
  label,
  width = 34,
}: {
  value: T;
  options: [{ value: T; text: string; label: string }, { value: T; text: string; label: string }];
  onChange: (value: T) => void;
  label: string;
  width?: number;
}) {
  const isSecond = value === options[1].value;
  return (
    <div className="knob" role="group" aria-label={label}>
      <span
        className="knob-pill"
        aria-hidden="true"
        style={{ width, transform: isSecond ? `translateX(${width}px)` : undefined }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          className={value === opt.value ? "active" : ""}
          style={{ width }}
          aria-label={opt.label}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.text}
        </button>
      ))}
    </div>
  );
}

export function TransposePanel({
  targetKey,
  accidental,
  notation,
  onKeyChange,
  onAccidentalChange,
  onNotationChange,
}: {
  targetKey: string;
  accidental: Accidental;
  notation: Notation;
  onKeyChange: (key: string) => void;
  onAccidentalChange: (accidental: Accidental) => void;
  onNotationChange: (notation: Notation) => void;
}) {
  const majors = majorKeys(accidental, notation);
  const minors = minorKeys(accidental, notation);
  const isActive = (key: string) => key === targetKey;

  return (
    <div className="transpose-panel">
      <div className="scale-picker">
        <div className="scale-picker-head">
          <span className="scale-picker-label">Transponer a</span>

          <div className="knob-group">
            <Knob
              label="Cifrado"
              value={notation}
              width={52}
              options={[
                { value: "latin", text: "DO", label: "Cifrado normal (DO RE MI)" },
                { value: "american", text: "C", label: "Cifrado americano (C D E)" },
              ]}
              onChange={onNotationChange}
            />
            <Knob
              label="Grafía de alteraciones"
              value={accidental}
              options={[
                { value: "sharp", text: "♯", label: "Sostenidos" },
                { value: "flat", text: "♭", label: "Bemoles" },
              ]}
              onChange={onAccidentalChange}
            />
          </div>
        </div>

        <div className="scale-rows">
          <div className="scale-row">
            <span className="scale-row-label">Mayores</span>
            {majors.map((key) => (
              <button
                key={key}
                className={`scale-chip${isActive(key) ? " active" : ""}`}
                aria-pressed={isActive(key)}
                onClick={() => onKeyChange(key)}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="scale-row">
            <span className="scale-row-label">Menores</span>
            {minors.map((key) => (
              <button
                key={key}
                className={`scale-chip${isActive(key) ? " active" : ""}`}
                aria-pressed={isActive(key)}
                onClick={() => onKeyChange(key)}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
