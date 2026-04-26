import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Only allow if no admin exists yet
    const { data: existingAdmins } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('user_type', 'admin')
      .limit(1)

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json({ error: 'An admin already exists. Use the app to manage users.' }, { status: 403 })
    }

    // Create auth user with email already confirmed
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || email, user_type: 'admin' }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Insert into users table
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        full_name: full_name || email,
        user_type: 'admin',
      }])

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: authData.user.id, message: 'Admin created successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
