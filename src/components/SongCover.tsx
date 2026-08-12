/**
 * Portada generada: superficie tenida con un matiz estable derivado de la
 * cancion, con la marca de CecuFy encima.
 *
 * El matiz vive en `--cover-hue`. Si un ancestro ya lo define (la tarjeta lo
 * hace, para poder tenir tambien su vidrio) se hereda; si no, lo fija aca.
 */

/** Hash estable -> matiz 0-359. La misma cancion siempre da el mismo tono. */
export function coverHue(seed: string): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  // Etapa de avalancha (fmix32): sin ella los ids parecidos caen en matices
  // contiguos y todas las portadas terminan del mismo color.
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return Math.abs(hash) % 360;
}

/** Estilo listo para pegar en cualquier contenedor que quiera el tinte. */
export function hueStyle(seed: string): React.CSSProperties {
  return { ["--cover-hue" as string]: coverHue(seed) };
}

export function SongCover({
  seed,
  className = "",
  size,
}: {
  seed?: string;
  className?: string;
  size?: number;
}) {
  const style: React.CSSProperties = seed ? hueStyle(seed) : {};
  if (size) {
    style.width = size;
    style.height = size;
  }
  return (
    <span className={`song-cover ${className}`.trim()} style={style} aria-hidden="true">
      <span className="cover-mark" />
    </span>
  );
}
