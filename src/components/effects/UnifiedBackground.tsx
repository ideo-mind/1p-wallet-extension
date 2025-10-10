interface UnifiedBackgroundProps {
  variant?: 'default' | 'subtle' | 'dense' | 'none';
  color?: 'teal' | 'blue' | 'green' | 'mixed';
}

export const UnifiedBackground = ({ 
  variant = 'default',
  color = 'teal'
}: UnifiedBackgroundProps) => {
  const densityMap = {
    none: 0,
    subtle: 15,
    default: 25,
    dense: 35
  };

  const colorMap = {
    teal: 'teal',
    blue: 'blue', 
    green: 'green',
    mixed: 'teal' // Will be enhanced later for mixed colors
  };

  if (variant === 'none') {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: densityMap[variant] }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 bg-logo-${colorMap[color]} rounded-full opacity-20`}
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
