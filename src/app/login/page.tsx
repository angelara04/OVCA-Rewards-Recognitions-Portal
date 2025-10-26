"use client"
import React from 'react'
import { login, signup, signWithGoogle } from './actions'

export default function LoginPage() {
  return (
    <div>
      <form>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input id="password" name="password" type="password" required />
        <button formAction={login}>Log in</button>
        <button formAction={signup}>Sign up</button>
      </form>

      <div>
        <button onClick={() => signWithGoogle()}>Sign in with Google</button>
      </div>
    </div>
  )
}
