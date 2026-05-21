// CaliAPP 2026 — Animated mesh aurora background.
// First child of the app shell container.

export function Aurora() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute rounded-full mix-blend-screen"
        style={{
          width: '60vw',
          height: '60vw',
          top: '-20vw',
          left: '-10vw',
          background: 'radial-gradient(circle, rgba(132,255,0,0.30), transparent 60%)',
          filter: 'blur(80px)',
          animation: 'cali-drift 24s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate',
          animationDelay: '-2s',
        }}
      />
      <div
        className="absolute rounded-full mix-blend-screen"
        style={{
          width: '50vw',
          height: '50vw',
          top: '-10vw',
          right: '-15vw',
          background: 'radial-gradient(circle, rgba(77,139,255,0.28), transparent 60%)',
          filter: 'blur(80px)',
          animation: 'cali-drift 24s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate',
          animationDelay: '-10s',
        }}
      />
      <div
        className="absolute rounded-full mix-blend-screen"
        style={{
          width: '60vw',
          height: '60vw',
          bottom: '-25vw',
          left: '25vw',
          background: 'radial-gradient(circle, rgba(168,85,247,0.22), transparent 60%)',
          filter: 'blur(80px)',
          animation: 'cali-drift 24s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate',
          animationDelay: '-16s',
        }}
      />
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>")`,
        }}
      />
    </div>
  );
}
