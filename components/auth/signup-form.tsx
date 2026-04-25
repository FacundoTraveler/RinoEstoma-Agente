'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import type { UserType } from '@/lib/types'

interface SignUpFormProps {
  redirectTo?: string
  defaultUserType?: UserType
}

export function SignUpForm({
  redirectTo = '/dashboard',
  defaultUserType = 'patient',
}: SignUpFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState<UserType>(defaultUserType)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const success = await signUp({
        email,
        password,
        full_name: fullName,
        phone_number: phoneNumber,
        user_type: userType,
      })

      if (success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(redirectTo)
        }, 2000)
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('[v0] Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md p-6 text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            ¡Registro exitoso!
          </h2>
          <p className="text-sm text-muted-foreground">
            Redirigiendo a tu dashboard en unos momentos...
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Registrarse</h1>
        <p className="text-sm text-muted-foreground">
          Crea una cuenta en RinoEstoma
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-foreground">
            Nombre Completo
          </label>
          <Input
            id="fullName"
            type="text"
            placeholder="Juan Pérez"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Teléfono (Opcional)
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+34 600 00 00 00"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="userType" className="text-sm font-medium text-foreground">
            Tipo de Cuenta
          </label>
          <select
            id="userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value as UserType)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            disabled={isLoading}
          >
            <option value="patient">Paciente</option>
            <option value="professional">Profesional</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Contraseña
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground"
          >
            Confirmar Contraseña
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </Button>
      </form>

      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/sign-in" className="text-primary hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </Card>
  )
}
