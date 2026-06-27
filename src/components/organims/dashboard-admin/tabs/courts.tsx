import { useState } from 'react'
import { useCanchas } from '@/hooks'
import { CanchasService } from '@/services'
import { CanchaCard, Modal, Spinner, useAlert } from '@/components'
import { FieldError, inputCls } from '@/components/atoms'
import type { Cancha, EstadoCancha } from '@/types'

type FormErrors = { nombre: string; precioPorHora: string }
const FORM_ERRORS_EMPTY: FormErrors = { nombre: '', precioPorHora: '' }

interface FormCancha {
  nombre: string
  capacidad: number
  precioPorHora: number
  descripcion: string
}

const FORM_VACIO: FormCancha = { nombre: '', capacidad: 22, precioPorHora: 0, descripcion: '' }

export function CanchasTab() {
  const { canchas, loading, error, recargar } = useCanchas()
  const { mostrar, AlertComponent } = useAlert()
  const [canchaModal, setCanchaModal] = useState<Cancha | null>(null)
  const [nuevoEstado, setNuevoEstado] = useState<EstadoCancha>('disponible')
  const [guardando, setGuardando] = useState(false)
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Cancha | null>(null)
  const [form, setForm] = useState<FormCancha>(FORM_VACIO)
  const [formErrors, setFormErrors] = useState<FormErrors>(FORM_ERRORS_EMPTY)

  function abrirModal(cancha: Cancha) {
    setCanchaModal(cancha)
    setNuevoEstado(cancha.estado)
  }

  function abrirAlta() {
    setEditando(null)
    setForm(FORM_VACIO)
    setFormErrors(FORM_ERRORS_EMPTY)
    setFormAbierto(true)
  }

  function abrirEdicion(cancha: Cancha) {
    setEditando(cancha)
    setForm({
      nombre: cancha.nombre,
      capacidad: cancha.capacidad,
      precioPorHora: cancha.precioPorHora,
      descripcion: cancha.descripcion ?? '',
    })
    setFormErrors(FORM_ERRORS_EMPTY)
    setFormAbierto(true)
  }

  async function cambiarEstado() {
    if (!canchaModal) return
    setGuardando(true)
    try {
      await CanchasService.cambiarEstado(canchaModal.id, nuevoEstado)
      mostrar('Estado actualizado', 'success')
      setCanchaModal(null)
      recargar()
    } catch (err) {
      mostrar((err as Error).message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  async function guardarCancha() {
    const errs = { ...FORM_ERRORS_EMPTY }
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio'
    if (form.precioPorHora <= 0) errs.precioPorHora = 'El precio debe ser mayor a 0'
    if (errs.nombre || errs.precioPorHora) { setFormErrors(errs); return }
    setGuardando(true)
    setFormErrors(FORM_ERRORS_EMPTY)
    try {
      const datos = {
        nombre: form.nombre.trim(),
        capacidad: form.capacidad,
        precioPorHora: form.precioPorHora,
        descripcion: form.descripcion.trim() || undefined,
      }
      if (editando) {
        await CanchasService.actualizar(editando.id, datos)
        mostrar('Cancha actualizada', 'success')
      } else {
        await CanchasService.crear(datos)
        mostrar('Cancha creada', 'success')
      }
      setFormAbierto(false)
      recargar()
    } catch (err) {
      mostrar((err as Error).message || 'Error al guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      {AlertComponent}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestión de Canchas</h1>
        <button className="btn btn-primary" onClick={abrirAlta}>+ Nueva cancha</button>
      </div>

      {loading && <Spinner />}
      {error && <div className="px-4 py-3.5 rounded-xl flex items-start gap-3 text-[13.5px] border bg-red-50 text-red-800 border-red-200">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {canchas.map(c => (
            <CanchaCard
              key={c.id}
              cancha={c}
              mode="admin"
              onCambiarEstado={abrirModal}
              onEditar={abrirEdicion}
            />
          ))}
        </div>
      )}

      {canchaModal && (
        <Modal
          titulo={`Cambiar estado — ${canchaModal.nombre}`}
          onClose={() => setCanchaModal(null)}
          footer={
            <div className="flex gap-2 justify-end">
              <button className="btn btn-outline" onClick={() => setCanchaModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={cambiarEstado} disabled={guardando}>
                {guardando ? '...' : 'Guardar'}
              </button>
            </div>
          }
        >
          <div className="mb-5">
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Nuevo estado</label>
            <select
              className="form-select"
              value={nuevoEstado}
              onChange={e => setNuevoEstado(e.target.value as EstadoCancha)}
            >
              <option value="disponible">Disponible</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="fuera_servicio">Fuera de servicio</option>
            </select>
          </div>
        </Modal>
      )}

      {formAbierto && (
        <Modal
          titulo={editando ? `Editar — ${editando.nombre}` : 'Nueva cancha'}
          onClose={() => setFormAbierto(false)}
          footer={
            <div className="flex gap-2 justify-end">
              <button className="btn btn-outline" onClick={() => setFormAbierto(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarCancha} disabled={guardando}>
                {guardando ? '...' : 'Guardar'}
              </button>
            </div>
          }
        >
          <div className="mb-5">
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Nombre</label>
            <input
              className={inputCls(formErrors.nombre)}
              value={form.nombre}
              onChange={e => { setForm({ ...form, nombre: e.target.value }); setFormErrors(v => ({ ...v, nombre: '' })) }}
            />
            <FieldError msg={formErrors.nombre} />
          </div>
          <div className="mb-5">
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Capacidad</label>
            <select
              className="form-select"
              value={form.capacidad}
              onChange={e => setForm({ ...form, capacidad: Number(e.target.value) })}
            >
              <option value={22}>Fútbol 11 (22 jugadores)</option>
              <option value={14}>Fútbol 7 (14 jugadores)</option>
              <option value={10}>Fútbol 5 (10 jugadores)</option>
            </select>
          </div>
          <div className="mb-5">
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Precio por hora</label>
            <input
              type="number"
              min={0}
              className={inputCls(formErrors.precioPorHora)}
              value={form.precioPorHora}
              onChange={e => { setForm({ ...form, precioPorHora: Number(e.target.value) }); setFormErrors(v => ({ ...v, precioPorHora: '' })) }}
            />
            <FieldError msg={formErrors.precioPorHora} />
          </div>
          <div className="mb-5">
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Descripción</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
