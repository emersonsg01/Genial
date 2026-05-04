module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          300: '#a5b4fc',
          500: '#6366f1',
          700: '#4f46e5'
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c'
        }
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem'
      },
      borderRadius: {
        'xl': '1rem'
      }
    }
  },
  plugins: [],
}
