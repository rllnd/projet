import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext'; // Import du WebSocket Provider

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider> 
        <Router>
          <AppRoutes /> 
        </Router>
      </SocketProvider>
    </AuthProvider> 
  );
};

export default App;
