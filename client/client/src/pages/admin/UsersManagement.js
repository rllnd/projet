import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/AdminUsers.css'; // Fichier CSS pour styliser la page de gestion des utilisateurs

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  // Récupérer les utilisateurs au chargement du composant
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    };

    fetchUsers();
  }, []);

  // Fonction pour supprimer un utilisateur
  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Supprimer l'utilisateur de la liste affichée
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur', error);
      }
    }
  };

  // Fonction pour modifier un utilisateur (vous pouvez ajouter un formulaire plus tard)
  const handleEdit = (user) => {
    console.log('Modification de l\'utilisateur', user);
    // Ajouter ici la logique pour éditer un utilisateur, par exemple ouvrir un formulaire.
  };

  return (
    <div className="admin-users">
      <h2>Liste des utilisateurs inscrits</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Téléphone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.phone}</td>
              <td>
                <button onClick={() => handleEdit(user)}>Modifier</button>
                <button onClick={() => handleDelete(user.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
