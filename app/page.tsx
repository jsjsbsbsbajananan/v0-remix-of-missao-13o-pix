"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  TrendingUp,
  Gift,
  DollarSign,
  Zap,
  Shield,
  Clock,
  Users,
  Star,
  Sparkles,
  Check,
  X,
  Copy,
  Loader2,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { PaymentDisplay } from "@/components/payment-display"

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-white">
      {count.toLocaleString("pt-BR")}
      {suffix}
    </div>
  )
}

function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(true)

  useEffect(() => {
    if (!isOpen) {
      setPaymentData(null)
      setError(null)
      setIsProcessing(false)
      setShowForm(true)
      setEmail("")
      setWhatsapp("")
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 29.9,
          description: "Missão 13º no Pix - Acesso Vitalício",
          client: {
            name: email.split("@")[0] || "Cliente",
            cpf: "00000000000",
            email: email,
            phone: whatsapp.replace(/\D/g, ""),
          },
        }),
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.error || "Erro ao criar pagamento")
      }

      const data = result.data
      const pixCode = data.pix_code ?? data.data?.pix_code ?? data.payload ?? null
      const qrBase64 = data.qr_base64 ?? data.data?.qr_base64 ?? null
      const identifier = data.identifier ?? data.data?.identifier ?? data.reference_id ?? null

      if (!pixCode) {
        throw new Error("Código Pix não foi gerado. Tente novamente.")
      }

      setPaymentData({
        pixCode,
        qrBase64,
        identifier,
      })
      setShowForm(false)
    } catch (err: any) {
      console.error("[v0] Payment error:", err)
      setError(err.message || "Erro ao processar pagamento. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border-4 border-orange-200/50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10 shadow-lg"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        <div className="p-6 md:p-10">
          {!showForm && paymentData ? (
            <PaymentDisplay
              pixCode={paymentData.pixCode}
              qrBase64={paymentData.qrBase64}
              identifier={paymentData.identifier}
              amount={29.9}
              onClose={onClose}
              email={email}
              whatsapp={whatsapp}
            />
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-bold text-white mb-4 shadow-lg animate-pulse">
                  <Gift className="h-5 w-5" />
                  Oferta Especial de Natal
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Seu Natal Feliz Começa Aqui! 🎄
                </h2>
                <p className="text-lg text-gray-700 font-medium">
                  Falta pouco para você ter dinheiro para celebrar com sua família
                </p>
              </div>

              <Card className="p-8 mb-6 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 border-4 border-orange-300/50 shadow-xl">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-5 py-2 shadow-md">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    <span className="font-bold text-gray-800">Acesso Vitalício ao Treinamento</span>
                  </div>

                  <div className="py-6">
                    <div className="text-lg text-gray-600 line-through mb-2">De R$ 97,00</div>
                    <div className="text-6xl md:text-7xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                      R$ 29,90
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Pagamento único • Acesso imediato</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold text-gray-800">Treinamento completo de 7 dias</span>
                    </div>
                    <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold text-gray-800">Grupo VIP no WhatsApp</span>
                    </div>
                    <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold text-gray-800">Planilha de controle</span>
                    </div>
                    <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold text-gray-800">Garantia de 7 dias</span>
                    </div>
                  </div>
                </div>
              </Card>

              {error && (
                <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-2xl text-red-700 text-sm font-semibold shadow-md">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="bg-white/80 p-6 rounded-2xl border-2 border-orange-200 shadow-md space-y-4">
                  <p className="text-center font-bold text-gray-800 mb-4">📧 Para onde enviamos seu acesso?</p>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold mb-2 text-gray-700">
                      Seu melhor e-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none transition-colors text-lg bg-white shadow-sm"
                      placeholder="seu@email.com"
                      required
                      disabled={isProcessing}
                    />
                  </div>

                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-bold mb-2 text-gray-700">
                      WhatsApp (para entrar no grupo VIP)
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none transition-colors text-lg bg-white shadow-sm"
                      placeholder="(00) 00000-0000"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl md:text-2xl font-black px-12 py-8 rounded-2xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.6)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-green-400/30"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                      Gerando seu pagamento...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-7 w-7" />
                      Gerar Pagamento Pix - R$ 29,90
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-6 text-sm font-semibold text-gray-700 pt-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>100% Seguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    <span>Acesso Imediato</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Garantia 7 dias</span>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MissaoPix() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(id)
    setTimeout(() => setCopiedText(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pix-green/10 via-background to-pix-green/5 px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg animate-pulse">
                  <Clock className="h-4 w-4" />
                  Últimas vagas disponíveis
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-pix-green/10 px-5 py-2.5 text-sm font-semibold text-pix-green border border-pix-green/20">
                  <Users className="h-4 w-4" />
                  +2.847 alunos ativos
                </div>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl font-bold leading-[1.1] text-balance md:text-6xl lg:text-7xl">
                  Tenha dinheiro para um{" "}
                  <span className="text-pix-green relative inline-block">
                    Natal inesquecível
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      height="12"
                      viewBox="0 0 200 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 10C50 2 150 2 198 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="text-pix-green"
                      />
                    </svg>
                  </span>{" "}
                  com sua família
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-pretty">
                  Aprenda a gerar renda extra em 7 dias e celebre as festas de fim de ano sem preocupações financeiras.
                  Seu celular pode ser a solução.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-pix-green/20 border-2 border-background flex items-center justify-center text-pix-green font-bold">
                      M
                    </div>
                    <div className="w-10 h-10 rounded-full bg-pix-green/20 border-2 border-background flex items-center justify-center text-pix-green font-bold">
                      J
                    </div>
                    <div className="w-10 h-10 rounded-full bg-pix-green/20 border-2 border-background flex items-center justify-center text-pix-green font-bold">
                      A
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">+2.847 pessoas</div>
                    <div className="text-muted-foreground">já estão ganhando</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-pix-green text-pix-green" />
                  ))}
                  <span className="ml-2 font-semibold">4.9/5</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="bg-pix-dark hover:bg-pix-dark/90 text-white text-base md:text-lg font-bold px-8 py-5 rounded-2xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,130,93,0.5)] hover:scale-[1.02] transition-all duration-300 w-full md:w-auto"
                >
                  <Sparkles className="mr-3 h-5 w-5" />
                  Quero Celebrar o Natal Sem Preocupações
                </Button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-pix-green" />
                    <span>Garantia de 7 dias</span>
                  </div>
                  <div className="hidden sm:block text-muted-foreground/40">•</div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-pix-green" />
                    <span>Acesso imediato</span>
                  </div>
                  <div className="hidden sm:block text-muted-foreground/40">•</div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-pix-green" />
                    <span className="font-semibold text-foreground">Apenas R$ 29,90</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-pix-dark hover:bg-pix-green/10 w-fit"
                  onClick={() =>
                    copyToClipboard(
                      "Transforme seu celular numa máquina de Pix em 7 dias e garanta seu 13º mesmo sem CLT!",
                      "hero",
                    )
                  }
                >
                  {copiedText === "hero" ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Texto copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar texto da chamada
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pix-green to-pix-dark rounded-[3rem] blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative rounded-[3rem] bg-gradient-to-br from-pix-green via-pix-dark to-pix-green p-1 shadow-2xl">
                  <div className="bg-background rounded-[2.8rem] p-3">
                    <img
                      src="/smartphone-receiving-pix-payments-green-interface.jpg"
                      alt="Celular recebendo Pix"
                      className="w-full rounded-[2.5rem]"
                    />
                  </div>
                </div>
                <div className="absolute -top-8 -right-8 bg-white rounded-3xl p-6 shadow-2xl border-4 border-pix-green/20 animate-bounce">
                  <div className="text-xs text-muted-foreground font-semibold mb-1">Você recebeu</div>
                  <div className="text-4xl font-bold text-pix-green mb-1">R$ 150</div>
                  <div className="text-xs text-pix-green font-semibold flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    via Pix agora
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-gradient-to-r from-pix-green via-pix-dark to-pix-green">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <AnimatedCounter end={2847} suffix="+" />
              <div className="text-sm text-white/80 font-medium">Alunos ativos</div>
            </div>
            <div className="space-y-2">
              <AnimatedCounter end={47} suffix="k" />
              <div className="text-sm text-white/80 font-medium">Gerados em Pix (R$)</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-white">4.9★</div>
              <div className="text-sm text-white/80 font-medium">Avaliação média</div>
            </div>
            <div className="space-y-2">
              <AnimatedCounter end={7} suffix=" dias" />
              <div className="text-sm text-white/80 font-medium">Para resultados</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Por que criei a Missão 13º no Pix?</h2>
          </div>

          <Card className="p-10 md:p-14 rounded-3xl shadow-xl border-2 border-pix-green/20 bg-gradient-to-br from-white via-pix-light/5 to-white">
            <div className="space-y-6 text-center">
              <p className="text-xl md:text-2xl text-foreground leading-relaxed text-pretty">
                Sabe aquela sensação de chegar no Natal sem dinheiro para comprar os presentes que sua família merece?
                De ver o Ano Novo chegando e não poder fazer aquela ceia especial?
              </p>
              <p className="text-xl md:text-2xl text-foreground leading-relaxed text-pretty">
                <strong className="text-pix-green">Eu já passei por isso</strong>. E foi quando descobri que meu celular
                poderia ser a solução. Por isso criei essa missão: para que você possa{" "}
                <strong className="text-pix-green">celebrar as festas com sua família sem preocupações</strong>, tendo
                dinheiro para fazer aquela festa que todos merecem.
              </p>
              <p className="text-xl md:text-2xl text-foreground leading-relaxed text-pretty">
                Em apenas 7 dias, você vai aprender a transformar seu celular em uma fonte de renda real.{" "}
                <strong className="text-pix-green">
                  Imagine poder comprar os presentes, fazer a ceia e ainda começar 2026 com dinheiro no bolso.
                </strong>
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="px-4 py-24 bg-gradient-to-br from-pix-light/10 via-background to-pix-green/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-pix-green/10 px-6 py-3 text-sm font-semibold text-pix-green mb-6">
              <Zap className="h-4 w-4" />
              Cronograma completo
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">O que você vai fazer dentro da Missão</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              7 dias de ação prática para transformar seu celular em fonte de renda
            </p>
          </div>

          <Card className="p-10 md:p-12 rounded-3xl shadow-xl border-2 border-pix-green/30 bg-gradient-to-br from-pix-green/5 via-white to-pix-light/10 mb-12">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pix-green to-pix-dark shadow-lg mb-4">
                <Gift className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-balance leading-tight">
                Celebre o Natal e o Ano Novo com sua família sem preocupações
              </h3>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
                Por apenas <strong className="text-pix-green font-bold">R$ 29,90</strong>, você terá acesso a um método
                completo que pode te dar o dinheiro necessário para{" "}
                <strong className="text-foreground">comprar os presentes</strong>,{" "}
                <strong className="text-foreground">fazer a ceia</strong> e{" "}
                <strong className="text-foreground">proporcionar momentos inesquecíveis</strong> para quem você ama.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-pix-green/20 p-2">
                    <Check className="h-5 w-5 text-pix-green" />
                  </div>
                  <span className="font-semibold text-lg">Natal completo</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-pix-green/20 p-2">
                    <Check className="h-5 w-5 text-pix-green" />
                  </div>
                  <span className="font-semibold text-lg">Ano Novo feliz</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-pix-green/20 p-2">
                    <Check className="h-5 w-5 text-pix-green" />
                  </div>
                  <span className="font-semibold text-lg">Família unida</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card className="group p-8 md:p-10 rounded-3xl border-2 border-pix-green/20 hover:border-pix-green/40 hover:shadow-2xl transition-all duration-300 bg-white">
              <div className="flex items-start gap-5">
                <div className="rounded-2xl bg-gradient-to-br from-pix-green to-pix-dark p-4 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-3">
                  <div className="inline-block text-xs font-bold text-white bg-pix-green px-3 py-1 rounded-full">
                    DIA 1
                  </div>
                  <h3 className="font-bold text-xl md:text-2xl">Início da Missão</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Ativando o modo renda rápida e configurando suas ferramentas para começar a ganhar.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="group p-8 md:p-10 rounded-3xl border-2 border-pix-green/20 hover:border-pix-green/40 hover:shadow-2xl transition-all duration-300 bg-white">
              <div className="flex items-start gap-5">
                <div className="rounded-2xl bg-gradient-to-br from-pix-green to-pix-dark p-4 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-3">
                  <div className="inline-block text-xs font-bold text-white bg-pix-green px-3 py-1 rounded-full">
                    DIAS 2-4
                  </div>
                  <h3 className="font-bold text-xl md:text-2xl">Missão Pix #1</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Como gerar R$20–50 por dia com tarefas simples e inteligência artificial.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="group p-10 md:p-10 rounded-3xl border-2 border-pix-green/20 hover:border-pix-green/40 hover:shadow-2xl transition-all duration-300 bg-white">
              <div className="flex items-start gap-5">
                <div className="rounded-2xl bg-gradient-to-br from-pix-green to-pix-dark p-4 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-3">
                  <div className="inline-block text-xs font-bold text-white bg-pix-green px-3 py-1 rounded-full">
                    DIAS 5-6
                  </div>
                  <h3 className="font-bold text-xl md:text-2xl">Missão Pix #2</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Criando postagens e conteúdos automáticos que geram resultados reais.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="group p-10 md:p-10 rounded-3xl bg-gradient-to-br from-pix-green/10 via-pix-light/20 to-pix-green/5 border-2 border-pix-green/40 hover:border-pix-green/60 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="rounded-2xl bg-gradient-to-br from-pix-green to-pix-dark p-4 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-3">
                  <div className="inline-block text-xs font-bold text-white bg-pix-dark px-3 py-1 rounded-full">
                    DIA 7 - FINAL
                  </div>
                  <h3 className="font-bold text-xl md:text-2xl">Missão Final</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Sacando seus ganhos, multiplicando resultados e ativando o modo "Virada 2026".
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-10 md:p-14 rounded-3xl bg-gradient-to-br from-pix-green/5 via-pix-light/10 to-pix-green/5 border-2 border-pix-green/30 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="rounded-2xl bg-gradient-to-br from-pix-green to-pix-dark p-4 shadow-lg">
                <Gift className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold">Bônus Exclusivos Inclusos</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-pix-green/20 p-2 flex-shrink-0">
                  <Check className="h-6 w-6 text-pix-green" />
                </div>
                <div>
                  <div className="font-bold text-lg mb-2">Planilha de Controle</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    "Controle do 13º no Pix" para organizar seus ganhos
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-pix-green/20 p-2 flex-shrink-0">
                  <Check className="h-6 w-6 text-pix-green" />
                </div>
                <div>
                  <div className="font-bold text-lg mb-2">Grupo VIP WhatsApp</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">Suporte direto e comunidade ativa</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-pix-green/20 p-2 flex-shrink-0">
                  <Check className="h-6 w-6 text-pix-green" />
                </div>
                <div>
                  <div className="font-bold text-lg mb-2">Pack Completo IA</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    Prompts prontos + legendas automáticas
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                className="border-pix-green/30 text-pix-dark hover:bg-pix-green/10 bg-transparent"
                onClick={() =>
                  copyToClipboard(
                    'Dia 1 — Início da Missão: Ativando o modo renda rápida. Dia 2 a 4 — Missão Pix #1: Como gerar R$20–50 com tarefas simples e IA. Dia 5 a 6 — Missão Pix #2: Criando postagens e conteúdos automáticos que dão resultado. Dia 7 — Missão Final: Sacando, multiplicando e ativando o modo "Virada 2026".',
                    "cronograma",
                  )
                }
              >
                {copiedText === "cronograma" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Cronograma copiado!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar cronograma completo
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-pix-green/10 px-6 py-3 text-sm font-semibold text-pix-green mb-6">
              <Star className="h-4 w-4 fill-pix-green" />
              Depoimentos reais
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Veja quem já está celebrando com dinheiro no bolso
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Pessoas reais que transformaram o celular em fonte de renda para as festas
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-10">
            <Card className="group p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-pix-green/20 hover:border-pix-green/40 bg-white">
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-pix-green/5 to-pix-light/10 p-6 border-2 border-pix-green/10">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smartphones_recibo_pix_realista_2-YWIZ1psIR9YeumaKMbwEvAOGPD2a6L.jpg"
                  alt="Comprovante Pix R$ 75"
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-pix-green text-pix-green" />
                ))}
              </div>
              <p className="font-semibold text-lg mb-4 leading-relaxed">
                "Consegui comprar os presentes de Natal da minha família! Fiz R$75 no terceiro dia, não acreditei quando
                vi o Pix cair."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-pix-green/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pix-green to-pix-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  M
                </div>
                <div>
                  <p className="font-bold">Maria S.</p>
                  <p className="text-sm text-muted-foreground">Aluna desde nov/2024</p>
                </div>
              </div>
            </Card>

            <Card className="group p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-pix-green/20 hover:border-pix-green/40 bg-white">
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-pix-green/5 to-pix-light/10 p-6 border-2 border-pix-green/10">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smartphone_pix_transacao_realista_1-E57Q1p0kjrkjn95JnNO8aqmZm7K505.jpg"
                  alt="Comprovante Pix R$ 150"
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-pix-green text-pix-green" />
                ))}
              </div>
              <p className="font-semibold text-lg mb-4 leading-relaxed">
                "Vou poder fazer a ceia de Ano Novo sem apertar o orçamento. R$150 em poucos dias, incrível!"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-pix-green/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pix-green to-pix-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  J
                </div>
                <div>
                  <p className="font-bold">João P.</p>
                  <p className="text-sm text-muted-foreground">Aluno desde dez/2024</p>
                </div>
              </div>
            </Card>

            <Card className="group p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-pix-green/20 hover:border-pix-green/40 bg-white">
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-pix-green/5 to-pix-light/10 p-6 border-2 border-pix-green/10">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smartphone_lista_pix_realista_3-esFL07nM14VkumNHVn55pLMNPriJLI.jpg"
                  alt="Lista de transações Pix"
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-pix-green text-pix-green" />
                ))}
              </div>
              <p className="font-semibold text-lg mb-4 leading-relaxed">
                "Minha família vai ter um Natal feliz esse ano! Vários Pix caindo todo dia. Gratidão por compartilhar
                esse método."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-pix-green/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pix-green to-pix-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  A
                </div>
                <div>
                  <p className="font-bold">Ana L.</p>
                  <p className="text-sm text-muted-foreground">Aluna desde nov/2024</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">*Resultados podem variar de pessoa para pessoa</p>
            <Button
              variant="outline"
              size="sm"
              className="border-pix-green/30 text-pix-dark hover:bg-pix-green/10 bg-transparent"
              onClick={() => copyToClipboard("Fiz R$100 no terceiro dia, valeu cada centavo!", "depoimento")}
            >
              {copiedText === "depoimento" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Depoimento copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar depoimento
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 bg-gradient-to-br from-pix-light/10 via-background to-pix-green/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">O que você conquista com a Missão</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Muito mais que dinheiro: a tranquilidade de celebrar com quem você ama
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="group p-10 rounded-3xl border-2 border-pix-green/20 hover:border-pix-green/40 hover:shadow-xl transition-all duration-300 bg-white">
              <div className="flex items-start gap-5">
                <div className="rounded-2xl bg-gradient-to-br from-pix-green/10 to-pix-light/20 p-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Gift className="h-8 w-8 text-pix-green" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl md:text-2xl">Natal completo para sua família</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Tenha dinheiro para comprar presentes, fazer a ceia e celebrar sem preocupações financeiras
                  </p>
                </div>
              </div>
            </Card>

            <Card className="group p-10 rounded-3xl border-2 border-pix-green/20 hover:border-pix-green/40 hover:shadow-xl transition-all duration-300 bg-white">
              <div className="flex items-start gap-5">
                <div className="rounded-2xl bg-gradient-to-br from-pix-green/10 to-pix-light/20 p-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-pix-green" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl md:text-2xl">Ano Novo sem dívidas</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Comece 2026 com dinheiro no bolso e sem aquele aperto de janeiro
                  </p>
                </div>
              </div>
            </Card>

            <Card className="group p-10 rounded-3xl border-2 border-pix-green/20 hover:border-pix-green/40 hover:shadow-xl transition-all duration-300 bg-white">
              <div className="flex items-start gap-5">
                <div className="rounded-2xl bg-gradient-to-br from-pix-green/10 to-pix-light/20 p-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-8 w-8 text-pix-green" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl md:text-2xl">Renda extra recorrente</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Método que você pode repetir sempre que precisar de dinheiro extra
                  </p>
                </div>
              </div>
            </Card>

            <Card className="group p-10 rounded-3xl border-2 border-pix-green/20 hover:border-pix-green/40 hover:shadow-xl transition-all duration-300 bg-white">
              <div className="flex items-start gap-5">
                <div className="rounded-2xl bg-gradient-to-br from-pix-green/10 to-pix-light/20 p-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-pix-green" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl md:text-2xl">Comunidade de apoio</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Grupo VIP no WhatsApp com pessoas que estão no mesmo caminho que você
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              className="border-pix-green/30 text-pix-dark hover:bg-pix-green/10 bg-transparent"
              onClick={() =>
                copyToClipboard(
                  "✅ Seu primeiro Pix da internet\n✅ Roteiro pronto pra continuar ganhando\n✅ Acesso ao grupo exclusivo pra suporte\n✅ Um novo jeito de fazer grana sem depender de CLT",
                  "beneficios",
                )
              }
            >
              {copiedText === "beneficios" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Benefícios copiados!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar lista de benefícios
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-28 bg-gradient-to-br from-pix-green via-pix-dark to-pix-green text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-5xl text-center space-y-12 relative z-10">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-[1.1]">
              Sua família merece um Natal feliz
            </h2>

            <p className="text-2xl md:text-3xl text-white/95 text-pretty max-w-3xl mx-auto leading-relaxed font-medium">
              Não deixe as festas passarem sem poder celebrar como você sempre quis.{" "}
              <strong className="text-white">Comece hoje mesmo!</strong>
            </p>
          </div>

          <div className="flex flex-col gap-8 items-center pt-8">
            <Button
              size="lg"
              onClick={() => setIsCheckoutOpen(true)}
              className="bg-white hover:bg-white/95 text-pix-dark text-lg md:text-xl font-bold px-10 py-6 md:py-7 rounded-2xl shadow-2xl hover:shadow-[0_30px_80px_-15px_rgba(255,255,255,0.4)] hover:scale-[1.02] transition-all duration-300"
            >
              <Sparkles className="mr-4 h-6 w-6" />
              Quero Celebrar com Minha Família
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-8 text-base text-white/90">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <Zap className="h-6 w-6" />
                </div>
                <span className="font-semibold">Acesso imediato</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="font-semibold">Garantia de 7 dias</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <Gift className="h-6 w-6" />
                </div>
                <span className="font-semibold">Apenas R$ 29,90</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-10 bg-background border-t-2 border-pix-green/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-center gap-6 text-sm text-muted-foreground md:flex-row md:justify-between">
            <div className="flex gap-8">
              <a href="#" className="hover:text-pix-green transition-colors font-medium">
                Termos de uso
              </a>
              <a href="#" className="hover:text-pix-green transition-colors font-medium">
                Política de privacidade
              </a>
            </div>
            <div className="font-medium">© 2025 Missão 13º no Pix. Todos os direitos reservados.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
