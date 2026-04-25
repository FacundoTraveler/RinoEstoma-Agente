'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase-client'
import { Appointment } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (authLoading) return

    const fetchAppointments = async () => {
      try {
        let query = supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: true })

        if (filter === 'pending') {
          query = query.eq('status', 'pending')
        } else if (filter === 'confirmed') {
          query = query.eq('status', 'confirmed')
        } else if (filter === 'completed') {
          query = query.eq('status', 'completed')
        }

        const { data, error } = await query

        if (error) throw error
        setAppointments(data || [])
      } catch (error) {
        console.error('[v0] Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [authLoading, filter])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando citas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Citas</h1>
        <Button className="bg-primary hover:bg-primary/90">Nueva Cita</Button>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'confirmed', 'completed'].map((status) => (
          <Button
            key={status}
            onClick={() => setFilter(status)}
            variant={filter === status ? 'default' : 'outline'}
            className={filter === status ? 'bg-primary' : ''}
          >
            {status === 'all' && 'Todas'}
            {status === 'pending' && 'Pendientes'}
            {status === 'confirmed' && 'Confirmadas'}
            {status === 'completed' && 'Completadas'}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay citas para mostrar
            </CardContent>
          </Card>
        ) : (
          appointments.map((apt) => (
            <Card key={apt.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{apt.patient_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(apt.appointment_date), 'PPP p', { locale: es })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {apt.status === 'pending' && 'Pendiente'}
                    {apt.status === 'confirmed' && 'Confirmada'}
                    {apt.status === 'completed' && 'Completada'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{apt.patient_phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{apt.patient_email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Notas</p>
                    <p className="font-medium">{apt.notes || 'Sin notas'}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">Editar</Button>
                  <Button size="sm" variant="outline" className="text-red-600">Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
