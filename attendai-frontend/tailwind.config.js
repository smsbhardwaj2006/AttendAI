/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        ink: {
          DEFAULT: '#0B1220', // primary dark surface (near-black navy, not pure black)
          800: '#0F172A',
          700: '#152238',
          600: '#1E2E4A',
        },
        paper: '#F6F8FB', // light app background
        card: '#FFFFFF',
        line: '#E3E8F0', // hairline borders on light surfaces
        linedark: '#223047',
        // Text
        ink900: '#0B1220',
        ink600: '#4B5A72',
        ink400: '#8493A8',
        // Signal accent — the "recognition" cyan used for scan/AI moments
        signal: {
          DEFAULT: '#0FB5BA',
          50: '#E7FAFA',
          400: '#2FCBCF',
          500: '#0FB5BA',
          600: '#0B8F93',
          700: '#086A6D',
        },
        // Status colors mapped to attendance states
        present: '#1FA971',
        late: '#D98C2B',
        absent: '#D14343',
        spoof: '#B23B6B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.04), 0 1px 8px rgba(11,18,32,0.04)',
        pop: '0 8px 24px rgba(11,18,32,0.12)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(15,181,186,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,181,186,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '28px 28px',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(15,181,186,0.45)' },
          '100%': { boxShadow: '0 0 0 10px rgba(15,181,186,0)' },
        },
      },
      animation: {
        scan: 'scan 2.4s linear infinite',
        pulseRing: 'pulseRing 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
