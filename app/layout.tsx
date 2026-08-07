import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Movies × Brands — Partner Portal',
  description: 'Portal privado para Brand Partners y Strategic Leaders',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: '#0B0B0B', color: '#fff' }}>
        {children}
      </body>
    </html>
  )
}
