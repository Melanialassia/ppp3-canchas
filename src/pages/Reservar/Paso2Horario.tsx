import { useState, useEffect } from "react";
import { CanchasService } from "../../services/canchas.service";
import { ReservasService } from "../../services/reservas.service";
import { DateUtils } from "../../utils/date.utils";
import { HorarioUtils } from "../../utils/horario.utils";
import { MoneyUtils } from "../../utils/money.utils";
import { Spinner } from "../../components/ui/Spinner";
import type { Cancha, Reserva } from "../../types/api";
import type { DatosReserva } from "./ReservarPage";

interface Props {
  onNext: (datos: DatosReserva) => void;
  onBack: () => void;
}

type Errors = {
  cancha: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
};
const EMPTY: Errors = { cancha: "", fecha: "", horaInicio: "", horaFin: "" };

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <span className="form-error mt-1.5 flex items-center gap-1">⚠ {msg}</span>
  );
}

export function Paso2Horario({ onNext, onBack }: Props) {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [cargandoCanchas, setCargandoCanchas] = useState(true);
  const [canchaId, setCanchaId] = useState<number | "">("");
  const [fecha, setFecha] = useState(DateUtils.fechaHoy());
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [reservasOcupadas, setReservasOcupadas] = useState<Reserva[]>([]);
  const [cargandoDisp, setCargandoDisp] = useState(false);
  const [errors, setErrors] = useState<Errors>(EMPTY);

  useEffect(() => {
    CanchasService.obtenerTodas()
      .then((data) => setCanchas(data.filter((c) => c.estado === "disponible")))
      .finally(() => setCargandoCanchas(false));
  }, []);

  useEffect(() => {
    if (!fecha || !canchaId) return;
    setCargandoDisp(true);
    ReservasService.verificarDisponibilidad(fecha, canchaId as number)
      .then(setReservasOcupadas)
      .catch(() => setReservasOcupadas([]))
      .finally(() => setCargandoDisp(false));
    setHoraInicio("");
    setHoraFin("");
    setErrors(EMPTY);
  }, [fecha, canchaId]);

  function estaOcupado(hora: string) {
    return reservasOcupadas.some(
      (r) => hora >= r.horaInicio && hora < r.horaFin,
    );
  }
  function esPasado(hora: string) {
    return DateUtils.esHoy(fecha) && hora <= DateUtils.horaActual();
  }
  function seleccionarHora(hora: string) {
    setHoraInicio(hora);
    const [h, m] = hora.split(":").map(Number);
    setHoraFin(
      `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    );
    setErrors((e) => ({ ...e, horaInicio: "", horaFin: "" }));
  }

  function siguiente() {
    const errs = { ...EMPTY };
    if (!canchaId) errs.cancha = "Seleccioná una cancha";
    if (!fecha) errs.fecha = "La fecha es requerida";
    if (!horaInicio) errs.horaInicio = "Seleccioná un horario de inicio";
    else if (!horaFin) errs.horaFin = "Seleccioná el horario de fin";
    else {
      const dur = DateUtils.calcularDuracion(horaInicio, horaFin);
      if (dur <= 0)
        errs.horaFin = "El horario de fin debe ser posterior al inicio";
      if (dur > 3) errs.horaFin = "La duración máxima es 3 horas";
    }

    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      return;
    }

    const cancha = canchas.find((c) => c.id === (canchaId as number))!;
    onNext({
      canchaId: canchaId as number,
      cancha,
      fecha,
      horaInicio,
      horaFin,
      observaciones: "",
    });
  }

  const cancha = canchas.find((c) => c.id === (canchaId as number));
  const horariosBase = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];
  const opcionesFin = horaInicio
    ? HorarioUtils.generarOpciones(fecha, horaInicio).filter(
        (h) => h > horaInicio,
      )
    : [];

  return (
    <div className="card-body">
      <h2 className="card-title mb-1">Paso 2: Cancha y Horario</h2>
      <p className="text-sm text-slate-400 mb-6">
        Elegí la cancha, la fecha y el bloque horario que prefieras.
      </p>

      {cargandoCanchas ? (
        <Spinner />
      ) : (
        <>
          <div className="form-group">
            <label className="form-label required">Cancha</label>
            <select
              className={`form-select ${errors.cancha ? "border-red-400 focus:border-red-400" : ""}`}
              value={canchaId}
              onChange={(e) => {
                setCanchaId(e.target.value ? Number(e.target.value) : "");
                setErrors((v) => ({ ...v, cancha: "" }));
              }}
            >
              <option value="">Seleccioná una cancha</option>
              {canchas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} — {MoneyUtils.formatear(c.precioPorHora)}/hora
                </option>
              ))}
            </select>
            <FieldError msg={errors.cancha} />
          </div>

          <div className="form-group">
            <label className="form-label required">Fecha</label>
            <input
              type="date"
              className={`form-input ${errors.fecha ? "border-red-400 focus:border-red-400" : ""}`}
              min={DateUtils.fechaHoy()}
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                setErrors((v) => ({ ...v, fecha: "" }));
              }}
            />
            <FieldError msg={errors.fecha} />
          </div>

          {canchaId && fecha && (
            <div className="form-group">
              <label className="form-label">
                Horario de inicio
                {errors.horaInicio && (
                  <span className="form-error ml-2 inline">
                    ⚠ {errors.horaInicio}
                  </span>
                )}
              </label>
              {cargandoDisp ? (
                <Spinner texto="Verificando disponibilidad…" />
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {horariosBase.map((hora) => {
                    const ocupado = estaOcupado(hora);
                    const pasado = esPasado(hora);
                    const bloqueado = ocupado || pasado;
                    const seleccionado = horaInicio === hora;
                    return (
                      <button
                        key={hora}
                        type="button"
                        className={`btn btn-small ${
                          bloqueado
                            ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60"
                            : seleccionado
                              ? "btn-primary"
                              : "btn-outline"
                        }`}
                        disabled={bloqueado}
                        onClick={() => seleccionarHora(hora)}
                        title={
                          ocupado ? "Ocupado" : pasado ? "Hora pasada" : ""
                        }
                      >
                        {hora}
                      </button>
                    );
                  })}
                </div>
              )}

              {!cargandoDisp && (
                <div className="flex gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-brand-700 inline-block" />{" "}
                    Seleccionado
                  </span>
                  <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-200 inline-block" />{" "}
                    No disponible
                  </span>
                  <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200 inline-block" />{" "}
                    Disponible
                  </span>
                </div>
              )}
            </div>
          )}

          {horaInicio && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hora de inicio</label>
                <input
                  type="time"
                  className="form-input bg-slate-50"
                  value={horaInicio}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="form-label required">Hora de fin</label>
                <select
                  className={`form-select ${errors.horaFin ? "border-red-400 focus:border-red-400" : ""}`}
                  value={horaFin}
                  onChange={(e) => {
                    setHoraFin(e.target.value);
                    setErrors((v) => ({ ...v, horaFin: "" }));
                  }}
                >
                  <option value="">Elegí hora de fin</option>
                  {opcionesFin.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.horaFin} />
              </div>
            </div>
          )}

          {horaInicio && horaFin && cancha && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex items-center justify-between mt-2">
              <span className="text-[13.5px] text-brand-800 font-medium">
                {DateUtils.calcularDuracion(horaInicio, horaFin)}h ·{" "}
                {DateUtils.formatearHora(horaInicio)} a {DateUtils.formatearHora(horaFin)}
              </span>
              <span className="text-lg font-extrabold text-brand-700">
                {MoneyUtils.formatear(
                  cancha.precioPorHora *
                    DateUtils.calcularDuracion(horaInicio, horaFin),
                )}
              </span>
            </div>
          )}
        </>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
        <button type="button" className="btn btn-outline" onClick={onBack}>
          ← Volver
        </button>
        <button type="button" className="btn btn-primary" onClick={siguiente}>
          Siguiente →
        </button>
      </div>
    </div>
  );
}
