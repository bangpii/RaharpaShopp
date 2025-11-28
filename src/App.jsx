import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import User from './pages/User';
import Admin from './pages/Admin';

function App() {
  React.useEffect(() => {
    console.log('🚀 APP MOUNTED - Testing backend...');
    
    // Test backend connection
    fetch('https://serverraharpashopp-production-f317.up.railway.app/health')
      .then(r => r.json())
      .then(data => {
        console.log('✅ BACKEND CONNECTED!', data);
      })
      .catch(err => {
        console.error('❌ BACKEND FAILED:', err);
      });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<User />} />
        <Route path="/user" element={<User />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>  // <- HAPUS HURUF "g" YANG NYASAR!!
  );
}

export default App;