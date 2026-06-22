export function TrainerAvatar({ index = 0, className = "", src = "" }) {
  if (src) {
    return (
      <img
        alt="Retrato del entrenador"
        className={`shrink-0 object-cover ${className}`}
        src={src}
      />
    );
  }
  return (
    <div
      className={`coach-photo coach-${index % 6} shrink-0 bg-cover ${className}`}
      role="img"
      aria-label="Retrato del entrenador"
    />
  );
}
