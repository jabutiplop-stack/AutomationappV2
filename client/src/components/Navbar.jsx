import { Link, NavLink, useNavigate } from 'react-router-dom';


export default function Navbar() {
    const navigate = useNavigate();
    return (
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 24px',borderBottom:'1px solid #eee'}}>
        <Link to="/" style={{fontWeight:800,textDecoration:'none'}}>AutomationApp</Link>
        <nav style={{display:'flex',gap:16}}>
          <NavLink to="/" end>Start</NavLink>
          <NavLink to="/o-nas">O nas</NavLink>
          <NavLink to="/kontakt">Kontakt</NavLink>
        </nav>
        <button onClick={()=>navigate('/login')}>Panel Klienta</button>
      </header>
    );
  }