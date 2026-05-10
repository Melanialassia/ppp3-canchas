"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await axios.get(
          "https://api-gateway-facu.onrender.com/reservas",
        );

        setData(response?.data);
      } catch (error) {
        console.error("Error al obtener reservas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          fontFamily: "Arial",
        }}
      >
        Cargando reservas...
      </div>
    );
  }

  return (
    <div>
      {data?.map((item: any) => (
        <div
          key={item.id}
          style={{
            maxWidth: "400px",
            margin: "20px auto",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontFamily: "Arial",
          }}
        >
          <h2>Reserva #{item.id}</h2>

          <p>
            <strong>Cliente:</strong> {item.cliente.nombre}{" "}
            {item.cliente.apellido}
          </p>

          <p>
            <strong>Cancha:</strong> {item.cancha.nombre}
          </p>

          <p>
            <strong>Fecha:</strong> {item.fecha}
          </p>

          <p>
            <strong>Horario:</strong> {item.hora_inicio} - {item.hora_fin}
          </p>

          <p>
            <strong>Total:</strong> ${item.precio_total}
          </p>

          <p>
            <strong>Estado:</strong> {item.estado}
          </p>
        </div>
      ))}
    </div>
  );
}
