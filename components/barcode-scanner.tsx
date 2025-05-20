"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw } from "lucide-react"

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Start scanner when component mounts
  useEffect(() => {
    startScanner()

    // Cleanup function to stop scanner when component unmounts
    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    try {
      setError(null)

      // Stop any existing scanner
      stopScanner()

      // Get camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsActive(true)

        // Start scanning for barcodes
        scannerIntervalRef.current = setInterval(() => {
          scanBarcode()
        }, 500) // Scan every 500ms
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Could not access camera. Please check permissions.")
      setIsActive(false)
    }
  }

  const stopScanner = () => {
    // Clear scanning interval
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current)
      scannerIntervalRef.current = null
    }

    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsActive(false)
    }
  }

  const scanBarcode = () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return

    const canvas = canvasRef.current
    const video = videoRef.current

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.height = video.videoHeight
      canvas.width = video.videoWidth

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // In a real implementation, we would use a barcode scanning library
      // like QuaggaJS or ZXing to detect barcodes from the canvas
      // For this demo, we'll simulate a barcode detection after 3 seconds

      // Simulated barcode detection
      // In a real app, this would be replaced with actual barcode detection logic
      const randomBarcode = Math.floor(100000000 + Math.random() * 900000000).toString()
      onDetected(randomBarcode)

      // Stop scanning after detecting a barcode
      stopScanner()
    }
  }

  const restartScanner = () => {
    stopScanner()
    setTimeout(() => {
      startScanner()
    }, 100)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border bg-background">
        {error ? (
          <div className="flex h-[300px] items-center justify-center p-4 text-center text-muted-foreground">
            <div>
              <p className="mb-2">{error}</p>
              <Button onClick={restartScanner} variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="h-[300px] w-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 border-2 border-dashed border-primary opacity-70" />
            </div>
            <div className="absolute bottom-4 right-4">
              <Button
                variant="outline"
                size="icon"
                className="bg-background/80 backdrop-blur-sm"
                onClick={restartScanner}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Position the barcode within the frame to scan</p>
    </div>
  )
}
