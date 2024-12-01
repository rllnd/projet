import React, { useState } from 'react';  
import '../styles/Login.css';  
import { useNavigate } from 'react-router-dom';  
import axios from 'axios';  
import { useAuth } from '../contexts/AuthContext';  // Importation du contexte d'authentification

const Login = () => {  
  const [formData, setFormData] = useState({  
    email: '',  
    password: '',  
  });  
  
  const [errorMessage, setErrorMessage] = useState('');  
  const navigate = useNavigate();  
  const { login } = useAuth();  // Accès à la fonction login du contexte d'authentification

  const handleChange = (e) => {  
    const { name, value } = e.target;  
    setFormData((prevData) => ({  
      ...prevData,  
      [name]: value,  
    }));  
  };  

  const handleSubmit = async (e) => {  
    e.preventDefault();  

    if (formData.email && formData.password) {  
      try {
        // Envoyer une requête POST au backend pour se connecter
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        // Sauvegarder le token JWT et l'utilisateur connecté
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userId', response.data._id); 
        // Mettre à jour l'utilisateur global avec les informations récupérées
        login({ role: response.data.role, token: response.data.token, email: response.data.email });
        // Rediriger selon le rôle
        const role = response.data.role;

        if (role === 'buyer') {
          navigate('/buyer-dashboard');
        } else if (role === 'seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/');  // Redirection par défaut
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Erreur lors de la connexion.');
      }
    } else {  
      setErrorMessage('Veuillez remplir tous les champs.');  
    }  
  };  

  const handleSignupRedirect = () => {  
    navigate('/signup');  
  };  

  return (  
    <div className="login-container">  
      <div className="login-box">  
        <h2>Se connecter</h2>  
        <form onSubmit={handleSubmit}>  
          <input  
            type="email"  
            name="email"  
            placeholder="Email"  
            value={formData.email}  
            onChange={handleChange}  
            required  
          />  
          <input  
            type="password"  
            name="password"  
            placeholder="Password"  
            value={formData.password}  
            onChange={handleChange}  
            required  
          />  
          {errorMessage && <p className="error-message">{errorMessage}</p>}  
         <div className="login">
         <button className='login' type="submit">Connexion</button>
         </div>
           
        </form>  
        
        <p>  
          Pas encore inscrit ?{' '} 
          <div className='ins'>
          <button onClick={handleSignupRedirect}>  
            Inscrivez-vous  
          </button>  
          </div> 
        </p>  
      </div>  
    </div>  
  );  
};  

export default Login;
