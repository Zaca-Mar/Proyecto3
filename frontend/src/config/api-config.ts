const apiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');

if (!apiUrl) {
  throw new Error('Falta configurar VITE_API_URL para este entorno');
}

const apiConfig = { apiUrl };

export default apiConfig;
