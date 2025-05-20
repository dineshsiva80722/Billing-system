import { NextResponse } from "next/server"

export function withErrorHandler(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args)
    } catch (error) {
      console.error("API route error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}
