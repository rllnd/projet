import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { message, Modal, Button, Tabs as AntTabs } from 'antd';
import { teal, green, grey } from '@mui/material/colors';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/superadmin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      message.error('Erreur lors de la récupération des utilisateurs');
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setFilteredUsers(
      key === 'all'
        ? users
        : users.filter((user) => (key === 'approved' ? user.isApproved : !user.isApproved))
    );
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          (user.name.toLowerCase().includes(searchValue) || user.email.toLowerCase().includes(searchValue)) &&
          (activeTab === 'all' || (activeTab === 'approved' ? user.isApproved : !user.isApproved))
      )
    );
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const resendActivationCode = async (email) => {
    try {
      await axios.post('http://localhost:5000/api/user/resend-activation-code', { email });
      message.success('Code d\'activation renvoyé avec succès.');
    } catch (error) {
      message.error('Erreur lors du renvoi du code d\'activation');
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?");
    if (!confirmation) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/superadmin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Utilisateur supprimé avec succès.');
      fetchUsers(); // Recharger la liste des utilisateurs
    } catch (error) {
      message.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom sx={{ color: teal[700], fontWeight: 'bold' }}>
        Gestion des utilisateurs
      </Typography>

      <TextField
        label="Rechercher par nom ou email"
        onChange={handleSearch}
        fullWidth
        margin="normal"
        sx={{ mb: 3 }}
      />

      <AntTabs
        activeKey={activeTab}
        onChange={handleTabChange}
        tabBarStyle={{ backgroundColor: teal[100] }}
      >
        <AntTabs.TabPane tab="Tous les utilisateurs" key="all" />
        <AntTabs.TabPane tab="Approuvés" key="approved" />
        <AntTabs.TabPane tab="En attente" key="pending" />
      </AntTabs>

      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: teal[100] }}>
            {!isSmallScreen && <TableCell><strong>Utilisateur</strong></TableCell>}
            <TableCell><strong>Email</strong></TableCell>
            {!isSmallScreen && <TableCell><strong>Date d'Inscription</strong></TableCell>}
            {!isSmallScreen && <TableCell><strong>Statut</strong></TableCell>}
            {!isSmallScreen && <TableCell><strong>Activation</strong></TableCell>}
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id} sx={{ backgroundColor: user.isApproved ? green[50] : grey[50] }}>
              {!isSmallScreen && <TableCell>{user.name}</TableCell>}
              <TableCell>{user.email}</TableCell>
              {!isSmallScreen && <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>}
              {!isSmallScreen && (
                <TableCell>
                  <Chip
                    label={user.isApproved ? 'Approuvé' : 'En attente'}
                    color={user.isApproved ? 'success' : 'warning'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
              )}
              {!isSmallScreen && (
                <TableCell>
                  {user.isApproved ? (
                    <Chip label="Activé" color="success" />
                  ) : (
                    <Chip label="Non activé" color="warning" />
                  )}
                </TableCell>
              )}
              <TableCell>
                <IconButton onClick={() => handleViewDetails(user)} color="primary">
                  <VisibilityIcon />
                </IconButton>
                {!user.isApproved && (
                  <IconButton onClick={() => resendActivationCode(user.email)} color="secondary">
                    <RefreshIcon />
                  </IconButton>
                )}
                <IconButton onClick={() => handleDeleteUser(user.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal for user details */}
      <Modal
        title="Détails de l'utilisateur"
        open={openDialog} // Utiliser 'open' au lieu de 'visible'
        onCancel={handleCloseDialog}
        footer={[
          <Button key="close" onClick={handleCloseDialog}>
            Fermer
          </Button>
        ]}
        bodyStyle={{ padding: '16px', backgroundColor: '#f4f6f9' }} // Couleur de fond
        style={{
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {selectedUser && (
          <Box>
            <Typography variant="h6" style={{ color: '#2A9D8F' }}><strong>Nom:</strong> {selectedUser.name}</Typography>
            <Typography variant="h6"><strong>Email:</strong> {selectedUser.email}</Typography>
            <Typography variant="h6"><strong>Téléphone:</strong> {selectedUser.phone}</Typography>
            <Typography variant="h6"><strong>Solde de compte:</strong> {selectedUser.tokenBalance} GTC</Typography>
            <Typography variant="h6"><strong>Date d'Inscription:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</Typography>
            <Typography variant="h6"><strong>Statut:</strong> 
              <Chip
                label={selectedUser.isApproved ? 'Approuvé' : 'En attente'}
                color={selectedUser.isApproved ? 'success' : 'warning'}
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography variant="h6"><strong>Activation:</strong> 
              <Chip
                label={selectedUser.isActivated ? 'Activé' : 'Non activé'}
                color={selectedUser.isActivated ? 'success' : 'warning'}
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography variant="h6"><strong>Rôle:</strong> {selectedUser.role}</Typography>
            <Typography variant="h6"><strong>Date de dernière connexion:</strong> {new Date(selectedUser.lastLogin).toLocaleDateString()}</Typography>
            <Typography variant="h6"><strong>Adresse:</strong> {selectedUser.address}</Typography>
            {/* Ajoutez d'autres champs selon les données disponibles */}
          </Box>
        )}
      </Modal>
    </Container>
  );
};

export default UsersManagement;