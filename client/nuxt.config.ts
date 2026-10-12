// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false, // Client-side rendered for pure real-time browser game interaction

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  css: [
    '~/assets/css/main.css'
  ],

  runtimeConfig: {
    public: {
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || ''
    }
  },

  vite: {
    server: {
      // Explicitly allow ngrok tunnels, local tunnels, and custom hostnames
      allowedHosts: [
        'impulsive-waggle-guzzler.ngrok-free.dev',
        '.ngrok-free.dev',
        '.ngrok.io',
        '.ngrok.app',
        'localhost',
        '127.0.0.1'
      ],
      proxy: {
        '/socket.io': {
          target: 'http://localhost:4000',
          ws: true,
          changeOrigin: true
        }
      }
    }
  },

  nitro: {
    routeRules: {
      '/socket.io/**': {
        proxy: 'http://localhost:4000/socket.io/**'
      }
    }
  },

  app: {
    head: {
      title: 'DEAD SIGNAL — Multiplayer Horror Strategy',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'description', content: 'Authoritative 1v1 psychological turn-based horror chamber roulette strategy game.' },
        { name: 'theme-color', content: '#060707' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  }
});
