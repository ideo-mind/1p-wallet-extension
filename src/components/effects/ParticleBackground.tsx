interface ParticleBackgroundProps {
  density?: number;
  color?: 'teal' | 'blue' | 'green';
}

export const ParticleBackground = ({
  density = 20,
  color = 'teal'
}: ParticleBackgroundProps) => {
  const colorMap = {
    teal: 'bg-logo-teal',
    blue: 'bg-logo-blue',
    green: 'bg-logo-green',
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: density }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 ${colorMap[color]} rounded-full opacity-20`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

