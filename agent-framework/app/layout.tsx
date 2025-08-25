import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agent Framework v2 - Advanced AI Agent Platform',
  description: 'Next-generation TypeScript agent framework with swarm intelligence, blockchain integration, and advanced LLM capabilities',
  keywords: ['AI', 'Agents', 'TypeScript', 'Blockchain', 'DeFi', 'Swarm Intelligence', 'Sei Network'],
  authors: [{ name: 'Agent Framework Team' }],
  creator: 'Agent Framework v2',
  openGraph: {
    title: 'Agent Framework v2',
    description: 'Advanced AI Agent Platform with Blockchain Integration',
    type: 'website',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Framework v2',
    description: 'Advanced AI Agent Platform with Blockchain Integration'
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0066FF'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900`}>
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
}