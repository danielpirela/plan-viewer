import { useEffect, useRef } from "react"
import gsap from "gsap"

export function PlanLoading() {
  const containerRef = useRef<HTMLDivElement>(null)
  const ring1Ref = useRef<HTMLDivElement>(null)
  const ring2Ref = useRef<HTMLDivElement>(null)
  const ring3Ref = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(HTMLDivElement | null)[]>([])
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Core pulse
      gsap.to(coreRef.current, {
        scale: 1.3,
        opacity: 0.6,
        duration: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })

      // Orbit rings rotation
      gsap.to(ring1Ref.current, {
        rotation: 360,
        duration: 8,
        ease: "none",
        repeat: -1,
      })
      gsap.to(ring2Ref.current, {
        rotation: -360,
        duration: 12,
        ease: "none",
        repeat: -1,
      })
      gsap.to(ring3Ref.current, {
        rotation: 360,
        duration: 16,
        ease: "none",
        repeat: -1,
      })

      // Floating dots stagger
      dotsRef.current.forEach((dot, i) => {
        if (!dot) return
        gsap.to(dot, {
          y: -12 - i * 3,
          opacity: 0.3,
          duration: 1.5 + i * 0.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.15,
        })
      })

      // Text fade
      gsap.to(textRef.current, {
        opacity: 0.4,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#11111b] flex items-center justify-center overflow-hidden">
      {/* Orbital system */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Ring 3 (outermost) */}
        <div
          ref={ring3Ref}
          className="absolute inset-0 rounded-full border border-[#313244]/30"
          style={{
            borderStyle: "dashed",
            borderWidth: "1px",
          }}
        />

        {/* Ring 2 */}
        <div
          ref={ring2Ref}
          className="absolute inset-6 rounded-full border border-[#89b4fa]/15"
          style={{
            borderWidth: "1px",
          }}
        />

        {/* Ring 1 (innermost) */}
        <div
          ref={ring1Ref}
          className="absolute inset-14 rounded-full border border-[#a6e3a1]/20"
          style={{
            borderWidth: "1.5px",
          }}
        />

        {/* Orbiting dots */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const radius = 38
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          return (
            <div
              key={i}
              ref={(el) => { dotsRef.current[i] = el }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: i % 2 === 0 ? "#89b4fa" : "#a6e3a1",
                left: `calc(50% + ${x}% - 4px)`,
                top: `calc(50% + ${y}% - 4px)`,
                boxShadow: i % 2 === 0
                  ? "0 0 8px rgba(137,180,250,0.5)"
                  : "0 0 8px rgba(166,227,161,0.4)",
              }}
            />
          )
        })}

        {/* Core */}
        <div
          ref={coreRef}
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #89b4fa 0%, #74c7ec 100%)",
            boxShadow: "0 0 32px rgba(137,180,250,0.4), 0 0 64px rgba(137,180,250,0.15)",
          }}
        >
          <div className="w-4 h-4 rounded-full bg-[#11111b]/60" />
        </div>
      </div>

      {/* Text */}
      <div className="absolute bottom-1/4 left-0 right-0 text-center mx-auto">
        <p
          ref={textRef}
          className="text-sm text-[#6c7086] font-mono tracking-wider"
        >
          Esperando datos del plan...
        </p>
      </div>
    </div>
  )
}
