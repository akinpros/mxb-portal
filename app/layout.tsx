import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Movies × Brands — Partner Portal',
  description: 'Portal privado para Brand Partners y Strategic Leaders',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,700;1,9..144,300&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0B0B0B', color: '#fff' }}>
        {children}
      </body>
    </html>
  )
}
