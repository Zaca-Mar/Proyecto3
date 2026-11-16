import { useState } from 'react';
import { mensajeDeError } from '../api/cliente';
import { useAuth } from '../auth';
import { loginSchema, registroSchema } from '../esquemas/auth.schema';

type Modo = 'login' | 'registro';
type Perfil = 'alumno' | 'entrenador';

export default function Login() {
  const { ingresar, registrar } = useAuth();
  const [perfil, setPerfil] = useState<Perfil>('alumno');
  const [modo, setModo] = useState<Modo>('login');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [repetir, setRepetir] = useState('');

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo);
    setError('');
  }

  // El personal (entrenadores y administradores) no se registra solo: sus cuentas las crea el admin.
  function cambiarPerfil(nuevo: Perfil) {
    setPerfil(nuevo);
    setModo('login');
    setError('');
  }

  async function enviar() {
    if (enviando) return;
    setError('');

    let acceso: { email: string; password: string } | null = null;
    let alta: {
      nombre: string;
      apellido: string;
      email: string;
      dni: string;
      telefono: string;
      password: string;
    } | null = null;

    if (modo === 'login') {
      const validado = loginSchema.safeParse({ email, password });
      if (!validado.success) return setError(validado.error.issues[0].message);
      acceso = validado.data;
    } else {
      const validado = registroSchema.safeParse({
        nombre,
        apellido,
        dni,
        telefono,
        email,
        password,
        repetir,
      });
      if (!validado.success) return setError(validado.error.issues[0].message);
      const datos = validado.data;
      alta = {
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        dni: datos.dni,
        telefono: datos.telefono,
        password: datos.password,
      };
    }

    setEnviando(true);
    try {
      if (acceso) {
        await ingresar(acceso.email, acceso.password);
      } else if (alta) {
        await registrar(alta);
      }
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login">
      <section className="login-marca">
        <div className="marca">⌁ FitTracker</div>
        <p className="hero">
          Tu plan.
          <br />
          <span className="lima">Tu próximo logro.</span>
        </p>
        <ul className="login-puntos">
          <li>Entrenadores: armá planes y seguí a cada alumno desde un solo panel.</li>
          <li>Alumnos: registrá tus series en segundos, desde el celular.</li>
          <li>Cargas que se ajustan según tu esfuerzo y tu progreso.</li>
        </ul>
      </section>

      <section className="login-form">
        <h2 className="login-saludo">{modo === 'login' ? 'Qué bueno verte' : 'Creá tu cuenta'}</h2>
        <p className="login-sub">
          {modo === 'login'
            ? 'Ingresá y seguí donde dejaste.'
            : 'Registrate y empezá a seguir tu progreso.'}
        </p>

        {modo === 'login' && (
          <div className="segmentado">
            <button className={perfil === 'alumno' ? 'on' : ''} onClick={() => cambiarPerfil('alumno')} type="button">
              Alumno
            </button>
            <button className={perfil === 'entrenador' ? 'on' : ''} onClick={() => cambiarPerfil('entrenador')} type="button">
              Entrenador
            </button>
          </div>
        )}

        {modo === 'registro' && (
          <>
            <div className="par">
              <label>
                Nombre
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Lucas" autoComplete="given-name" />
              </label>
              <label>
                Apellido
                <input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Fernández" autoComplete="family-name" />
              </label>
            </div>
            <div className="par">
              <label>
                DNI
                <input value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="40111222" />
              </label>
              <label>
                Teléfono
                <input value={telefono} onChange={(e) => setTelefono(e.target.value)} inputMode="tel" placeholder="3535000000" autoComplete="tel" />
              </label>
            </div>
          </>
        )}

        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="username"
            inputMode="email"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            placeholder={modo === 'registro' ? 'Al menos 4 caracteres' : '••••'}
          />
        </label>
        {modo === 'registro' && (
          <label>
            Repetir contraseña
            <input
              type="password"
              value={repetir}
              onChange={(e) => setRepetir(e.target.value)}
              autoComplete="new-password"
            />
          </label>
        )}

        {error && <div className="aviso">⚑ {error}</div>}

        <button className="btn" onClick={enviar} disabled={enviando}>
          {enviando ? 'Un momento…' : modo === 'login' ? 'Ingresar' : 'Crear mi cuenta'}
        </button>

        {perfil === 'alumno' ? (
          <button
            className="login-enlace"
            onClick={() => cambiarModo(modo === 'login' ? 'registro' : 'login')}
            type="button"
          >
            {modo === 'login' ? (
              <>
                ¿No tenés cuenta? <b>Registrate</b>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta? <b>Ingresá</b>
              </>
            )}
          </button>
        ) : (
          <p className="mu centro">
            Acceso para el personal del gimnasio. Tu cuenta la crea el administrador.
          </p>
        )}
      </section>
    </main>
  );
}