export function Logo({ size = 40, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <span className="logo" style={{ gap: size * 0.32 }}>
      <span className="logo-mark" style={{ width: size, height: size }} aria-hidden="true" />
      {showWordmark && (
        <span className="logo-wordmark" style={{ fontSize: size * 0.62 }}>
          CecuFy
        </span>
      )}
    </span>
  );
}
