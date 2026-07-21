import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Dev stand-in for the /api/judgeme Vercel function — same path, so the app
// code is identical in dev and production.
function judgemeDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'judgeme-dev',
    configureServer(server) {
      server.middlewares.use('/api/judgeme', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          })
          res.end()
          return
        }

        if (req.method === 'GET') {
          ;(async () => {
            try {
              const upstream = await fetch(
                `https://api.judge.me/api/v1/reviews?shop_domain=${env.VITE_JUDGEME_SHOP_DOMAIN}&per_page=200`,
                { headers: { 'X-Api-Token': env.JUDGEME_PRIVATE_TOKEN ?? '' } },
              )
              const data = await upstream.json()
              res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(data))
            } catch {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ reviews: [] }))
            }
          })()
          return
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        let raw = ''
        req.on('data', (chunk: Buffer) => { raw += chunk.toString() })
        req.on('end', () => {
          ;(async () => {
            try {
              const payload = JSON.parse(raw) as Record<string, unknown>
              const { id, email, name, rating, title, body } = payload

              if (!id || !email || !name || !rating || !body) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ message: 'Missing required fields' }))
                return
              }

              const upstream = await fetch('https://api.judge.me/api/v1/reviews', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Api-Token': env.JUDGEME_PRIVATE_TOKEN ?? '',
                },
                body: JSON.stringify({
                  shop_domain: env.VITE_JUDGEME_SHOP_DOMAIN,
                  platform: 'shopify',
                  id,
                  email,
                  name,
                  rating,
                  title,
                  body,
                }),
              })

              const data = await upstream.json()
              res.writeHead(upstream.status, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              })
              res.end(JSON.stringify(data))
            } catch {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ message: 'Failed to submit review.' }))
            }
          })()
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), judgemeDevPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
