import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Signup.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
    profilePicture: null,
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Gestion des changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Gestion de la photo de profil
  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      profilePicture: e.target.files[0],
    }));
  };

  // Fonction d'envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    // Préparer les données du formulaire
    const userData = new FormData();
    userData.append('name', formData.name);
    userData.append('email', formData.email);
    userData.append('password', formData.password);
    userData.append('phone', formData.phone);
    userData.append('role', formData.role);
    if (formData.profilePicture) {
      userData.append('profilePicture', formData.profilePicture);
    }
     
    console.log("Données envoyées :", Object.fromEntries(userData.entries()));

    try {
      // Envoyer les données au backend
      const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Si l'inscription est réussie, rediriger vers la page d'activation
      setSuccessMessage("Inscription réussie. Redirection vers la page d'activation...");
      setErrorMessage('');
      
      // Rediriger vers la page d'activation
      setTimeout(() => {
        navigate(`/activate-account?userId=${response.data.userId}`);
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Erreur lors de l'inscription.");
      setSuccessMessage('');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Inscription</h2>
        <form className="Signup" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nom"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Numéro de téléphone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="buyer">Acheteur</option>
            <option value="seller">Vendeur</option>
          </select>
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer mot de passe"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <input
            type="file"
            name="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
          />

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <button type="submit">S'inscrire</button>
        </form>
        <p className="ins">
          Déjà inscrit ?{' '}
          <button onClick={handleLoginRedirect} className="toggle-button">
            Connectez-vous
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
