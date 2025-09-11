import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RoutesDef from './routes';


export default function App(){
return (
<div className="app">
<Navbar />
<main style={{minHeight:'70vh', padding:24}}>
<RoutesDef />
</main>
<Footer />
</div>
);
}