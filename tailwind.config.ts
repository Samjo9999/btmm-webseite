import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'btb-rot': 'var(--btb-rot)',
        'btb-oliv': 'var(--btb-oliv)',
        'btb-creme': 'var(--btb-creme)',
        'btb-blau': 'var(--btb-blau)',
        'btb-dunkel': 'var(--btb-dunkel)',
        'btb-weiss': 'var(--btb-weiss)',
        'btmm-primary': 'var(--btmm-primary)',
        'btmm-hell': 'var(--btmm-hell)',
        'btmm-dunkel': 'var(--btmm-dunkel)',
        'btmm-akzent': 'var(--btmm-akzent)',
        'btmm-weiss': 'var(--btmm-weiss)',
      },
      fontFamily: {
        heading: ['var(--font-garamond)', 'Georgia', 'serif'],
        body: ['var(--font-garamond)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
}

export default config
