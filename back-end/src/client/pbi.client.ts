import axios from 'axios'
import { env } from '../config/env.js'

export type PowerBIEmbeddedMode = 'MASTER_USER' | 'SERVICE_PRINCIPAL'

export interface PowerBIAuthConfig {
  tenantId: string
  clientId: string
  clientSecret?: string
  username?: string
  password?: string
  embeddedMode: PowerBIEmbeddedMode
}

export interface PowerBIReport {
  id: string
  name: string
  embedUrl: string
  workspaceId: string
}

interface PowerBIAccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface PowerBIListReportsResponse {
  value: {
    id: string
    name: string
    embedUrl: string
  }[]
}

interface PowerBIEmbedTokenResponse {
  token: string
  expiration: string
}

interface PowerBIListWorkspacesResponse {
  value: {
    id: string
    name: string
    isReadOnly: boolean
    isOnDedicatedCapacity: boolean
  }[]
}

export async function getPowerBIAccessToken(
  config: PowerBIAuthConfig
): Promise<string> {
  const tokenUrl = config.embeddedMode === 'MASTER_USER'
    ? `https://login.microsoftonline.com/${config.tenantId}/oauth2/token`
    : `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`

  let payload: URLSearchParams

  if (config.embeddedMode === 'MASTER_USER') {
    if (!config.username || !config.password) {
      throw new Error('Username e password são obrigatórios para MASTER_USER')
    }

    payload = new URLSearchParams({
      grant_type: 'password',
      client_id: config.clientId,
      resource: 'https://analysis.windows.net/powerbi/api',
      username: config.username,
      password: config.password,
    })
  } else {
    if (!config.clientSecret) {
      throw new Error('ClientSecret é obrigatório para SERVICE_PRINCIPAL')
    }

    payload = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: 'https://analysis.windows.net/powerbi/api/.default',
    })
  }

  const { data } = await axios.post<PowerBIAccessTokenResponse>(
    tokenUrl,
    payload,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  return data.access_token
}

export async function listReports(
  accessToken: string,
  workspaceId: string
): Promise<PowerBIReport[]> {
  const { data } = await axios.get<PowerBIListReportsResponse>(
    `${env.POWERBI_API_URL}groups/${workspaceId}/reports`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  return data.value.map((report) => ({
    id: report.id,
    name: report.name,
    embedUrl: report.embedUrl,
    workspaceId,
  }))
}

export async function generateEmbedToken(
  accessToken: string,
  workspaceId: string,
  reportId: string
) {
  const url = `${env.POWERBI_API_URL}groups/${workspaceId}/reports/${reportId}/GenerateToken`

  const body = {
    accessLevel: 'View',
  }

  const { data } = await axios.post<PowerBIEmbedTokenResponse>(
    url,
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  return {
    token: data.token,
    expiration: data.expiration,
  }
}

export async function listWorkspaces(accessToken: string) {
  const { data } = await axios.get<PowerBIListWorkspacesResponse>(
    `${env.POWERBI_API_URL}groups`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  return data.value
}
