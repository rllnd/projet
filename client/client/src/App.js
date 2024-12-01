// client/src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Layout from './components/Layout/Layout';
import AppRoutes from './routes/Routes';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes /> 
      </Router>
    </AuthProvider> 

  
  );
};

export default App;
