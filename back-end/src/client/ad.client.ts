import axios from 'axios'
import crypto from 'crypto'
import { env } from '../config/env.js'

export interface AzureAdTokenResponse {
  access_token: string
  id_token?: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope?: string
}

export interface AzureAdUserInfo {
  sub?: string
  oid?: string
  name?: string
  email?: string
  preferred_username?: string
}

export function generateCodeVerifier() {
  return base64Url(crypto.randomBytes(32))
}

export function generateState() {
  return base64Url(crypto.randomBytes(16))
}

export function generateCodeChallenge(verifier: string) {
  const hash = crypto.createHash('sha256').update(verifier).digest()
  return base64Url(hash)
}

function base64Url(buffer: Buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function buildAzureAuthorizeUrl(params: {
  tenantId: string
  clientId: string
  redirectUri?: string
  scopes?: string
  state: string
  codeChallenge: string
}) {
  const redirectUri = params.redirectUri ?? env.AZURE_AD_REDIRECT_URI
  const scopes = params.scopes ?? env.AZURE_AD_SCOPES

  const url = new URL(`https://login.microsoftonline.com/${params.tenantId}/oauth2/v2.0/authorize`)
  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_mode', 'query')
  url.searchParams.set('scope', scopes)
  url.searchParams.set('state', params.state)
  url.searchParams.set('code_challenge', params.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')

  return url.toString()
}

export async function exchangeCodeForToken(params: {
  tenantId: string
  clientId: string
  clientSecret?: string
  code: string
  codeVerifier: string
  redirectUri?: string
}) {
  const redirectUri = params.redirectUri ?? env.AZURE_AD_REDIRECT_URI

  const tokenUrl = `https://login.microsoftonline.com/${params.tenantId}/oauth2/v2.0/token`

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: params.clientId,
    code: params.code,
    redirect_uri: redirectUri,
    code_verifier: params.codeVerifier,
  })

  if (params.clientSecret) {
    body.set('client_secret', params.clientSecret)
  }

  const { data } = await axios.post<AzureAdTokenResponse>(tokenUrl, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  return data
}

export async function fetchAzureUserInfo(accessToken: string) {
  const { data } = await axios.get<AzureAdUserInfo>(
    'https://graph.microsoft.com/oidc/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  return data
}
