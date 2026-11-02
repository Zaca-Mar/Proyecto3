import { useAuth } from './auth';
import Login from './paginas/Login';
import AlumnoApp from './paginas/alumno/AlumnoApp';
import EntrenadorApp from './paginas/entrenador/EntrenadorApp';
import AdminApp from './paginas/admin/AdminApp';

export default function App() {
  const { usuario } = useAuth();
  if (!usuario) return <Login />;
  if (usuario.rol === 'alumno') return <AlumnoApp />;
  if (usuario.rol === 'entrenador') return <EntrenadorApp />;
  return <AdminApp />;
}
