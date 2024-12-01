// src/routes/AdminProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const AdminProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        
        // Vérifie si l'utilisateur a le rôle de "superadmin"
        if (decodedToken.role === 'superadmin') {
          setIsAuthorized(true);
         

        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Erreur lors du décodage du token :', error);
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(false);
    }
  }, []);

  // Attendez que l'état `isAuthorized` soit défini avant de rendre l'interface
  if (isAuthorized === null) {
    return null; // Affichez un loader ici si nécessaire pendant la vérification
  }

  // Si non autorisé, redirige vers la page de connexion Super Admin
  if (!isAuthorized) {
    return <Navigate to="/superadmin-login" />;
  }

  // Si autorisé, affiche le contenu des enfants
  return children;
};

export default AdminProtectedRoute;
