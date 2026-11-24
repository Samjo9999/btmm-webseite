import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const origin = `${url.protocol}//${url.host}`

  if (!clientId || !clientSecret) {
    return new NextResponse(
      '<p>OAuth-Env fehlt (GITHUB_OAUTH_CLIENT_ID / SECRET). Siehe /admin/LIESMICH.md</p>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }
  if (!code) {
    return new NextResponse('<p>Kein code von GitHub.</p>', {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${origin}/api/callback`,
    }),
  })
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string
    error?: string
    error_description?: string
  }

  if (!tokenJson.access_token) {
    const msg = tokenJson.error_description || tokenJson.error || 'Token fehlgeschlagen'
    return new NextResponse(`<p>${msg}</p>`, {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const content = {
    token: tokenJson.access_token,
    provider: 'github',
  }
  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"/><title>Login…</title></head>
<body>
<script>
(function () {
  function receive() {
    var data = 'authorization:github:success:${JSON.stringify(content)}';
    if (window.opener) {
      window.opener.postMessage(data, '*');
      window.close();
    } else {
      document.body.textContent = 'Login ok — Fenster schließen und Admin neu laden.';
    }
  }
  receive();
})();
</script>
</body></html>`

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
