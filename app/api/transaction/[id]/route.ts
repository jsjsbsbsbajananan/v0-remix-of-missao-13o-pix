import { type NextRequest, NextResponse } from "next/server"

const API_BASE = (process.env.API_BASE_URL || "https://api.syncpayments.com.br").replace(/\/$/, "")
const AUTH_URL = `${API_BASE}/api/partner/v1/auth-token`
const TRANSACTION_URL = `${API_BASE}/api/partner/v1/transaction/`
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

// Token cache (shared with create-payment)
const tokenCache: { access_token: string | null; expires_at: number } = {
  access_token: null,
  expires_at: 0,
}

async function fetchToken(): Promise<string> {
  if (tokenCache.access_token && Date.now() < tokenCache.expires_at - 5000) {
    return tokenCache.access_token
  }

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Auth error: ${res.status} ${text}`)
  }

  const data = await res.json()
  tokenCache.access_token = data.access_token

  if (data.expires_at) {
    tokenCache.expires_at = new Date(data.expires_at).getTime()
  } else if (data.expires_in) {
    tokenCache.expires_at = Date.now() + data.expires_in * 1000
  } else {
    tokenCache.expires_at = Date.now() + 55 * 60 * 1000
  }

  return tokenCache.access_token
}

async function getTransaction(identifierOrId: string) {
  const token = await fetchToken()
  const url = `${TRANSACTION_URL}${identifierOrId}`

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })

  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await getTransaction(id)
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    console.error("[v0] Transaction fetch error:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
