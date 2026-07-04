import type { VercelRequest, VercelResponse } from '@vercel/node'

const APP_ID = process.env.VITE_SQUARE_APP_ID as string
const APP_SECRET = process.env.SQUARE_APP_SECRET as string
const ENVIRONMENT = process.env.SQUARE_ENVIRONMENT as string
const REDIRECT_URL = process.env.SQUARE_REDIRECT_URL as string

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error, state } = req.query

  // Clear the nonce cookie regardless of outcome — it's single-use.
  res.setHeader('Set-Cookie', 'sq_oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/api/oauth')

  if (error || !code) {
    res.status(400).send(`OAuth error: ${error ?? 'no code received'}`)
    return
  }

  if (!state || !req.cookies.sq_oauth_state || state !== req.cookies.sq_oauth_state) {
    res.status(400).send('Invalid or missing OAuth state — possible CSRF attempt. Restart the flow from /api/oauth/authorize.')
    return
  }

  const baseUrl =
    ENVIRONMENT === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com'

  try {
    const response = await fetch(`${baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        code: String(code),
        redirect_uri: REDIRECT_URL,
        grant_type: 'authorization_code',
      }),
    })

    const data = await response.json()

    if (!response.ok || data.errors) {
      res.status(400).json(data)
      return
    }

    res.setHeader('Content-Type', 'text/html')
    res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <title>Square OAuth — Success</title>
  <style>
    body { font-family: monospace; padding: 40px; max-width: 640px; margin: 0 auto; }
    h2 { color: #2d6a4f; }
    textarea { width: 100%; height: 72px; padding: 10px; font-family: monospace; font-size: 13px; border: 1px solid #ccc; border-radius: 6px; resize: none; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow: auto; font-size: 12px; }
    .label { font-size: 14px; margin: 20px 0 6px; }
    .step { background: #e8f5e9; border-left: 3px solid #2d6a4f; padding: 12px 16px; border-radius: 4px; font-size: 13px; line-height: 1.6; }
  </style>
</head>
<body>
  <h2>✅ Authorization successful</h2>
  <div class="step">
    Copy the token below and add it to your <code>.env</code> file:<br>
    <code>SQUARE_ACCESS_TOKEN=&lt;paste here&gt;</code><br><br>
    Then restart the dev server — the booking API routes will use it automatically.
  </div>
  <p class="label">Access token:</p>
  <textarea onclick="this.select()" readonly>${data.access_token}</textarea>
  <p class="label">Full response:</p>
  <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>`)
  } catch (err) {
    res.status(500).send(`Server error: ${String(err)}`)
  }
}
