import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ClientesService } from "../../services/clientes.service";
import { useAlert } from "../../components/ui/Alert";
import type { DatosCliente } from "./ReservarPage";

interface Props {
  onNext: (datos: DatosCliente) => void;
}

type Errors = { telefono: string; nombre: string; apellido: string };
const EMPTY: Errors = { telefono: "", nombre: "", apellido: "" };

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <span className="form-error mt-1 flex items-center gap-1">⚠ {msg}</span>
  );
}
const inputCls = (err: string) => `form-input${err ? " border-red-400" : ""}`;

export function Paso1Cliente({ onNext }: Props) {
  const { sesion } = useAuth();
  const { mostrar, AlertComponent } = useAlert();
  const [telefono, setTelefono] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [readonly, setReadonly] = useState(false);
  const [datosVisibles, setDatosVisibles] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [errors, setErrors] = useState<Errors>(EMPTY);

  useEffect(() => {
    if (sesion?.clienteId) {
      setTelefono(sesion.telefono ?? "");
      setNombre(sesion.nombre ?? "");
      setApellido(sesion.apellido ?? "");
      setEmail(sesion.email ?? "");
      setClienteId(sesion.clienteId);
      setReadonly(true);
      setDatosVisibles(true);
    }
  }, [sesion]);

  async function buscarCliente() {
    const errs = { ...EMPTY };
    if (!telefono.trim()) errs.telefono = "Ingresá un número de teléfono";
    else if (!/^\d{8,15}$/.test(telefono))
      errs.telefono = "Solo dígitos, 8 a 15 caracteres";
    if (errs.telefono) {
      setErrors(errs);
      return;
    }

    setBuscando(true);
    try {
      const cliente = await ClientesService.buscarPorTelefono(telefono);
      if (cliente) {
        setNombre(cliente.nombre);
        setApellido(cliente.apellido);
        setEmail(cliente.email ?? "");
        setClienteId(cliente.id);
        setReadonly(true);
        mostrar(
          `Cliente encontrado: ${cliente.nombre} ${cliente.apellido}`,
          "success",
        );
      } else throw new Error();
    } catch {
      setNombre("");
      setApellido("");
      setEmail("");
      setClienteId(null);
      setReadonly(false);
      mostrar(
        "No encontramos ese teléfono. Completá los datos para registrarte.",
        "warning",
      );
    } finally {
      setBuscando(false);
      setDatosVisibles(true);
    }
  }

  function siguiente() {
    const errs = { ...EMPTY };
    if (!telefono) errs.telefono = "El teléfono es requerido";
    else if (!/^\d{8,15}$/.test(telefono))
      errs.telefono = "Solo dígitos, 8 a 15 caracteres";
    if (datosVisibles && !nombre) errs.nombre = "El nombre es requerido";
    if (datosVisibles && !apellido) errs.apellido = "El apellido es requerido";
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      return;
    }
    onNext({
      id: clienteId,
      nombre,
      apellido,
      telefono,
      email,
      esNuevo: !clienteId,
    });
  }

  return (
    <div className="card-body">
      {AlertComponent}
      <h2 className="card-title mb-1">Paso 1: Tus Datos</h2>
      <p className="text-sm text-slate-400 mb-6">
        Buscá tu teléfono o completá los datos para registrarte.
      </p>

      {sesion?.clienteId && (
        <div className="alert alert-success mb-5">
          ✓ Datos cargados desde tu cuenta:{" "}
          <strong>
            {sesion.nombre} {sesion.apellido}
          </strong>
        </div>
      )}

      <div className="form-group">
        <label className="form-label required">Teléfono</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="tel"
              className={inputCls(errors.telefono)}
              placeholder="Ej: 1123456789"
              value={telefono}
              readOnly={readonly}
              onChange={(e) => {
                setTelefono(e.target.value);
                setErrors((v) => ({ ...v, telefono: "" }));
              }}
            />
            <FieldError msg={errors.telefono} />
          </div>
          {!sesion?.clienteId && (
            <button
              type="button"
              className="btn btn-outline self-start whitespace-nowrap"
              onClick={buscarCliente}
              disabled={buscando}
            >
              {buscando ? "Buscando…" : "Buscar"}
            </button>
          )}
        </div>
      </div>

      {datosVisibles && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Nombre</label>
              <input
                type="text"
                className={inputCls(errors.nombre)}
                value={nombre}
                readOnly={readonly}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setErrors((v) => ({ ...v, nombre: "" }));
                }}
              />
              <FieldError msg={errors.nombre} />
            </div>
            <div className="form-group">
              <label className="form-label required">Apellido</label>
              <input
                type="text"
                className={inputCls(errors.apellido)}
                value={apellido}
                readOnly={readonly}
                onChange={(e) => {
                  setApellido(e.target.value);
                  setErrors((v) => ({ ...v, apellido: "" }));
                }}
              />
              <FieldError msg={errors.apellido} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              Email{" "}
              <span className="text-slate-400 font-normal text-[12px]">
                (opcional)
              </span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={email}
              readOnly={readonly}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </>
      )}

      <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          className="btn btn-primary"
          onClick={siguiente}
          disabled={!datosVisibles && !sesion?.clienteId}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
