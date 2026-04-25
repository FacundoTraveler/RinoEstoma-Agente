import { SignUpForm } from '@/components/auth/signup-form'

export const metadata = {
  title: 'Registrarse | RinoEstoma',
  description: 'Crea una cuenta en RinoEstoma',
}

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <SignUpForm />
    </div>
  )
}
