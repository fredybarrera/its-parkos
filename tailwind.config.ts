// Sistema de diseño de ParkOS. Los nombres de color no son sinónimos de los
// de Tailwind por defecto (slate/emerald/rose/amber): son material del
// propio mundo del estacionamiento, así que cada uso encodea significado.
//
//   asphalt  — concreto/asfalto. Neutros cálidos de todo el shell.
//   signal   — verde de semáforo/vía libre. Plan núcleo, estados "ok".
//   hazard   — amarillo de franja de barrera / señalización LED. Es el
//              color del plan Control: aparece en barreras, cámara LPR,
//              señalización dinámica y en el propio flip de plan.
//   brake    — rojo de luz de freno. Ocupado, bloqueado, error.
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        asphalt: {
          50: '#F7F5F0',
          100: '#EFEBE2',
          200: '#E0DACC',
          300: '#C7BFAD',
          400: '#A39A86',
          500: '#7D7461',
          600: '#5F5848',
          700: '#463F33',
          800: '#2E2922',
          900: '#1C1812',
        },
        signal: {
          50: '#EAF7EE',
          100: '#D3EEDC',
          200: '#BEE8CC',
          300: '#93D8AC',
          400: '#4FBE7C',
          500: '#1FA456',
          600: '#128345',
          700: '#0C6536',
        },
        hazard: {
          50: '#FDF6E0',
          100: '#FBEBBE',
          300: '#F5CE5C',
          400: '#EFB91E',
          500: '#D69A00',
          600: '#AD7B00',
          900: '#4A3300',
        },
        brake: {
          50: '#FCEEEA',
          100: '#F8D9D0',
          200: '#F0B6A6',
          500: '#C8451F',
          600: '#A83716',
          700: '#832A10',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
} satisfies Config
