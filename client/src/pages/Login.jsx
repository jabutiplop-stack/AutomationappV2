import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function submit(e){
    e.preventDefault(); setError(null);
    try{
      const res = await fetch('/api/auth/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||'Błąd logowania');
      navigate('/app');
    }catch(err){ setError(err.message); }
  }

  return (
    <section style={{ display:'grid', placeItems:'center', minHeight:'60vh' }}>
      <form onSubmit={submit} style={{ display:'grid', gap:12, width:360, maxWidth:'90vw', border:'1px solid #eee', borderRadius:12, padding:24 }}>
        <h2 style={{ textAlign:'center' }}>Panel Klienta</h2>
        <input placeholder="Nazwa użytkownika" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input type="password" placeholder="Hasło" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">Zaloguj</button>
        {error && <small style={{ color:'crimson' }}>{error}</small>}
      </form>
    </section>
  );
}