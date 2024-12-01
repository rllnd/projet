import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData) => {
    // Enregistrer les informations de l'utilisateur dans le state et localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Sauvegarder l'utilisateur dans localStorage
    localStorage.setItem('authToken', userData.token); // Sauvegarder le token JWT dans localStorage
  };

  const logout = () => {
    // Effacer l'utilisateur et le token du state et localStorage
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
