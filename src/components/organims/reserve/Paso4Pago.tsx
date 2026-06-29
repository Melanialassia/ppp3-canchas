import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { PagosService } from '@/services'
import { MoneyUtils } from '@/utils'
import { useAlert } from '@/components'
import type { Reserva } from '@/types'
import type { TipoPago } from '@/types'

interface Props {
  reserva: Reserva
}

export function Paso4Pago({ reserva }: Props) {
  const navigate = useNavigate()
  const { mostrar, AlertComponent } = useAlert()

  const [tipoPago, setTipoPago] = useState<TipoPago>('seña')
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [generando, setGenerando] = useState(false)

  const sena = reserva.senaRequerida ?? 0
  const total = reserva.precioTotal
  const montoSeleccionado = tipoPago === 'seña' ? sena : total

  useEffect(() => {
    initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-AR' })
  }, [])

  async function generarPreferencia() {
    setGenerando(true)
    setPreferenceId(null)
    try {
      const response = await PagosService.crearPreferencia({
        title: tipoPago === 'seña' ? 'Seña de Reserva de Cancha' : 'Pago Total de Reserva',
        unit_price: montoSeleccionado,
        quantity: 1,
        reservaId: reserva.id,
      })
      if (response.preferenceId) {
        setPreferenceId(response.preferenceId)
      } else {
        throw new Error('El backend no devolvió un preferenceId válido')
      }
    } catch (err) {
      mostrar((err as Error).message || 'Error al conectar con MercadoPago.', 'error')
    } finally {
      setGenerando(false)
    }
  }

  function pagarMasTarde() {
    mostrar('Reserva guardada como pendiente. Podés pagar más tarde.', 'info')
    setTimeout(() => navigate('/mis-reservas'), 1500)
  }

  return (
    <div className="p-6">
      {AlertComponent}
      <h2 className="text-lg font-bold text-slate-900 mb-1">Paso 4: Pago de la seña</h2>
      <p className="text-sm text-slate-400 mb-6">
        Pagá la seña para <strong className="text-slate-600">confirmar</strong> tu reserva.
        Serás redirigido a MercadoPago para completar el pago de forma segura.
      </p>

      {/* Resumen de precios */}
      <div className="text-center mb-6 py-5 rounded-2xl bg-brand-50 border border-brand-100">
        <p className="text-[13px] text-brand-700 font-semibold mb-1">Total de la reserva</p>
        <p className="text-4xl font-extrabold text-brand-700 tracking-tight leading-none">
          {MoneyUtils.formatear(total)}
        </p>
        <p className="text-[12.5px] text-slate-400 mt-2">
          Seña requerida:{' '}
          <strong className="text-slate-600">{MoneyUtils.formatear(sena)}</strong>
        </p>
      </div>

      {/* Selector de tipo de pago */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <label
          className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            tipoPago === 'seña'
              ? 'border-brand-500 bg-brand-50'
              : 'border-slate-100 bg-white hover:border-brand-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`font-semibold text-sm ${tipoPago === 'seña' ? 'text-brand-700' : 'text-slate-700'}`}>
              Pagar Seña (30%)
            </span>
            <input
              type="radio"
              name="tipoPago"
              value="seña"
              checked={tipoPago === 'seña'}
              onChange={() => { setTipoPago('seña'); setPreferenceId(null) }}
              className="w-4 h-4"
            />
          </div>
          <p className={`text-xl font-bold ${tipoPago === 'seña' ? 'text-brand-700' : 'text-slate-400'}`}>
            {MoneyUtils.formatear(sena)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">El resto se abona en la cancha.</p>
        </label>

        <label
          className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            tipoPago === 'completo'
              ? 'border-brand-500 bg-brand-50'
              : 'border-slate-100 bg-white hover:border-brand-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`font-semibold text-sm ${tipoPago === 'completo' ? 'text-brand-700' : 'text-slate-700'}`}>
              Pago Completo
            </span>
            <input
              type="radio"
              name="tipoPago"
              value="completo"
              checked={tipoPago === 'completo'}
              onChange={() => { setTipoPago('completo'); setPreferenceId(null) }}
              className="w-4 h-4"
            />
          </div>
          <p className={`text-xl font-bold ${tipoPago === 'completo' ? 'text-brand-700' : 'text-slate-400'}`}>
            {MoneyUtils.formatear(total)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sin saldos pendientes.</p>
        </label>
      </div>

      {/* Botón de MercadoPago */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
        {!preferenceId ? (
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={generarPreferencia}
            disabled={generando}
          >
            {generando
              ? 'Generando enlace de pago...'
              : `Pagar ${MoneyUtils.formatear(montoSeleccionado)} con MercadoPago`}
          </button>
        ) : (
          <div className="max-w-xs mx-auto">
            <p className="text-[12.5px] text-slate-500 mb-3">
              Hacé clic en el botón para completar tu pago de forma segura:
            </p>
            <Wallet initialization={{ preferenceId }} />
          </div>
        )}
      </div>

      {/* Pagar más tarde */}
      <div className="flex justify-center mt-5 pt-4 border-t border-slate-100">
        <button type="button" className="btn btn-outline" onClick={pagarMasTarde}>
          Pagar más tarde
        </button>
      </div>
    </div>
  )
}
