import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function App () {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`${API_BASE}/posts`);
        if (!resp.ok) throw new Error('API error');
        const data = await resp.json();
        if (!ignore) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setError('No se pudo cargar la información.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...rows].sort((a,b) => a.name.localeCompare(b.name));
    return rows
      .filter(r => r.name.toLowerCase().includes(q))
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [rows, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white">
        <div className="container">
          <h1 className="text-2xl font-semibold">Posts por Usuario Prueba Tecnica Blue Medical</h1>
          <p className="opacity-90">Frontend en React + Tailwind consumiendo <code>/posts</code>.</p>
        </div>
      </header>

      <main className="container">
        <div className="card space-y-4">
          <input
            className="input"
            placeholder="Buscar por nombre…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Buscar"
          />

          {loading && <p>Cargando…</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Cantidad de Posts</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.postCount}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="2">Sin resultados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
