import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { WordPullUp } from '@/components/ui/word-pull-up'
import { ShieldAlert, Sparkles } from 'lucide-react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4'

const TECH_PARTNERS = [
  { name: 'Gemini', letter: 'G' },
  { name: 'Firebase', letter: 'F' },
  { name: 'Document AI', letter: 'D' },
  { name: 'Vertex AI', letter: 'V' },
  { name: 'Translation', letter: 'T' },
  { name: 'Firestore', letter: 'F' },
]

export const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoOpacity, setVideoOpacity] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Listen for prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mq.addEventListener('change', handleMotionChange)
    return () => mq.removeEventListener('change', handleMotionChange)
  }, [])

  // Custom requestAnimationFrame fade handling
  useEffect(() => {
    if (prefersReducedMotion) return

    const video = videoRef.current
    if (!video) return

    let rafId: number
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const checkFade = () => {
      if (!video || !isMounted) return

      const { currentTime, duration } = video

      if (duration && !isNaN(duration) && duration > 0) {
        const FADE_DURATION = 0.5 // 0.5 seconds

        // 0.5s fade-in at start
        if (currentTime < FADE_DURATION) {
          const op = Math.max(0, Math.min(1, currentTime / FADE_DURATION))
          setVideoOpacity(op)
        }
        // 0.5s fade-out before the end
        else if (currentTime > duration - FADE_DURATION) {
          const op = Math.max(0, Math.min(1, (duration - currentTime) / FADE_DURATION))
          setVideoOpacity(op)
        } else {
          setVideoOpacity(1)
        }
      }

      rafId = requestAnimationFrame(checkFade)
    }

    const handleEnded = () => {
      setVideoOpacity(0)
      timeoutId = setTimeout(() => {
        if (!isMounted || !video) return
        video.currentTime = 0
        video.play().catch(() => {})
      }, 100)
    }

    video.addEventListener('ended', handleEnded)
    rafId = requestAnimationFrame(checkFade)

    // Trigger video playback
    video.play().catch(() => {})

    return () => {
      isMounted = false
      cancelAnimationFrame(rafId)
      if (timeoutId) clearTimeout(timeoutId)
      video.removeEventListener('ended', handleEnded)
    }
  }, [prefersReducedMotion])

  return (
    <div className="relative flex-1 flex flex-col justify-between overflow-visible">
      {/* BACKGROUND VIDEO or REDUCED-MOTION STATIC POSTER */}
      {prefersReducedMotion ? (
        <div
          className="absolute inset-0 w-full h-full object-cover bg-radial from-slate-900 to-black pointer-events-none"
          role="img"
          aria-label="Abstract medical data background poster"
        />
      ) : (
        <video
          ref={videoRef}
          src={VIDEO_URL}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-75"
          style={{ opacity: videoOpacity }}
        />
      )}

      {/* BLUR SHAPE behind content */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] pointer-events-none"
        aria-hidden="true"
      />

      {/* HERO CONTENT (centered) in flex-1 flex items-center justify-center */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 py-8">
        <div className="text-center flex flex-col items-center max-w-4xl mx-auto">
          {/* Gentle Badge above the headline (21st.dev AnimatedGradientText) */}
          <AnimatedGradientText className="mb-6">
            <Sparkles className="size-3.5 text-indigo-400" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wide">
              Educational AI for medical reports
            </span>
          </AnimatedGradientText>

          {/* Headline */}
          <h1
            className="font-headline font-normal leading-[1.02] tracking-[-0.024em] select-none"
            style={{ fontSize: 'clamp(72px, 15vw, 220px)' }}
          >
            <span className="text-foreground">Meddi</span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to left, #6366f1, #a855f7, #fcd34d)',
              }}
            >
              buddy
            </span>
          </h1>

          {/* Subtitle with Animated Word Reveal & Serif Accent (21st.dev WordPullUp) */}
          <div className="mt-[9px] max-w-md mx-auto">
            <WordPullUp
              words="Scan. Understand. Act. / Medical reports, explained simply — in your language."
              accentWord="simply"
              accentClassName="font-serif italic font-normal text-indigo-300 text-xl tracking-wide px-0.5"
              className="text-hero-sub text-lg leading-8 opacity-80"
              delayMultiple={0.035}
            />
          </div>

          {/* CTAs with Subtle Shimmer Button (21st.dev ShimmerButton) */}
          <div className="mt-[25px] flex flex-col sm:flex-row items-center gap-4">
            <Link to="/signup">
              <ShimmerButton
                className="px-[29px] py-[24px] rounded-full text-base font-medium shadow-2xl text-foreground"
              >
                Analyze My Report
              </ShimmerButton>
            </Link>

            <Link to="/dashboard">
              <Button
                variant="ghost"
                className="text-foreground/90 hover:text-white text-base font-medium px-6 py-3 transition-colors duration-200"
              >
                Try Demo Report
              </Button>
            </Link>
          </div>

          {/* SafetyNotice line under CTAs */}
          <div className="mt-4 flex items-center gap-1.5 text-xs text-hero-sub/70 font-medium tracking-wide">
            <ShieldAlert className="size-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
            <span>Educational information only — not a diagnosis.</span>
          </div>
        </div>
      </div>

      {/* MARQUEE (bottom, pb-10, max-w-5xl mx-auto, flex items-center gap-12) */}
      <div className="w-full max-w-5xl mx-auto pb-10 px-6 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
        {/* Left: Static text */}
        <div className="shrink-0 text-foreground/50 text-sm font-medium text-center md:text-left leading-snug">
          Powered by trusted <br className="hidden md:inline" />
          Google Cloud technology
        </div>

        {/* Right: Infinite marquee, logos duplicated for seamless loop, gap-16 */}
        <div className="flex-1 w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] group">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-16 py-1 items-center">
            {/* Primary List */}
            {TECH_PARTNERS.map((partner, idx) => (
              <div key={`logo-1-${idx}`} className="flex items-center gap-2.5 shrink-0 select-none">
                <div className="liquid-glass w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-foreground">
                  {partner.letter}
                </div>
                <span className="text-base font-semibold text-foreground whitespace-nowrap">
                  {partner.name}
                </span>
              </div>
            ))}

            {/* Seamless Duplicate List */}
            {TECH_PARTNERS.map((partner, idx) => (
              <div key={`logo-2-${idx}`} className="flex items-center gap-2.5 shrink-0 select-none">
                <div className="liquid-glass w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-foreground">
                  {partner.letter}
                </div>
                <span className="text-base font-semibold text-foreground whitespace-nowrap">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
