import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Info, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const { signInWithEmail, signInWithGoogle, isLoading, error, clearError, isConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    try {
      await signInWithEmail(email, password)
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(err.message)
      }
    }
  }

  const handleGoogleLogin = async () => {
    setLocalError(null)
    clearError()
    try {
      await signInWithGoogle()
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(err.message)
      }
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 mb-6 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
          >
            <div className="size-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Activity className="size-6" aria-hidden="true" />
            </div>
            <span className="font-headline font-bold text-2xl text-white">Meddibuddy</span>
          </Link>
          <h1 className="text-2xl font-bold font-headline text-white tracking-tight">
            Sign In to Patient Portal
          </h1>
          <p className="text-sm text-hero-sub mt-1.5">
            Access and manage your simplified medical report breakdowns
          </p>
        </div>

        {/* Demo Mode Notice Banner if Firebase keys not configured */}
        {!isConfigured && (
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-indigo-200">
            <Info className="size-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-indigo-300">Live Preview Mode</span>
              Firebase environment variables are not set yet. You can sign in immediately using any email or Google to explore the app!
            </div>
          </div>
        )}

        <div className="liquid-glass border border-white/10 rounded-3xl p-7 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
          {/* Friendly Error Alert */}
          {displayError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
              <AlertCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Quick Google Sign In */}
          <Button
            type="button"
            variant="heroSecondary"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 h-auto text-sm font-semibold flex items-center justify-center gap-2.5"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-background/90 px-3 text-xs text-hero-sub font-medium">
              or with email & password
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-hero-sub mb-1.5" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="size-4 text-hero-sub absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-hero-sub" htmlFor="login-password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="size-4 text-hero-sub absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-hero-sub hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2"
              variant="heroPrimary"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="size-4 ml-2" aria-hidden="true" />
            </Button>
          </form>

          <p className="text-center text-xs text-hero-sub pt-2">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-indigo-400 hover:underline font-semibold">
              Create account
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-hero-sub">
          <ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />
          <span>Encrypted Session • Private Patient Access</span>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
