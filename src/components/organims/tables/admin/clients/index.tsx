import type { Cliente } from "@/types";
import { EmptyState } from "@/components/molecules";
import { Table } from "./table";

export const ClientsTable = ({
  loading,
  error,
  clientes,
}: {
  clientes: Cliente[];
  loading: boolean;
  error: string;
}) => {
  if (!loading && !error && !clientes?.length) {
    return <EmptyState titulo="No se encontraron clientes" variant="inline" />;
  }

  return !loading && !!clientes?.length && <Table clientes={clientes} />;
};
