import { type NextRequest, NextResponse } from "next/server"

const API_BASE = (process.env.API_BASE_URL || "https://api.syncpayments.com.br").replace(/\/$/, "")
const AUTH_URL = `${API_BASE}/api/partner/v1/auth-token`
const CASHIN_URL = `${API_BASE}/api/partner/v1/cash-in`
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

// Token cache
const tokenCache: { access_token: string | null; expires_at: number } = {
  access_token: null,
  expires_at: 0,
}

async function fetchToken(): Promise<string> {
  // Return cached token if still valid
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
    tokenCache.expires_at = Date.now() + 55 * 60 * 1000 // 55 minutes default
  }

  return tokenCache.access_token
}

async function createCashIn(payload: any) {
  const token = await fetchToken()
  const res = await fetch(CASHIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = { raw: text }
  }

  if (!res.ok) {
    throw new Error(`Cash-in error: ${res.status} ${text}`)
  }

  return data
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const amount = body.amount ?? 29.9
    const description = body.description ?? "Missão 13º no Pix - Acesso Vitalício"
    const client = body.client || {
      name: "Cliente",
      cpf: "00000000000",
      email: "cliente@exemplo.com",
      phone: "51999999999",
    }

    // Webhook URL é opcional - se não configurado, o sistema usa polling para verificar o pagamento
    const payload = {
      amount: amount,
      description: description,
      webhook_url: process.env.WEBHOOK_URL || "",
      client: client,
      split: body.split || [],
    }

    const data = await createCashIn(payload)

    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    console.error("[v0] Payment creation error:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
