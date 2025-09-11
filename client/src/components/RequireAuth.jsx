import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => setOk(r.ok))
      .catch(() => setOk(false));
  }, []);
  if (ok === null) return <p>Sprawdzanie…</p>;
  if (!ok) return <Navigate to="/login" replace />;
  return children;
}