import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Pour envoyer des requêtes HTTP
import '../styles/Profile.css'; // Fichier CSS pour le style personnalisé

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    joinedOn: '',
    profilePicture: '', // Ajoutez ce champ pour la photo de profil
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState(userData);
  const [selectedImage, setSelectedImage] = useState(null); // Nouvelle image sélectionnée

  // Récupérer les données de l'utilisateur depuis le backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log('Token:', token); // Pour vérifier si le token est bien récupéré
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        setUpdatedData(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err); // Log de l'erreur
        setError('Erreur lors de la récupération des données utilisateur');
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);
  

  // Gère le changement d'image de profil
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file); // Sauvegarde l'image localement
      setUpdatedData({
        ...updatedData,
        profilePicture: URL.createObjectURL(file), // Aperçu avant upload
      });
    }
  };

  const handleInputChange = (e) => {
    setUpdatedData({
      ...updatedData,
      [e.target.name]: e.target.value,
    });
  };

  // Enregistrer les changements du profil
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('name', updatedData.name);
      formData.append('phone', updatedData.phone);
      formData.append('email', updatedData.email);
      if (selectedImage) {
        formData.append('profilePicture', selectedImage); // Transmettez l'image ici
      }
  
      await axios.put('http://localhost:5000/api/user/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUserData(updatedData);
      setEditMode(false);
      setSelectedImage(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    }
  };
  
  
  const handleCancelEdit = () => {
    setUpdatedData(userData); // Réinitialise les changements
    setSelectedImage(null); // Réinitialise l'image sélectionnée
    setEditMode(false); // Quitte le mode édition
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          {/* Image du profil */}
          <img
              className="profile-picture"
              src={updatedData.profilePicture ? `http://localhost:5000/${updatedData.profilePicture}` : '/default-avatar.png'}
              alt="Profile"
            />

          {editMode && (
            <div className="upload-photo">
              <label htmlFor="profilePictureUpload" className="upload-button">
                Changer la photo de profil
              </label>
              <input
                type="file"
                id="profilePictureUpload"
                style={{ display: 'none' }}
                onChange={handleImageChange}
                accept="image/*" // Accepte uniquement les images
              />
            </div>
          )}
          <div className="profile-info">
            <h2>{userData.name}</h2>
            <a href={`mailto:${userData.email}`}>{userData.email}</a>
            <p>{userData.role}</p>
          </div>
        </div>

        {/* Formulaire pour éditer les informations du profil */}
        <div className="profile-form">
          <form>
            <div className="form-container">
              <div className="form-group">
                <label>Nom d'utilisateur</label>
                <input
                  className="nom"
                  type="text"
                  name="name"
                  value={updatedData.name}
                  onChange={handleInputChange}
                  readOnly={!editMode}
                />
              </div>
              <div className="form-group">
                <label className="nom">Téléphone</label>
                <input
                  className="nom1"
                  type="text"
                  name="phone"
                  value={updatedData.phone}
                  onChange={handleInputChange}
                  readOnly={!editMode}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  className="email"
                  type="email"
                  name="email"
                  value={updatedData.email}
                  onChange={handleInputChange}
                  readOnly={!editMode}
                />
              </div>
             <div className="form-group">
                <label>Rôle</label>
                <input
                  className="nom3"
                  type="text"
                  name="role"
                  value={updatedData.role}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Date d'inscription</label>
                <input
                  className="nom4"
                  type="text"
                  name="joinedOn"
                  value={updatedData.joinedOn}
                  readOnly
                />
              </div>
            </div>

            {/* Boutons Modifier/Enregistrer/Annuler */}
            <div className="form-buttons">
              {!editMode ? (
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => setEditMode(true)}
                >
                  Modifier
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="save-button"
                    onClick={handleSaveChanges}
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancelEdit}
                  >
                    Annuler
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
