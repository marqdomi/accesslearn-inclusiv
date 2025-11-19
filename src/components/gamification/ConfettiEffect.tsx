import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiEffectProps {
  trigger: boolean
  type?: 'default' | 'fireworks' | 'stars' | 'realistic'
}

export function ConfettiEffect({ trigger, type = 'default' }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger) return

    const runConfetti = () => {
      switch (type) {
        case 'fireworks':
          // Multi-burst fireworks effect
          const duration = 3 * 1000
          const animationEnd = Date.now() + duration
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

          const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min
          }

          const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
              return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)

            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            })
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            })
          }, 250)
          break

        case 'stars':
          // Stars burst
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            shapes: ['star'],
            colors: ['#FFD700', '#FFA500', '#FF6347']
          })
          break

        case 'realistic':
          // Realistic confetti cannon
          const count = 200
          const defaults2 = {
            origin: { y: 0.7 },
            zIndex: 1000
          }

          function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
              ...defaults2,
              ...opts,
              particleCount: Math.floor(count * particleRatio)
            })
          }

          fire(0.25, {
            spread: 26,
            startVelocity: 55
          })

          fire(0.2, {
            spread: 60
          })

          fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
          })

          fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
          })

          fire(0.1, {
            spread: 120,
            startVelocity: 45
          })
          break

        default:
          // Default burst
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
      }
    }

    runConfetti()
  }, [trigger, type])

  return null
}
