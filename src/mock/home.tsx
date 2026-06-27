import { LuAlarmClock, LuPhoneCall, LuPin } from "react-icons/lu";

export const CARDS = [
  {
    icon: <LuPin className="text-red-500" />,
    color: "bg-red-50 text-red-600 ring-red-100",
    title: "Ubicación",
    lines: ["Buenos Aires, Argentina"],
  },
  {
    icon: <LuAlarmClock className="text-red-500" />,
    color: "bg-amber-50 text-amber-600 ring-amber-100",
    title: "Horarios",
    lines: ["Lunes a Domingo", "08:00 – 23:00"],
  },
  {
    icon: <LuPhoneCall className="text-slate-700" />,
    color: "bg-brand-50 text-brand-700 ring-brand-100",
    title: "Contacto",
    lines: ["(011) 1234-5678", "reservas@futbolreservas.ar"],
  },
];
