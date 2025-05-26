import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './login/PrivateRoute';
import AdminDashboard from './pags/adminPage';
import UserDashboard from './pags/otherPage';
import LoginPage from './login/loginPage';
import MasInforma from './pags/masInfo';
import ContactVista from './pags/contactos';

function App() {
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('https://pymex.azurewebsites.net/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), 
      });

      const data = await response.json();

      if (response.ok) {
        const { token, userInfo } = data.userData;
        localStorage.setItem('token', token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        if (userInfo.rol === 'admin') {
          window.location.href = '/admin';
        } else if (userInfo.rol === 'other') { 
          window.location.href = '/other';
        } else {
          alert("Rol desconocido. Asegure que sea admin u other");
          window.location.href = '/';
        }
      } else {
        
        const errorMessage = data.message || 'Error desconocido';
        alert('Error de login: ' + errorMessage);
        throw new Error(errorMessage); 
      }
    } catch (error) {
      console.error("Error", error);
     
      throw new Error("Error al conectar con servidor o credenciales inválidas.");
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage handleLogin={handleLogin} />} />
        <Route element={<PrivateRoute role="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route element={<PrivateRoute role="other" />}>
          <Route path="/other" element={<UserDashboard />} />
        </Route>
        <Route element={<PrivateRoute />}> 
          <Route path="/cont" element={<ContactVista />} />
          <Route path="/info" element={<MasInforma />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
