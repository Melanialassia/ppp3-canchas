import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context'
import { AuthService } from '@/services'
import { LuArrowRight } from "react-icons/lu";
import { FieldError, inputCls } from '@/components/atoms'

interface LoginFormProps {
  mostrar: (msg: string, tipo: 'success' | 'error' | 'warning' | 'info') => void
}

type LoginErrors = { email: string; password: string }
const L0: LoginErrors = { email: '', password: '' }

export function LoginForm({ mostrar }: LoginFormProps) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errs, setErrs] = useState<LoginErrors>(L0)

  const set = <K extends keyof typeof form>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrs((e) => ({ ...e, [k]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = { ...L0 }
    if (!form.email) next.email = 'El email es requerido'
    if (!form.password) next.password = 'La contraseña es requerida'
    if (next.email || next.password) { setErrs(next); return }

    setCargando(true)
    try {
      const s = await AuthService.login(form.email, form.password)
      login(s)
      mostrar('¡Bienvenido! Redirigiendo…', 'success')
      setTimeout(() => navigate(s.rol === 'admin' ? '/admin' : '/reservar'), 1200)
    } catch (err) {
      mostrar((err as Error).message || 'Email o contraseña incorrectos', 'error')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="flex flex-col gap-1" onSubmit={handleSubmit} noValidate>
      <div className="mb-5">
        <label htmlFor="login-email" className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Email</label>
        <input
          id="login-email"
          type="email"
          className={inputCls(errs.email)}
          placeholder="tu@email.com"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />
        <FieldError msg={errs.email} />
      </div>
      <div className="mb-5">
        <label htmlFor="login-password" className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Contraseña</label>
        <input
          id="login-password"
          type="password"
          className={inputCls(errs.password)}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
        />
        <FieldError msg={errs.password} />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-block btn-large mt-3"
        disabled={cargando}
      >
        {cargando ? 'Iniciando sesión…' : <> Iniciar Sesión <LuArrowRight size={16} /></>}
      </button>
      <button
        type="button"
        className="text-center text-brand-600 text-[13px] font-medium mt-3 hover:text-brand-800 transition-colors bg-transparent border-none cursor-pointer font-[inherit]"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  )
}
