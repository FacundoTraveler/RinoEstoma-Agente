import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Zap, BarChart3, Calendar } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 md:py-32">
        <div className="w-full max-w-4xl space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance">
              Asistente Inteligente para{' '}
              <span className="text-primary">RinoEstomatología</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Conecta con nuestro agente AI vía WhatsApp. Agenda citas, obtén información sobre protocolos, 
              y analiza monitoreos en tiempo real.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
              <MessageCircle className="mr-2 h-5 w-5" />
              Hablar vía WhatsApp
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              Ver características
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 md:py-32 bg-muted/30">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Características Principales
            </h2>
            <p className="text-muted-foreground">
              Todo lo que necesitas en un solo asistente
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Chat Inteligente</h3>
                  <p className="text-muted-foreground mt-2">
                    Respuestas inmediatas a tus preguntas sobre RinoEstoma y protocolos clínicos.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Agendar Citas</h3>
                  <p className="text-muted-foreground mt-2">
                    Programa consultas con profesionales de forma rápida y sencilla.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Análisis de Monitoreos</h3>
                  <p className="text-muted-foreground mt-2">
                    Interpreta datos de RinoMONITOR en tiempo real con inteligencia artificial.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Respuestas Rápidas</h3>
                  <p className="text-muted-foreground mt-2">
                    Acceso instantáneo a la base de conocimiento de RinoEstoma.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            ¿Listo para empezar?
          </h2>
          <p className="text-lg text-muted-foreground">
            Conecta ahora con nuestro asistente vía WhatsApp
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-10">
            <MessageCircle className="mr-2 h-5 w-5" />
            Abrir WhatsApp
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 px-4 py-8">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 RinoEstoma Agent. Basado en Vercel AI SDK + ChatSDK + Track 3.</p>
        </div>
      </footer>
    </div>
  )
}
