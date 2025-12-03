'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from "next/headers";
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // 1. Get the raw values
  const rawEmail = formData.get('username') as string
  const rawPassword = formData.get('password') as string

  // --- DEBUG LOGS (Check your VS Code Terminal when you click login) ---
  console.log("------------------------------------------------")
  console.log("LOGIN ATTEMPT:")
  console.log("Email received:", rawEmail)
  console.log("Password received:", rawPassword ? "*****" : "NULL/EMPTY")
  console.log("------------------------------------------------")

  const data = {
    email: rawEmail,
    password: rawPassword,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // Log the specific error from Supabase
    console.error("SUPABASE ERROR:", error.message);
    // Redirect back to login with the error message
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export const signWithGoogle = async () => {

    const supabase = await createClient();
    const originUrl = (await headers()).get('origin');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${originUrl}/auth/callback`,
      },
    })

    if (data.url) {
      revalidatePath('/', 'layout');
      redirect(data.url) // use the redirect API for your server framework
    }

    if (error) {
      console.error('Error signing in with Google:', error.message)
      redirect(`/error?error=${error.message}`)
    }
  }