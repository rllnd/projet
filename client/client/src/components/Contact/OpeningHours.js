// components/OpeningHours.js
import React from 'react';
import { Typography, Card, List, ListItem } from '@mui/material';

const OpeningHours = () => (
  <Card
    style={{
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginTop: '20px',
      backgroundColor: 'rgba(11, 37, 70, 0.733)', // Couleur de fond sombre
      color: 'white', // Couleur du texte blanche
    }}
  >
    <Typography variant="h5" gutterBottom align="center" style={{ color: 'white' }}>
      Heures d'Ouverture
    </Typography>
    <List>
      <ListItem>
        <Typography style={{ color: 'white' }}>Lundi - Vendredi : 9h00 - 18h00</Typography>
      </ListItem>
      <ListItem>
        <Typography style={{ color: 'white' }}>Samedi : 10h00 - 14h00</Typography>
      </ListItem>
      <ListItem>
        <Typography style={{ color: 'white' }}>Dimanche : Fermé</Typography>
      </ListItem>
    </List>
  </Card>
);

export default OpeningHours;