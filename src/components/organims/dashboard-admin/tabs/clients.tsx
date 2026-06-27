import { useState } from "react";
import { useClientes, useDebounce } from "@/hooks";
import { Spinner } from "@/components";
import { ClientsTable } from "@/components/organims/tables";

export function ClientesTab() {
  const [busqueda, setBusqueda] = useState("");
  const termino = useDebounce(busqueda, 500);
  const params: Record<string, string> = termino ? { busqueda: termino } : {};
  const { clientes, loading, error } = useClientes(params);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">
        Gestión de Clientes
      </h1>
      <div className="mb-6 max-w-sm">
        <input
          type="text"
          className="form-input"
          placeholder="Buscar por nombre, teléfono o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      {loading && <Spinner />}
      {error && (
        <div className="px-4 py-3.5 rounded-xl flex items-start gap-3 text-[13.5px] border bg-red-50 text-red-800 border-red-200">
          {error}
        </div>
      )}
      <ClientsTable clientes={clientes} loading={loading} error={error ?? ''} />
    </div>
  );
}
