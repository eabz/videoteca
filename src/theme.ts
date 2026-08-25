import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'var(--font-heading), "Iowan Old Style", "Palatino Linotype", serif' },
        body: { value: 'var(--font-body), "Segoe UI", sans-serif' }
      },
      colors: {
        brand: {
          50: { value: '#fbf4ee' },
          100: { value: '#f4e2d4' },
          200: { value: '#e8c3a6' },
          300: { value: '#d89b6e' },
          400: { value: '#c96f3f' },
          500: { value: '#b5471d' },
          600: { value: '#9a3b18' },
          700: { value: '#7c2f14' },
          800: { value: '#5d2412' },
          900: { value: '#40180d' },
          950: { value: '#240d08' }
        }
      }
    },
    semanticTokens: {
      colors: {
        'bg.canvas': { value: '#f3eee6' },
        'bg.surface': { value: '#fffcf7' },
        'bg.muted': { value: '#ebe4d8' },
        'fg.default': { value: '#1c1915' },
        'fg.muted': { value: '#6f675c' },
        'border.subtle': { value: '#e4dcd0' },
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: '#fffaf4' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.50}' },
          emphasized: { value: '{colors.brand.600}' },
          focusRing: { value: '{colors.brand.500}' }
        }
      }
    }
  },
  globalCss: {
    html: {
      colorScheme: 'light'
    },
    body: {
      bg: 'bg.canvas',
      color: 'fg.default',
      overflowX: 'hidden'
    },
    '::selection': {
      bg: 'brand.100',
      color: 'brand.900'
    }
  }
})

export const system = createSystem(defaultConfig, config)
