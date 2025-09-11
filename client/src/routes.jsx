import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Panel from './pages/Panel';
import RequireAuth from './components/RequireAuth';
import AdminUsers from './pages/AdminUsers';
import RequirePermission from './components/RequirePermission';

export default function RoutesDef() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/o-nas" element={<About />} />
      <Route path="/kontakt" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/panel" element={<RequireAuth><Panel /></RequireAuth>} />
      <Route path="*" element={<h2>404</h2>} />
      <Route
         path="/admin"
        element={
                <RequireAuth>
                <RequirePermission perm="users:manage">
                <AdminUsers />
                </RequirePermission>
                </RequireAuth>
                }
      />
    </Routes>
  );
}