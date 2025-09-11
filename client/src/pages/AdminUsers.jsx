import { useEffect, useMemo, useState } from 'react';

function Checkbox({label, checked, onChange}) {
  return (
    <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

// ✅ Oddzielny komponent wiersza – tu możemy używać useState
function UserRow({ user, permKeys, onSave, onDelete }) {
  const [localPerms, setLocalPerms] = useState(user.permissions || []);
  const toggle = (arr, key) => arr.includes(key) ? arr.filter(k=>k!==key) : [...arr, key];

  return (
    <tr>
      <td style={{padding:8}}>{user.id}</td>
      <td style={{padding:8}}>{user.username}</td>
      <td style={{padding:8}}>
        <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
          {permKeys.map(k=>(
            <Checkbox key={k}
              label={k}
              checked={localPerms.includes(k)}
              onChange={()=> setLocalPerms(toggle(localPerms, k))}
            />
          ))}
        </div>
      </td>
      <td style={{padding:8, whiteSpace:'nowrap'}}>
        <button onClick={()=>onSave(user.id, localPerms)} style={{marginRight:8}}>Zapisz</button>
        <button onClick={()=>onDelete(user.id)} style={{background:'#c33', color:'#fff'}}>Usuń</button>
      </td>
    </tr>
  );
}

export default function AdminUsers(){
  const [users, setUsers] = useState([]);
  const [perms, setPerms] = useState([]);
  const [csrf, setCsrf]   = useState(null);
  const [newUser, setNewUser] = useState({ username:'', email:'', password:'', permissions:[] });

  useEffect(()=> {
    // CSRF token
    fetch('/api/csrf', { credentials: 'include' })
      .then(r=>r.json()).then(t=>setCsrf(t.csrfToken)).catch(()=>{});
    // lista uprawnień i userów
    Promise.all([
      fetch('/api/admin/permissions', { credentials:'include' }).then(r=>r.json()),
      fetch('/api/admin/users', { credentials:'include' }).then(r=>r.json())
    ]).then(([permlist, users]) => {
      setPerms(permlist);
      setUsers(users);
    }).catch(()=>{});
  }, []);

  const PERM_KEYS = useMemo(()=> perms.map(p=>p.key), [perms]);
  const toggle = (arr, key) => arr.includes(key) ? arr.filter(k=>k!==key) : [...arr, key];

  async function refresh(){
    const fresh = await fetch('/api/admin/users', { credentials:'include' }).then(r=>r.json());
    setUsers(fresh);
  }

  async function addUser(e){
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        ...(csrf ? {'csrf-token': csrf} : {})
      },
      credentials:'include',
      body: JSON.stringify(newUser)
    });
    const data = await res.json();
    if(!res.ok){ alert(data.error||'Błąd'); return; }
    setNewUser({ username:'', password:'', permissions:[] });
    refresh();
  }

  async function savePerms(userId, permissions){
    const res = await fetch(`/api/admin/users/${userId}/permissions`, {
      method:'PUT',
      headers:{
        'Content-Type':'application/json',
        ...(csrf ? {'csrf-token': csrf} : {})
      },
      credentials:'include',
      body: JSON.stringify({ permissions })
    });
    if(!res.ok){ const d=await res.json(); alert(d.error||'Błąd'); }
  }

  async function removeUser(userId){
    if(!confirm('Na pewno usunąć użytkownika?')) return;
    const res = await fetch(`/api/admin/users/${userId}`, {
      method:'DELETE',
      headers:{ ...(csrf ? {'csrf-token': csrf} : {}) },
      credentials:'include'
    });
    if(!res.ok){ const d=await res.json(); alert(d.error||'Błąd'); return; }
    setUsers(users.filter(u=>u.id!==userId));
  }

  return (
    <div style={{maxWidth:1100, margin:'0 auto'}}>
      <h2>Użytkownicy</h2>

      <section style={{border:'1px solid #222', padding:16, borderRadius:12, marginBottom:24}}>
        <h3>Dodaj nowego użytkownika</h3>
        <form onSubmit={addUser} style={{display:'grid', gap:10}}>
        <input placeholder="Nazwa użytkownika"
                  value={newUser.username}
                  onChange={e=>setNewUser({...newUser, username:e.target.value})}
                  required />
          <input type="password" placeholder="Hasło"
                 value={newUser.password}
                 onChange={e=>setNewUser({...newUser, password:e.target.value})}
                 required />
          <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
            {PERM_KEYS.map(k=>(
              <Checkbox key={k}
                label={k}
                checked={newUser.permissions.includes(k)}
                onChange={()=> setNewUser({...newUser, permissions: toggle(newUser.permissions, k)})}
              />
            ))}
          </div>
          <button>Dodaj użytkownika</button>
        </form>
      </section>

      <section style={{border:'1px solid #222', padding:16, borderRadius:12}}>
        <h3>Lista użytkowników</h3>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr><th align="left">ID</th><th align="left">Login</th><th align="left">Uprawnienia</th><th>Akcje</th></tr>
          </thead>
          <tbody>
          {users.map(u=>(
            <UserRow key={u.id} user={u} permKeys={PERM_KEYS}
                     onSave={savePerms} onDelete={removeUser} />
          ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}