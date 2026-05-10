"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://api-gateway-facu.onrender.com/reservas")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => console.error(error));
  }, []);

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
            <strong>Cliente:</strong>{" "}
            {item.cliente.nombre} {item.cliente.apellido}
          </p>

          <p>
            <strong>Cancha:</strong> {item.cancha.nombre}
          </p>

          <p>
            <strong>Fecha:</strong> {item.fecha}
          </p>

          <p>
            <strong>Horario:</strong>{" "}
            {item.hora_inicio} - {item.hora_fin}
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
