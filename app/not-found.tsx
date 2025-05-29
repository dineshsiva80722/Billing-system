import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Page Under Development',
  description: 'The page you are looking for is currently under development',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
        <h2 className="text-2xl mb-4">Page Under Development</h2>
        <p className="text-muted-foreground mb-8">
          This page is currently under development and will be available soon. 
          We appreciate your patience as we continue to improve our platform.
        </p>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  )
}