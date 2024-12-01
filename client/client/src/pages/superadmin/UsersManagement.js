import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Table, TableBody, TableCell, TableHead,
  TableRow, Tabs, Tab, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Chip, Snackbar, Alert
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { teal, green, red, grey, blue } from '@mui/material/colors';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/superadmin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setFilteredUsers(response.data); // Initial filtered users
    } catch (error) {
      showNotification('Erreur lors de la récupération des utilisateurs', 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFilteredUsers(
      newValue === 'all'
        ? users
        : users.filter(user => (newValue === 'approved' ? user.isApproved : !user.isApproved))
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
      showNotification('Code d\'activation renvoyé avec succès.', 'success');
    } catch (error) {
      showNotification('Erreur lors du renvoi du code d\'activation', 'error');
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ color: teal[700], fontWeight: 'bold' }}>
        Gestion des Utilisateurs
      </Typography>

      <TextField
        label="Rechercher par nom ou email"
        onChange={handleSearch}
        fullWidth
        margin="normal"
        sx={{ mb: 3 }}
      />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        TabIndicatorProps={{ style: { backgroundColor: teal[700] } }}
        textColor="inherit"
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            color: teal[700],
            fontWeight: 'bold',
            '&.Mui-selected': { color: teal[700] },
          },
        }}
      >
        <Tab label="Tous les utilisateurs" value="all" />
        <Tab label="Approuvés" value="approved" />
        <Tab label="En attente" value="pending" />
      </Tabs>

      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: teal[100] }}>
            <TableCell><strong>Utilisateur</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Date d'Inscription</strong></TableCell>
            <TableCell><strong>Statut</strong></TableCell>
            <TableCell><strong>Activation</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id} sx={{ backgroundColor: user.isApproved ? green[50] : grey[50] }}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Chip
                  label={user.isApproved ? 'Approuvé' : 'En attente'}
                  color={user.isApproved ? 'success' : 'warning'}
                  sx={{ fontWeight: 'bold' }}
                />
              </TableCell>
              <TableCell>
                {user.isApproved ? (
                  <Chip label="Activé" color="success" />
                ) : (
                  <Chip label="Non activé" color="warning" />
                )}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleViewDetails(user)} color="primary">
                  <VisibilityIcon />
                </IconButton>
                {!user.isApproved && (
                  <IconButton onClick={() => resendActivationCode(user.email)} color="secondary">
                    <RefreshIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: blue[50], color: teal[700], fontWeight: 'bold' }}>
          Détails de l'utilisateur
          <IconButton onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: grey[100], padding: 3 }}>
          {selectedUser && (
            <Box>
              <Typography variant="h6" color="grey"><strong>Nom:</strong> {selectedUser.name}</Typography>
              <Typography variant="h6" color="grey"><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography variant="h6" color="grey"><strong>Téléphone:</strong> {selectedUser.phone}</Typography>
              <Typography variant="h6" color="grey"><strong>Solde de compte:</strong> {selectedUser.tokenBalance} GTC</Typography>
              <Typography variant="h6" color="grey"><strong>Date d'Inscription:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</Typography>
              <Typography variant="h6" color="grey"><strong>Statut:</strong> 
                <Chip
                  label={selectedUser.isApproved ? 'Approuvé' : 'En attente'}
                  color={selectedUser.isApproved ? 'success' : 'warning'}
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: grey[200] }}>
          <Button onClick={handleCloseDialog} color="default">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UsersManagement;
