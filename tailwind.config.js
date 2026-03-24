/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modo Claro
        primary: {
          DEFAULT: '#06B6D4', // Azul Turquesa Fresco
          dark: '#0891B2',
          light: '#22D3EE',
        },
        secondary: {
          DEFAULT: '#10B981', // Verde Menta
          dark: '#059669',
          light: '#34D399',
        },
        accent: {
          DEFAULT: '#FBBF24', // Amarillo Suave
          dark: '#F59E0B',
          light: '#FCD34D',
        },
        // Modo Oscuro
        dark: {
          bg: '#111827', // Gris Pizarra Oscuro
          card: '#1F2937',
          border: '#374151',
        },
        // Neutrales
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          light: '#F3F4F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
