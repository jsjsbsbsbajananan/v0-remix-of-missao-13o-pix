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
    console.log("[v0] Using cached token")
    return tokenCache.access_token
  }

  console.log("[v0] Fetching new token from:", AUTH_URL)
  console.log("[v0] Using CLIENT_ID:", CLIENT_ID?.substring(0, 8) + "...")

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  })

  const text = await res.text()
  console.log("[v0] Auth response status:", res.status)
  console.log("[v0] Auth response body:", text)

  if (!res.ok) {
    throw new Error(`Auth error: ${res.status} ${text}`)
  }

  const data = JSON.parse(text)
  tokenCache.access_token = data.access_token

  if (data.expires_at) {
    tokenCache.expires_at = new Date(data.expires_at).getTime()
  } else if (data.expires_in) {
    tokenCache.expires_at = Date.now() + data.expires_in * 1000
  } else {
    tokenCache.expires_at = Date.now() + 55 * 60 * 1000 // 55 minutes default
  }

  console.log("[v0] Token fetched successfully")
  return tokenCache.access_token
}

async function createCashIn(payload: any) {
  const token = await fetchToken()

  console.log("[v0] Creating cash-in at:", CASHIN_URL)
  console.log("[v0] Payload:", JSON.stringify(payload, null, 2))

  const res = await fetch(CASHIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  console.log("[v0] Cash-in response status:", res.status)
  console.log("[v0] Cash-in response body:", text)

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

    const amountInReais = body.amount ?? 29.9
    const amountInCents = Math.round(amountInReais * 100)

    const description = body.description ?? "Missão 13º no Pix - Acesso Vitalício"
    const client = body.client || {
      name: "Cliente",
      cpf: "00000000000",
      email: "cliente@exemplo.com",
      phone: "51999999999",
    }

    if (!client.email || !client.phone) {
      return NextResponse.json({ ok: false, error: "E-mail e telefone são obrigatórios" }, { status: 400 })
    }

    const payload = {
      amount: amountInCents, // Send amount in cents
      description: description,
      webhook_url: process.env.WEBHOOK_URL || "",
      client: {
        ...client,
        phone: client.phone.replace(/\D/g, ""), // Remove non-numeric characters
      },
      split: body.split || [],
    }

    console.log("[v0] Creating payment with payload:", { ...payload, client: { ...payload.client, cpf: "***" } })

    const data = await createCashIn(payload)

    console.log("[v0] Payment created successfully:", { identifier: data.identifier })

    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    console.error("[v0] Payment creation error:", error)

    let errorMessage = error.message

    if (error.message.includes("500")) {
      errorMessage =
        "Erro no servidor de pagamentos. Verifique suas credenciais da API ou tente novamente em alguns minutos."
    } else if (error.message.includes("401") || error.message.includes("403")) {
      errorMessage = "Credenciais da API inválidas. Verifique CLIENT_ID e CLIENT_SECRET."
    } else if (error.message.includes("400")) {
      errorMessage = "Dados do pagamento inválidos. Verifique o formato dos dados enviados."
    }

    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 })
  }
}
