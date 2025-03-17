// components/ContactInfo.js
import React from 'react';
import { Typography, Card, List, ListItem, ListItemIcon } from '@mui/material';
import { MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';

const ContactInfo = () => (
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
      Informations de Contact
    </Typography>
    <List>
      <ListItem>
        <ListItemIcon style={{ color: 'white' }}>
          <MailOutlined />
        </ListItemIcon>
        <Typography style={{ color: 'white' }}>
          <strong>E-mail :</strong> rllndddavid@gmail.com
        </Typography>
      </ListItem>
      <ListItem>
        <ListItemIcon style={{ color: 'white' }}>
          <PhoneOutlined />
        </ListItemIcon>
        <Typography style={{ color: 'white' }}>
          <strong>Téléphone :</strong> +33 59 314 73
        </Typography>
      </ListItem>
      <ListItem>
        <ListItemIcon style={{ color: 'white' }}>
          <HomeOutlined />
        </ListItemIcon>
        <Typography style={{ color: 'white' }}>
        <strong>Adresse :</strong> 101 Antsahavolakely , Antananarivo VI, Madagascar
        </Typography>
      </ListItem>
    </List>
  </Card>
);

export default ContactInfo;