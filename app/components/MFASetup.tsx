'use client'
import { useState } from 'react'

interface MFASetupProps {
  onComplete?: () => void
  onSkip?: () => void
  required?: boolean
}

export default function MFASetup({ onComplete, onSkip, required = false }: MFASetupProps) {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify' | 'done'>('intro')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function startEnroll() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/mfa/enroll', { method: 'POST' })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    setQrCode(data.qrCode)
    setSecret(data.secret)
    setFactorId(data.factorId)
    setStep('qr')
    setLoading(false)
  }

  async function verifyCode() {
    if (code.length !== 6) { setError('El código debe tener 6 dígitos'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ factorId, code, action: 'enroll' }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    setStep('done')
    setLoading(false)
    setTimeout(() => onComplete?.(), 1500)
  }

  return (
    <div style={{
      background: '#161616', border: '1px solid #2c2c2c', borderRadius: 12,
      padding: 32, maxWidth: 440, margin: '0 auto', color: '#F7F3EC',
    }}>
      {step === 'intro' && (
        <>
          <div style={{ fontSize: 32, marginBottom: 16, textAlign: 'center' }}>🔐</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
            Verificación en dos pasos
          </h2>
          <p style={{ color: 'rgba(247,243,236,.6)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            {required
              ? 'Tu rol de administrador requiere autenticación de dos factores.'
              : 'Activa la verificación en dos pasos para mayor seguridad.'}
          </p>
          <button onClick={startEnroll} disabled={loading} style={{
            width: '100%', background: '#C9A227', color: '#0B0B0B', border: 'none',
            borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            marginBottom: 12,
          }}>
            {loading ? 'Configurando…' : 'Activar 2FA'}
          </button>
          {!required && (
            <button onClick={onSkip} style={{
              width: '100%', background: 'transparent', color: 'rgba(247,243,236,.5)',
              border: '1px solid #2c2c2c', borderRadius: 8, padding: '10px 0',
              fontSize: 14, cursor: 'pointer',
            }}>
              Omitir por ahora
            </button>
          )}
        </>
      )}

      {step === 'qr' && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
            Escanea el código QR
          </h2>
          <p style={{ color: 'rgba(247,243,236,.6)', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
            Abre Google Authenticator o cualquier app TOTP y escanea:
          </p>
          {qrCode && (
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img src={qrCode} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 8 }} />
            </div>
          )}
          <p style={{ fontSize: 11, color: 'rgba(247,243,236,.4)', textAlign: 'center', marginBottom: 20 }}>
            Clave manual: <code style={{ color: '#C9A227', letterSpacing: 2 }}>{secret}</code>
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="Código de 6 dígitos"
            style={{
              width: '100%', boxSizing: 'border-box', background: '#0B0B0B',
              border: '1px solid #2c2c2c', borderRadius: 8, color: '#F7F3EC',
              padding: '12px 16px', fontSize: 20, textAlign: 'center',
              letterSpacing: 8, marginBottom: 16,
            }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}
          <button onClick={verifyCode} disabled={loading || code.length !== 6} style={{
            width: '100%', background: '#C9A227', color: '#0B0B0B', border: 'none',
            borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 15,
            cursor: code.length === 6 ? 'pointer' : 'not-allowed',
            opacity: code.length === 6 ? 1 : 0.5,
          }}>
            {loading ? 'Verificando…' : 'Verificar y activar'}
          </button>
        </>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#C9A227' }}>2FA activado</h2>
          <p style={{ color: 'rgba(247,243,236,.6)', fontSize: 14 }}>
            Tu cuenta está protegida con verificación en dos pasos.
          </p>
        </div>
      )}
    </div>
  )
}
