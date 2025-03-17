// components/PrivacyPolicy.js
import React from 'react';
import { Typography, Card } from '@mui/material';

const PrivacyPolicy = () => (
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
      Politique de Confidentialité
    </Typography>
    <Typography style={{ color: 'white' }}>
      Pour en savoir plus sur la gestion de vos données, veuillez consulter notre <a href="/privacy-policy" style={{ color: 'cyan' }}>Politique de Confidentialité</a>.
    </Typography>
  </Card>
);

export default PrivacyPolicy;