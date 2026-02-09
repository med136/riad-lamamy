'use client'

import { useState } from 'react'
import { Search, Lock, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@riaddanalandalus.com')
  const [password, setPassword] = useState('********')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await signIn(email, password)
      if (error) {
        console.error('Sign in error:', error)
        setError(error.message || 'Email ou mot de passe incorrect')
        toast.error(error.message || 'Email ou mot de passe incorrect')
        return
      }

      if (data && data.session && data.session.user) {
        // Optionnel : stocker info en localStorage pour le frontend
        localStorage.setItem('admin_authenticated', 'true')
        localStorage.setItem('admin_email', data.session.user.email || email)
        toast.success('Connexion réussie')
        router.push('/admin/dashboard')
      } else {
        setError('Impossible de se connecter pour le moment')
        toast.error('Impossible de se connecter pour le moment')
      }
    } catch (err: any) {
      console.error('Unexpected sign in error:', err)
      setError(err?.message || 'Erreur lors de la connexion')
      toast.error(err?.message || 'Erreur lors de la connexion')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-header">
          <div className="brand-logo">
            <span style={{ fontSize: '48px' }}>🏨</span>
          </div>
          <h1 className="brand-title">Riad Admin</h1>
          <p className="brand-subtitle">Dar Al Andalus</p>
          <p className="access-text">Accès réservé au personnel</p>
        </div>

        {/* Barre de recherche */}
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher des réservations, chambres, clients..."
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Adresse email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} 
              />
              <input
                type="email"
                id="email"
                className="form-input"
                style={{ paddingLeft: '45px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@riaddanalandalus.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} 
              />
              <input
                type="password"
                id="password"
                className="form-input"
                style={{ paddingLeft: '45px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                className="remember-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Se souvenir de moi
            </label>
            <a href="#" className="forgot-password">
              Mot de passe oublié ?
            </a>
          </div>

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} Riad Dar Al Andalus. Tous droits réservés.</p>
          <p style={{ fontSize: '11px', marginTop: '5px', opacity: 0.7 }}>
            Version 2.0.0 • Panel d'administration
          </p>
        </div>
      </div>
    </div>
  )
}
