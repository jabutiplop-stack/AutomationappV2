import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function RequirePermission({ perm, children }) {
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        const allowed = ok && Array.isArray(d.permissions) && d.permissions.includes(perm);
        setState({ loading: false, allowed });
      })
      .catch(() => setState({ loading: false, allowed: false }));
  }, [perm]);

  if (state.loading) return <p>Sprawdzanie uprawnień…</p>;
  if (!state.allowed) return <Navigate to="/" replace />;
  return children;
}