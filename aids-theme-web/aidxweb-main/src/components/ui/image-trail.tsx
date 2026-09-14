"use client"

import React, { useEffect, useRef } from "react"
import { Expo, gsap, Power1, Quint } from "gsap"
import Image from "next/image"

interface ImageTrailProps {
  images: string[]
  imageWidth?: number
  imageHeight?: number
  threshold?: number
  duration?: number
}

export function ImageTrail({
  images = [],
  imageWidth = 200,
  imageHeight = 200,
  threshold = 50,
  duration = 1.6,
}: ImageTrailProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const imagesRef = useRef<HTMLDivElement[]>([]) // Changed to Div element because Next/Image wrapper
  const mousePos = useRef({ x: 0, y: 0 })
  const cacheMousePos = useRef({ x: 0, y: 0 })
  const lastMousePos = useRef({ x: 0, y: 0 })
  const zIndexVal = useRef(1)
  const imgPosition = useRef(0)
  const parentSize = useRef({ width: 0, height: 0 })
  const animationFrameId = useRef<number | null>(null)
  
  // Ref for dimensions to make them responsive and accessible in loop
  const widthRef = useRef(imageWidth)
  const heightRef = useRef(imageHeight)

  useEffect(() => {
    widthRef.current = imageWidth
    heightRef.current = imageHeight
  }, [imageWidth, imageHeight])

  useEffect(() => {
    // Initialize images ref - selecting the container divs of the images
    if (contentRef.current) {
      imagesRef.current = Array.from(contentRef.current.querySelectorAll(".trail-image-container")) as HTMLDivElement[]
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = contentRef.current?.getBoundingClientRect()
      if (rect) {
        mousePos.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }
    }

    const calcParentSize = () => {
      const rect = contentRef.current?.getBoundingClientRect()
      if (rect) {
        parentSize.current = { width: rect.width, height: rect.height }
      }
    }

    // Initial setup
    calcParentSize()
    
    if (imagesRef.current.length === 0) {
        return
    }

    // Event listeners
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", calcParentSize)

    // Start animation loop
    const loop = () => {
      renderImages()
      animationFrameId.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", calcParentSize)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      // Cleanup GSAP animations
      imagesRef.current.forEach(img => gsap.killTweensOf(img))
    }
  }, [])

  const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b

  const getMouseDistance = () => {
    const dx = mousePos.current.x - lastMousePos.current.x
    const dy = mousePos.current.y - lastMousePos.current.y
    return Math.hypot(dx, dy)
  }

  const renderImages = () => {
    const distance = getMouseDistance()

    cacheMousePos.current.x = lerp(
      cacheMousePos.current.x,
      mousePos.current.x,
      0.1
    )
    cacheMousePos.current.y = lerp(
      cacheMousePos.current.y,
      mousePos.current.y,
      0.1
    )

    if (distance > threshold) {
      showNextImage()
      zIndexVal.current += 1
      imgPosition.current = (imgPosition.current + 1) % imagesRef.current.length
      lastMousePos.current = { ...mousePos.current }
    }
  }

  const showNextImage = () => {
    const img = imagesRef.current[imgPosition.current]
    if (!img) return

    const w = widthRef.current
    const h = heightRef.current

    gsap.killTweensOf(img)

    // Using force3D: true to push to GPU layer
    gsap
      .timeline()
      .set(img, {
        startAt: { opacity: 0, scale: 1 },
        opacity: 1,
        zIndex: zIndexVal.current,
        x: cacheMousePos.current.x - w / 2,
        y: cacheMousePos.current.y - h / 2,
        force3D: true, // Force GPU acceleration
      })
      .to(img, {
        duration: duration,
        ease: Expo.easeOut,
        x: mousePos.current.x - w / 2,
        y: mousePos.current.y - h / 2,
        force3D: true,
      })
      .to(
        img,
        {
          duration: 1,
          ease: Power1.easeOut,
          opacity: 0,
        },
        0.4
      )
      .to(
        img,
        {
          duration: 1,
          ease: Quint.easeInOut,
          y: `+=${parentSize.current.height + h / 2}`,
        },
        0.4
      )
  }

  return (
    <div
      style={
        {
          "--image-width": `${imageWidth}px`,
          "--image-height": `${imageHeight}px`,
        } as React.CSSProperties
      }
      className="relative isolate z-0 flex h-full w-full items-center justify-center overflow-hidden"
      ref={contentRef}
    >
      {images.map((url, index) => (
        <div
            key={index}
            className="trail-image-container pointer-events-none absolute top-0 left-0 h-[var(--image-height)] w-[var(--image-width)] opacity-0 will-change-transform"
        >
             <Image
                src={url}
                alt={`Trail Image ${index + 1}`}
                width={imageWidth}
                height={imageHeight}
                className="w-full h-full object-cover"
                priority // Preload images for smoother performance
             />
        </div>
      ))}
    </div>
  )
}
