import { useState } from 'react';
import { mensajeDeError } from '../api/cliente';
import { useAuth } from '../auth';
import { loginSchema, registroSchema } from '../esquemas/auth.schema';

type Modo = 'login' | 'registro';

export default function Login() {
  const { ingresar, registrar } = useAuth();
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
    <main className="pantalla">
      <div className="marca">⌁ FitTracker</div>
      <p className="hero">
        Tu plan.
        <br />
        <span className="lima">Tu próxima marca.</span>
      </p>

      <div className="segmentado">
        <button className={modo === 'login' ? 'on' : ''} onClick={() => cambiarModo('login')}>
          Ingresar
        </button>
        <button className={modo === 'registro' ? 'on' : ''} onClick={() => cambiarModo('registro')}>
          Crear cuenta
        </button>
      </div>

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

      {modo === 'login' && import.meta.env.DEV ? (
        <div className="par">
          <button
            className="btn sec chico"
            onClick={() => {
              setEmail('lucas.fernandez@email.com');
              setPassword('1234');
            }}
          >
            Demo: alumno
          </button>
          <button
            className="btn sec chico"
            onClick={() => {
              setEmail('nicolas.romero@email.com');
              setPassword('1234');
            }}
          >
            Demo: entrenador
          </button>
        </div>
      ) : (
        <p className="mu centro">
          Al registrarte se crea tu usuario con rol de alumno. Después podés vincularte con un
          entrenador desde la app.
        </p>
      )}
    </main>
  );
}
