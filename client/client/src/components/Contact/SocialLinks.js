// components/SocialLinks.js
import React from 'react';
import { Typography, Card, List, ListItem, ListItemIcon } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const SocialLinks = () => (
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
      Suivez-nous
    </Typography>
    <List>
      <ListItem>
        <ListItemIcon>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FacebookIcon fontSize="large" style={{ margin: '0 10px', color: 'white' }} />
          </a>
        </ListItemIcon>
        <Typography style={{ color: 'white' }}>Facebook</Typography>
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <TwitterIcon fontSize="large" style={{ margin: '0 10px', color: 'white' }} />
          </a>
        </ListItemIcon>
        <Typography style={{ color: 'white' }}>Twitter</Typography>
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <InstagramIcon fontSize="large" style={{ margin: '0 10px', color: 'white' }} />
          </a>
        </ListItemIcon>
        <Typography style={{ color: 'white' }}>Instagram</Typography>
      </ListItem>
    </List>
  </Card>
);

export default SocialLinks;