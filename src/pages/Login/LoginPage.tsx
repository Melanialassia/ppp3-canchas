import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../components/ui/Alert";
import { AuthService } from "../../services/auth.service";
import { ShieldIcon, ArrowRightIcon } from "../../components/ui/Icons";

type Tab = "login" | "registro";

type LoginErrors = { email: string; password: string };
type RegErrors = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  passwordConfirm: string;
};

const L0: LoginErrors = { email: "", password: "" };
const R0: RegErrors = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  password: "",
  passwordConfirm: "",
};

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <span className="form-error mt-1 flex items-center gap-1">⚠ {msg}</span>
  );
}
function inputCls(err: string) {
  return `form-input${err ? " border-red-400" : ""}`;
}

export function LoginPage() {
  const { sesion, login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { mostrar, AlertComponent } = useAlert();
  const [tab, setTab] = useState<Tab>("login");
  const [cargando, setCargando] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginErr, setLoginErr] = useState<LoginErrors>(L0);

  const [regForm, setRegForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    passwordConfirm: "",
  });
  const [regErr, setRegErr] = useState<RegErrors>(R0);

  if (sesion) return <Navigate to={isAdmin ? "/admin" : "/reservar"} replace />;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errs = { ...L0 };
    if (!loginForm.email) errs.email = "El email es requerido";
    if (!loginForm.password) errs.password = "La contraseña es requerida";
    if (errs.email || errs.password) {
      setLoginErr(errs);
      return;
    }

    setCargando(true);
    try {
      const s = await AuthService.login(loginForm.email, loginForm.password);
      login(s);
      mostrar("¡Bienvenido! Redirigiendo…", "success");
      setTimeout(
        () => navigate(s.rol === "admin" ? "/admin" : "/reservar"),
        1200,
      );
    } catch (err) {
      mostrar(
        (err as Error).message || "Email o contraseña incorrectos",
        "error",
      );
    } finally {
      setCargando(false);
    }
  }
  const setLF = <K extends keyof typeof loginForm>(k: K, v: string) => {
    setLoginForm((f) => ({ ...f, [k]: v }));
    setLoginErr((e) => ({ ...e, [k]: "" }));
  };

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault();
    const { nombre, apellido, email, telefono, password, passwordConfirm } =
      regForm;
    const errs = { ...R0 };
    if (!nombre) errs.nombre = "El nombre es requerido";
    if (!apellido) errs.apellido = "El apellido es requerido";
    if (!email) errs.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Formato de email inválido";
    if (!telefono) errs.telefono = "El teléfono es requerido";
    else if (!/^\d{8,15}$/.test(telefono))
      errs.telefono = "Solo dígitos, 8 a 15 caracteres";
    if (!password) errs.password = "La contraseña es requerida";
    else if (password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (!passwordConfirm) errs.passwordConfirm = "Confirmá tu contraseña";
    else if (password !== passwordConfirm)
      errs.passwordConfirm = "Las contraseñas no coinciden";
    if (Object.values(errs).some(Boolean)) {
      setRegErr(errs);
      return;
    }

    setCargando(true);
    try {
      const s = await AuthService.registro({
        nombre,
        apellido,
        email,
        telefono,
        password,
      });
      login(s);
      mostrar("¡Cuenta creada! Bienvenido.", "success");
      setTimeout(() => navigate("/reservar"), 1200);
    } catch (err) {
      mostrar((err as Error).message || "Error al crear la cuenta", "error");
    } finally {
      setCargando(false);
    }
  }
  const setRF = <K extends keyof typeof regForm>(k: K, v: string) => {
    setRegForm((f) => ({ ...f, [k]: v }));
    setRegErr((e) => ({ ...e, [k]: "" }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {AlertComponent}

      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg,#022c22 0%,#064e3b 50%,#065f46 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="w-full max-w-[440px] z-10 py-8">
        <div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}
        >
          <div className="bg-gradient-to-br from-brand-900 to-brand-700 px-8 py-7 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 border border-white/25 rounded-2xl mb-4 text-3xl">
              ⚽
            </div>
            <h1 className="text-white text-xl font-extrabold tracking-tight mb-1">
              FutbolReservas
            </h1>
            <p className="text-white/60 text-xs font-medium">
              Sistema de Reservas de Canchas
            </p>
          </div>

          <div className="px-6 sm:px-7 py-7">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
              {(["login", "registro"] as Tab[]).map((t) => (
                <button
                  key={t}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-[13.5px] font-semibold transition-all duration-200 border-none cursor-pointer font-[inherit]
                    ${tab === t ? "bg-white text-brand-700 shadow-sm" : "bg-transparent text-slate-400 hover:text-slate-700"}`}
                  onClick={() => {
                    setTab(t);
                    setLoginErr(L0);
                    setRegErr(R0);
                  }}
                >
                  {t === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                </button>
              ))}
            </div>

            {tab === "login" && (
              <form
                className="flex flex-col gap-1"
                onSubmit={handleLogin}
                noValidate
              >
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className={inputCls(loginErr.email)}
                    placeholder="tu@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLF("email", e.target.value)}
                  />
                  <FieldError msg={loginErr.email} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className={inputCls(loginErr.password)}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLF("password", e.target.value)}
                  />
                  <FieldError msg={loginErr.password} />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-large mt-3"
                  disabled={cargando}
                >
                  {cargando ? (
                    "Iniciando sesión…"
                  ) : (
                    <>
                      {" "}
                      Iniciar Sesión <ArrowRightIcon size={16} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="text-center text-brand-600 text-[13px] font-medium mt-3 hover:text-brand-800 transition-colors bg-transparent border-none cursor-pointer font-[inherit]"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </form>
            )}

            {tab === "registro" && (
              <form
                className="flex flex-col gap-1"
                onSubmit={handleRegistro}
                noValidate
              >
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Nombre</label>
                    <input
                      type="text"
                      className={inputCls(regErr.nombre)}
                      value={regForm.nombre}
                      onChange={(e) => setRF("nombre", e.target.value)}
                    />
                    <FieldError msg={regErr.nombre} />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Apellido</label>
                    <input
                      type="text"
                      className={inputCls(regErr.apellido)}
                      value={regForm.apellido}
                      onChange={(e) => setRF("apellido", e.target.value)}
                    />
                    <FieldError msg={regErr.apellido} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label required">Email</label>
                  <input
                    type="email"
                    className={inputCls(regErr.email)}
                    placeholder="tu@email.com"
                    value={regForm.email}
                    onChange={(e) => setRF("email", e.target.value)}
                  />
                  <FieldError msg={regErr.email} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Teléfono</label>
                  <input
                    type="tel"
                    className={inputCls(regErr.telefono)}
                    placeholder="1123456789"
                    value={regForm.telefono}
                    onChange={(e) => setRF("telefono", e.target.value)}
                  />
                  <FieldError msg={regErr.telefono} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Contraseña</label>
                  <input
                    type="password"
                    className={inputCls(regErr.password)}
                    placeholder="Mínimo 6 caracteres"
                    value={regForm.password}
                    onChange={(e) => setRF("password", e.target.value)}
                  />
                  <FieldError msg={regErr.password} />
                </div>
                <div className="form-group">
                  <label className="form-label required">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    className={inputCls(regErr.passwordConfirm)}
                    placeholder="Repetí tu contraseña"
                    value={regForm.passwordConfirm}
                    onChange={(e) => setRF("passwordConfirm", e.target.value)}
                  />
                  <FieldError msg={regErr.passwordConfirm} />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-large mt-3"
                  disabled={cargando}
                >
                  {cargando ? (
                    "Creando cuenta…"
                  ) : (
                    <>
                      {" "}
                      Crear Cuenta <ArrowRightIcon size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="flex items-center justify-center gap-2 mt-5 text-slate-400 text-[12px]">
              <ShieldIcon size={12} className="text-brand-400" /> Tus datos
              están protegidos y seguros
            </div>
            <div className="text-center mt-4 pt-4 border-t border-slate-100">
              <Link
                to="/"
                className="text-slate-400 hover:text-brand-600 text-[13px] transition-colors"
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
