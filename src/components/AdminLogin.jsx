// src/components/AdminLogin.jsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Credenciales inválidas');
    } else {
      // Verifica si el usuario tiene rol de admin
      const { data: profile } = await supabase
        .from('profiles') // Asegúrate de tener esta tabla con campo "role"
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
        onLoginSuccess(data.user);
      } else {
        setError('No tienes permisos de administrador');
      }
    }
  };

  return (
    <div className="admin-login">
      <h2>Acceso Administrador</h2>
      <input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Ingresar</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
