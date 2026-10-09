import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signUpWithEmail, signInWithGoogle, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signUpWithEmail(email, password)
    navigate('/dashboard')
  }

  const handleGoogleSignup = async () => {
    await signInWithGoogle()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Activity className="size-6" aria-hidden="true" />
            </div>
            <span className="font-headline font-bold text-2xl text-white">Meddibuddy</span>
          </Link>
          <h1 className="text-2xl font-bold font-headline text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-hero-sub mt-2">
            Start scanning and understanding your medical reports
          </p>
        </div>

        <div className="liquid-glass border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-hero-sub mb-1.5" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <User className="size-4 text-hero-sub absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-hero-sub mb-1.5" htmlFor="signup-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="size-4 text-hero-sub absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-hero-sub mb-1.5" htmlFor="signup-password">
                Password
              </label>
              <div className="relative">
                <Lock className="size-4 text-hero-sub absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full mt-2" variant="heroPrimary">
              {isLoading ? 'Creating Account...' : 'Sign Up'}
              <ArrowRight className="size-4 ml-2" aria-hidden="true" />
            </Button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative bg-background/80 px-2 text-xs text-hero-sub">Or sign up with</span>
          </div>

          <Button
            type="button"
            variant="heroSecondary"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full"
          >
            Continue with Google
          </Button>

          <p className="text-center text-xs text-hero-sub mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-hero-sub">
          <ShieldCheck className="size-4 text-blue-400" aria-hidden="true" />
          <span>Strictly Educational • HIPAA Aligned Security Standards</span>
        </div>
      </div>
    </div>
  )
}
