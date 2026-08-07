'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const G = '#D4AF37'
const CH = '#E8D5C4'
const BG = '#0B0B0B'
const PANEL = 'rgba(13,13,13,0.95)'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      background: `linear-gradient(rgba(0,0,0,.78),rgba(0,0,0,.88)), url('https://framerusercontent.com/images/dTyFXV94Ege8BjljhJdJjQEeK4.jpeg?width=1600') center/cover no-repeat`,
      backgroundColor: BG,
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{ fontWeight: 300, fontSize: 48, letterSpacing: '.35em', color: G, fontFamily: 'Georgia,serif' }}>MOVIES</div>
        <div style={{ fontWeight: 300, fontSize: 14, letterSpacing: '.5em', color: CH, fontFamily: 'Georgia,serif', marginTop: 2 }}>× BRANDS</div>
        <div style={{ fontSize: 10, letterSpacing: '.4em', opacity: .5, marginTop: 12, textTransform: 'uppercase', color: '#fff', fontFamily: 'Georgia,serif' }}>Partner Portal</div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420, background: PANEL,
        border: `1px solid ${G}`, borderRadius: 10,
        padding: '38px 34px', boxShadow: '0 30px 80px rgba(0,0,0,.75)',
      }}>
        <h3 style={{ fontWeight: 300, fontSize: 22, textAlign: 'center', color: G, marginBottom: 28, letterSpacing: '.15em', fontFamily: 'Georgia,serif' }}>
          Acceso al Portal
        </h3>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: CH, marginBottom: 7 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '12px 14px', background: '#101010', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', fontSize: 15, fontFamily: 'Georgia,serif', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: CH, marginBottom: 7 }}>Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '12px 14px', background: '#101010', border: '1px solid #3a3a3a', borderRadius: 6, color: '#fff', fontSize: 15, fontFamily: 'Georgia,serif', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(192,57,43,.15)', color: '#e07060', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: 14, background: loading ? '#555' : G,
              color: '#0b0b0b', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'Georgia,serif', fontWeight: 600,
            }}
          >
            {loading ? 'Entrando...' : 'Acceder al Portal →'}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #2a2a2a', textAlign: 'center', fontSize: 11, opacity: .4, color: '#fff', fontFamily: 'Georgia,serif' }}>
          Para solicitar acceso contacta con Movies × Brands
        </div>
      </div>
    </div>
  )
}
