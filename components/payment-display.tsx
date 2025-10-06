"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Loader2, Sparkles, Gift, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

interface PaymentDisplayProps {
  pixCode: string
  qrBase64?: string
  identifier?: string
  amount: number
  onClose: () => void
  email?: string
  whatsapp?: string
}

export function PaymentDisplay({
  pixCode,
  qrBase64,
  identifier,
  amount,
  onClose,
  email,
  whatsapp,
}: PaymentDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "error">("pending")

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Poll for payment status
  useEffect(() => {
    if (!identifier) return

    const checkPayment = async () => {
      try {
        setChecking(true)
        const res = await fetch(`/api/transaction/${identifier}`)
        const data = await res.json()

        if (data.ok && data.data?.status === "paid") {
          setPaymentStatus("paid")
        }
      } catch (error) {
        console.error("Error checking payment:", error)
      } finally {
        setChecking(false)
      }
    }

    checkPayment()
    const interval = setInterval(checkPayment, 5000)

    return () => clearInterval(interval)
  }, [identifier])

  const qrCodeSrc = qrBase64
    ? `data:image/png;base64,${qrBase64}`
    : `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(pixCode)}&choe=UTF-8`

  if (paymentStatus === "paid") {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-4 shadow-2xl animate-bounce">
          <Check className="h-12 w-12 text-white" />
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
        </div>
        <h3 className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Pagamento Confirmado! 🎉
        </h3>
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 rounded-2xl border-2 border-orange-300 shadow-lg">
          <p className="text-lg font-bold text-gray-800 mb-3">Seu Natal feliz está garantido! 🎄</p>
          <p className="text-base text-gray-700 leading-relaxed">
            Enviamos o acesso completo para <strong className="text-orange-600">{email}</strong>
          </p>
          <p className="text-sm text-gray-600 mt-3">
            Você também receberá o link do grupo VIP no WhatsApp em instantes!
          </p>
        </div>
        <Button
          onClick={onClose}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-6 text-lg shadow-xl"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Começar Agora!
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-full font-bold text-sm mb-4 shadow-lg">
          <Zap className="h-4 w-4" />
          Falta só 1 minuto para seu acesso!
        </div>
        <h3 className="text-3xl font-black mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Pague com Pix Agora 📱
        </h3>
        <p className="text-gray-700 font-medium text-lg">Abra o app do seu banco e escaneie o QR Code</p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-white via-amber-50 to-orange-50 border-4 border-orange-300/50 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="relative bg-white p-6 rounded-2xl shadow-xl border-4 border-green-400/30">
            <Image
              src={qrCodeSrc || "/placeholder.svg"}
              alt="QR Code Pix"
              width={280}
              height={280}
              className="w-[280px] h-[280px]"
              unoptimized
            />
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
              Escaneie aqui!
            </div>
          </div>
        </div>

        <div className="text-center mb-6 bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl border-2 border-green-300">
          <div className="text-sm text-gray-700 font-bold mb-1">Valor a pagar</div>
          <div className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            R$ {amount.toFixed(2).replace(".", ",")}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
              <Gift className="h-4 w-4 text-orange-500" />
              Ou copie e cole o código Pix:
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-orange-200 shadow-md">
            <code className="text-xs break-all block text-gray-700 font-mono leading-relaxed">{pixCode}</code>
          </div>
          <Button
            onClick={copyToClipboard}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-lg shadow-xl border-2 border-orange-300"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Código Copiado! ✓
              </>
            ) : (
              <>
                <Copy className="mr-2 h-5 w-5" />
                Copiar Código Pix
              </>
            )}
          </Button>
        </div>
      </Card>

      {checking && (
        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-xl border-2 border-blue-300 shadow-md">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="font-bold text-blue-800">Aguardando seu pagamento...</span>
        </div>
      )}

      <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-5 rounded-xl border-2 border-orange-300 shadow-md">
        <p className="text-center text-sm font-bold text-gray-800 leading-relaxed">
          ⚡ Assim que o pagamento for confirmado, você receberá o acesso completo no e-mail{" "}
          <span className="text-orange-600">{email}</span>
        </p>
      </div>

      {identifier && (
        <div className="text-center text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">ID: {identifier}</div>
      )}
    </div>
  )
}
