import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { cn } from '@/utils/cn'

interface WordPullUpProps {
  words: string
  delayMultiple?: number
  wrapperFramerProps?: Variants
  framerProps?: Variants
  className?: string
  accentWord?: string
  accentClassName?: string
}

export function WordPullUp({
  words,
  delayMultiple = 0.04,
  wrapperFramerProps = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delayMultiple,
      },
    },
  },
  framerProps = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  },
  className,
  accentWord,
  accentClassName,
}: WordPullUpProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const wordsArray = words.split(' ')

  if (prefersReducedMotion) {
    return (
      <p className={cn('text-center', className)}>
        {wordsArray.map((word, i) => {
          const isAccent = accentWord && word.toLowerCase().includes(accentWord.toLowerCase())
          return (
            <span
              key={i}
              className={cn(isAccent && accentClassName)}
            >
              {word}{' '}
            </span>
          )
        })}
      </p>
    )
  }

  return (
    <motion.div
      variants={wrapperFramerProps}
      initial="hidden"
      animate="show"
      className={cn('flex flex-wrap justify-center text-center', className)}
    >
      {wordsArray.map((word, i) => {
        const isAccent = accentWord && word.toLowerCase().includes(accentWord.toLowerCase())
        return (
          <motion.span
            key={i}
            variants={framerProps}
            className={cn('inline-block mr-[0.25em]', isAccent && accentClassName)}
          >
            {word}
          </motion.span>
        )
      })}
    </motion.div>
  )
}

export default WordPullUp
