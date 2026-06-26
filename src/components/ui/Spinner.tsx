export function Spinner({ texto = 'Cargando...' }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="spinner" />
      {texto && <p className="text-slate-400 text-sm">{texto}</p>}
    </div>
  )
}
