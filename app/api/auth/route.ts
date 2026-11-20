import { NextResponse } from 'next/server'

/**
 * Decap → GitHub OAuth Start.
 * Env (nur Vercel Preview): GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET
 */
export async function GET(request: Request) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      {
        error:
          'GITHUB_OAUTH_CLIENT_ID fehlt. OAuth-App anlegen und Env nur in Vercel Preview setzen (siehe public/admin/LIESMICH.md).',
      },
      { status: 503 },
    )
  }

  const url = new URL(request.url)
  const origin = `${url.protocol}//${url.host}`
  const redirectUri = `${origin}/api/callback`
  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', clientId)
  authorize.searchParams.set('scope', 'repo,user')
  authorize.searchParams.set('redirect_uri', redirectUri)

  return NextResponse.redirect(authorize.toString())
}
