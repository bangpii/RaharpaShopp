// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import User from './pages/User';
// import Admin from './pages/Admin';
import ApiConnect from './services/ApiConnect';

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
        <Route path="/" element={<ApiConnect />} />
        <Route path="/api-test" element={<ApiConnect />} />
        {/* <Route path="/user" element={<User />} /> */}
        {/* <Route path="/admin" element={<Admin />} /> */}
      </Routes>
    </Router>
  );
}

export default App;