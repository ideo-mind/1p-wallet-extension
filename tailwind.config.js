/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // 1P Protocol colors
        protocol: {
          red: '#FF0000',
          green: '#00FF00',
          blue: '#0000FF',
          yellow: '#FFFF00',
        },
        logo: {
          teal: '#00C8C8', // Top of '1' - bright teal
          blue: '#007BFF', // Bottom of '1' - deep blue
          green: '#00FF00', // Color of 'p' - vibrant green
          dark: '#1A1A33', // Background - dark blue-purple
        },
        // Pixel-art color palette
        pixel: {
          bg: '#C4B5A0', // Warm beige background
          bgDark: '#8B7355', // Darker beige
          border: '#5C4033', // Dark brown border
          shadow: '#3E2723', // Deep shadow
          teal: '#00C8C8', // 1P teal
          blue: '#007BFF', // 1P blue
          green: '#00FF00', // 1P green
          accent: '#FF6B6B', // Accent red
          text: '#2C1810', // Dark text
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace'],
        pixelSmall: ['VT323', 'monospace'],
        data: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #00C8C8 0%, #007BFF 100%)', // Logo '1' gradient
        'gradient-success': 'linear-gradient(135deg, #00FF00 0%, #3cba92 100%)', // Logo 'p' green
        'gradient-wallet': 'linear-gradient(135deg, #00C8C8 0%, #007BFF 100%)', // Logo '1' gradient
        'gradient-logo-1': 'linear-gradient(135deg, #00C8C8 0%, #007BFF 100%)', // Logo '1' gradient
        'gradient-logo-p': 'linear-gradient(135deg, #00FF00 0%, #00E000 100%)', // Logo 'p' gradient
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        shake: 'shake 0.3s ease-in-out',
        glitch: 'glitch 3s infinite',
        'glitch-fast': 'glitch 0.5s ease-in-out',
        scanline: 'scanline 4s linear infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '33%': { transform: 'translate(-2px, 2px)' },
          '66%': { transform: 'translate(2px, -2px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        neonPulse: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(0, 200, 200, 0.3), 0 0 10px rgba(0, 200, 200, 0.2)',
          },
          '50%': {
            boxShadow: '0 0 10px rgba(0, 200, 200, 0.5), 0 0 20px rgba(0, 200, 200, 0.3)',
          },
        },
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        glow: '0 0 20px rgba(0, 200, 200, 0.3)', // Logo teal glow
        'glow-sm': '0 0 10px rgba(0, 200, 200, 0.2)', // Logo teal glow
        'glow-blue': '0 0 20px rgba(0, 123, 255, 0.3)', // Logo blue glow
        'glow-green': '0 0 20px rgba(0, 255, 0, 0.3)', // Logo green glow
        neon: '0 0 5px rgba(0, 200, 200, 0.5), 0 0 10px rgba(0, 200, 200, 0.3), 0 0 15px rgba(0, 200, 200, 0.2)',
        'neon-blue': '0 0 5px rgba(0, 123, 255, 0.5), 0 0 10px rgba(0, 123, 255, 0.3)',
        'neon-green': '0 0 5px rgba(0, 255, 0, 0.5), 0 0 10px rgba(0, 255, 0, 0.3)',
        cyber: '0 0 10px rgba(0, 200, 200, 0.4), inset 0 0 10px rgba(0, 200, 200, 0.1)',
        // Pixel-art shadows
        pixel: '4px 4px 0px 0px rgba(0, 0, 0, 0.8)',
        'pixel-sm': '2px 2px 0px 0px rgba(0, 0, 0, 0.8)',
        'pixel-lg': '6px 6px 0px 0px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

