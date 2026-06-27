import { Link } from "react-router-dom";
import type { Reserva } from "@/types";
import { EmptyState } from "@/components/molecules";
import { Table } from "./table";

export const ReservationsTable = ({
  loading,
  error,
  reservas,
  handleSubmit,
  canceled,
}: {
  reservas: Reserva[];
  canceled: number | null;
  handleSubmit: (id: number) => Promise<void>;
  loading: boolean;
  error: string;
}) => {
  if (!loading && !error && !reservas?.length) {
    return (
      <EmptyState
        icono="📅"
        titulo="Aún no tenés reservas"
        descripcion=" Hacé tu primera reserva en segundos"
        accion={
          <Link to="/reservar" className="btn btn-primary">
            Hacer mi primera reserva
          </Link>
        }
      />
    );
  }

  return (
    !loading &&
    !!reservas?.length && (
      <Table
        canceled={canceled}
        handleSubmit={handleSubmit}
        reservas={reservas}
      />
    )
  );
};
