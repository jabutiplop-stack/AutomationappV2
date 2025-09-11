import { useState } from 'react';
export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  async function submit(e){ e.preventDefault();
    await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    setForm({name:'',email:'',message:''});
  }
  return (
    <section>
      <h2>Kontakt</h2>
      <form onSubmit={submit} style={{display:'grid',gap:12,maxWidth:420}}>
        <input placeholder="Imię" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
        <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
        <textarea placeholder="Wiadomość" rows="5" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required/>
        <button>Wyślij</button>
      </form>
    </section>
  );
}