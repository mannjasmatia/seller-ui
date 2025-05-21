/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shimmer: {
          '0%': { 
            backgroundPosition: '-200% 0',
            transform: 'translateX(-100%)'
          },
          '100%': { 
            backgroundPosition: '200% 0',
            transform: 'translateX(100%)'
          },
        },
        // Enhanced version with wave effect
        shimmerWave: {
          '0%': { 
            backgroundPosition: '-200% 0',
            transform: 'translateX(-100%) translateY(0px)'
          },
          '50%': {
            transform: 'translateX(0%) translateY(-2px)'
          },
          '100%': { 
            backgroundPosition: '200% 0',
            transform: 'translateX(100%) translateY(0px)'
          },
        },
        // Fixed diagonal shimmer effect
        shimmerDiagonal: {
          '0%': { 
            backgroundPosition: '-200% -200%'
          },
          '25%': {
            backgroundPosition: '-100% -100%'
          },
          '50%': {
            backgroundPosition: '0% 0%'
          },
          '75%': {
            backgroundPosition: '100% 100%'
          },
          '100%': { 
            backgroundPosition: '200% 200%'
          },
        }
      },
      animation: {
        slideIn: 'slideIn 0.5s forwards',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        // Basic shimmer animation
        shimmer: 'shimmer 2s infinite linear',
        // Different speeds
        'shimmer-fast': 'shimmer 1.2s infinite linear',
        'shimmer-slow': 'shimmer 3s infinite linear',
        // Enhanced versions
        'shimmer-wave': 'shimmerWave 2.5s infinite ease-in-out',
        'shimmer-diagonal': 'shimmerDiagonal 2s infinite linear',
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
        'shimmer-gradient-dark': 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.25) 50%, transparent 100%)', // Darker version
        'shimmer-gradient-colored': 'linear-gradient(90deg, transparent 0%, rgba(237, 28, 36, 0.3) 50%, transparent 100%)',
        'shimmer-gradient-diagonal': 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)', // Added diagonal gradient
        'shimmer-gradient-diagonal-dark': 'linear-gradient(45deg, transparent 0%, rgba(0, 0, 0, 0.25) 50%, transparent 100%)', // Added dark diagonal gradient
      },
      backgroundSize: {
        'shimmer': '200% 100%',
        'shimmer-diagonal': '200% 200%', // Added proper background size for diagonal shimmer
      },
      colors: {
        'cb-red': '#ED1C24',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        // Pre-made shimmer utilities
        '.shimmer-base': {
          'position': 'relative',
          'overflow': 'hidden',
          '&::after': {
            'content': '""',
            'position': 'absolute',
            'top': '0',
            'right': '0',
            'bottom': '0',
            'left': '0',
            'backgroundImage': 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.6) 50%, transparent 100%)',
            'backgroundSize': '200% 100%',
            'animation': 'shimmer 2s infinite linear'
          }
        },
        '.shimmer-light': {
          '&::after': {
            'backgroundImage': 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
          }
        },
        '.shimmer-dark': {
          '&::after': {
            'backgroundImage': 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)', // Darker version (was 0.2)
          }
        },
        '.shimmer-colored': {
          '&::after': {
            'backgroundImage': 'linear-gradient(90deg, transparent 0%, rgba(237, 28, 36, 0.6) 50%, transparent 100%)',
          }
        },
        // Added diagonal shimmer utilities
        '.shimmer-diagonal': {
          '&::after': {
            'backgroundImage': 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
            'backgroundSize': '200% 200%',
            'animation': 'shimmerDiagonal 2s infinite linear'
          }
        },
        '.shimmer-diagonal-dark': {
          '&::after': {
            'backgroundImage': 'linear-gradient(45deg, transparent 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
            'backgroundSize': '200% 200%',
            'animation': 'shimmerDiagonal 2s infinite linear'
          }
        },
      })
    }
  ],
  safelist: [
    'bg-cb-red',
    'text-cb-red',
    'border-cb-red',
    'hover:bg-cb-red',
    'focus:ring-cb-red',
    'no-scrollbar',
    // Add shimmer classes to safelist
    'animate-shimmer',
    'animate-shimmer-fast',
    'animate-shimmer-slow',
    'animate-shimmer-wave',
    'animate-shimmer-diagonal',
    'bg-shimmer-gradient',
    'bg-shimmer-gradient-dark',
    'bg-shimmer-gradient-colored',
    'bg-shimmer-gradient-diagonal',
    'bg-shimmer-gradient-diagonal-dark',
    'bg-shimmer',
    'bg-shimmer-diagonal',
    'shimmer-base',
    'shimmer-light',
    'shimmer-dark',
    'shimmer-colored',
    'shimmer-diagonal',
    'shimmer-diagonal-dark',
    'bg-transparent',
    'bg-opacity-10',
    'backdrop-blur-sm'
  ],
}