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

  // Custom validation before Supabase call to provide better error messages
  if (!rawEmail || !rawPassword) {
    // If either field is missing, return specific error
    redirect(`/login?error=${encodeURIComponent("Missing email or password")}`)
  }

  const data = {
    email: rawEmail,
    password: rawPassword,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // Log the specific error from Supabase
    console.error("SUPABASE ERROR:", error.message);
    
    // Check if the error is the specific "missing email or phone" one and override it
    let errorMessage = error.message;
    if (errorMessage.toLowerCase().includes("missing email or phone")) {
        errorMessage = "Missing email or password";
    }

    // Redirect back to login with the error message
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
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

  export async function signout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}