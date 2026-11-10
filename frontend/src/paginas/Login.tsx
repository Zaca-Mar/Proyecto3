import { useState } from 'react';
import { mensajeDeError } from '../api';
import { useAuth } from '../auth';

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

    if (!email.trim() || !password) {
      return setError('Completá el email y la contraseña.');
    }

    if (modo === 'registro') {
      if (!nombre.trim() || !apellido.trim() || !dni.trim() || !telefono.trim()) {
        return setError('Completá todos los datos personales obligatorios.');
      }
      if (!/^\d{7,9}$/.test(dni.trim())) {
        return setError('El DNI debe tener entre 7 y 9 números.');
      }
      if (password !== repetir) {
        return setError('Las contraseñas no coinciden.');
      }
    }

    setEnviando(true);
    try {
      if (modo === 'login') {
        await ingresar(email.trim(), password);
      } else {
        await registrar({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          dni: dni.trim(),
          telefono: telefono.trim(),
          password,
        });
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
