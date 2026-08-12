/** Credito de autoría. Deliberadamente discreto: presente, nunca protagonista. */
export function Credit({ className = "" }: { className?: string }) {
  return (
    <p className={`credit ${className}`.trim()}>
      Desarrollado por <span className="credit-studio">Somos Alfa</span>
      <span className="credit-sep" aria-hidden="true">
        ·
      </span>
      La Plata
    </p>
  );
}
