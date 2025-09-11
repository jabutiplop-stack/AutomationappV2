import { useEffect, useState } from 'react';
export default function Panel(){
  const [data,setData]=useState(null);
  useEffect(()=>{ fetch('/api/panel/data',{credentials:'include'}).then(r=>r.json()).then(setData).catch(()=>setData({error:'Błąd'})); },[]);
  return <section><h2>Panel</h2><pre>{JSON.stringify(data,null,2)}</pre></section>;
}