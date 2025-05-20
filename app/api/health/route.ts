import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { withErrorHandler } from "@/middleware/error-handler"

export const GET = withErrorHandler(async () => {
  try {
    // Test the MongoDB connection
    const client = await clientPromise
    const db = client.db()

    // Ping the database
    await db.command({ ping: 1 })

    return NextResponse.json({
      status: "ok",
      mongodb: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        mongodb: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
})
