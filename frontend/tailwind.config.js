/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        mute: '#6b6b6b',
        line: '#e7e5e1',
        'line-hover': '#cdc9c1',
        soft: '#f6f4f0',
        acc: '#d4421f', // Vermilion (only accent)
        ok: '#2f7d4f',
        okb: '#eef5f0',
        warn: '#8f6200',
        warnb: '#f8f1e0',
        bad: '#b3261e',
        badb: '#f9ebe9',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Public Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        btn: '6px',
        card: '8px',
        chip: '4px',
        bar: '4px',
      },
      boxShadow: {
        'focus-ring': '0 0 0 3px rgba(17, 17, 17, 0.07)',
      },
    },
  },
  plugins: [],
}
