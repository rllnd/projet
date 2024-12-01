import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Chip } from '@mui/material';
import { AssignmentTurnedIn as AssignmentTurnedInIcon } from '@mui/icons-material';
import axios from 'axios';

const EncheresGagnees = () => {
  const [encheres, setEncheres] = useState([]);

  useEffect(() => {
    const fetchEncheresGagnees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auctions/won');
        setEncheres(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des enchères gagnées', error);
      }
    };
    fetchEncheresGagnees();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#2A9D8F', fontWeight: 'bold' }}>
        Enchères Gagnées
      </Typography>
      <List>
        {encheres.map((enchere) => (
          <React.Fragment key={enchere.id}>
            <ListItem sx={{ backgroundColor: '#eafaf1', borderRadius: '8px', mb: 2 }}>
              <AssignmentTurnedInIcon sx={{ color: '#264653', mr: 2 }} />
              <ListItemText
                primary={enchere.name}
                secondary={`Montant gagné : ${enchere.finalPrice} $ - Date de fin : ${new Date(enchere.endDate).toLocaleDateString()}`}
              />
              <ListItemSecondaryAction>
                <Chip label="Gagné" color="success" />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default EncheresGagnees;
