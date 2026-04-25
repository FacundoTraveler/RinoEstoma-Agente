import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Iniciar Sesión | RinoEstoma',
  description: 'Inicia sesión en tu cuenta de RinoEstoma',
}

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <LoginForm />
    </div>
  )
}
