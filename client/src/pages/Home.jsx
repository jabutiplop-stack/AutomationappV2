import { Link } from 'react-router-dom';
export default function Home() {
  return (
    <section style={{textAlign:'center',marginTop:40}}>
      <h1>Witamy w AutomationApp</h1>
      <p>Nowy landing.</p>
      <Link to="/o-nas">O nas →</Link>
    </section>
  );
}