import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, HelpCircle } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 mb-6">
        <HelpCircle className="size-8" aria-hidden="true" />
      </div>
      <h1 className="text-4xl font-headline font-bold text-white mb-2">404 - Page Not Found</h1>
      <p className="text-hero-sub text-base max-w-md mb-8">
        The health record or page you requested could not be located.
      </p>
      <Link to="/">
        <Button variant="heroPrimary">
          <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
          Return to Meddibuddy Home
        </Button>
      </Link>
    </div>
  )
}
