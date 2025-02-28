import { Toaster } from "sonner"

export const metadata = {
  title: "ERVERSE Wallet",
  description: "Mine $ERVE tokens and manage your crypto assets",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css" />
      </head>
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}



import './globals.css'