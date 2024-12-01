import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider,} from '@mui/material';
import axios from 'axios';
import HistoryIcon from '@mui/icons-material/History';
const HistoriqueEncheres = () => {
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const fetchHistoriqueEncheres = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auctions/history');
        setHistorique(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique des enchères', error);
      }
    };
    fetchHistoriqueEncheres();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#2A9D8F', fontWeight: 'bold' }}>
        Historique des Enchères
      </Typography>
      <List>
        {historique.map((enchere) => (
          <React.Fragment key={enchere.id}>
            <ListItem sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', mb: 2 }}>
              <HistoryIcon sx={{ color: '#264653', mr: 2 }} />
              <ListItemText
                primary={enchere.name}
                secondary={`Prix final : ${enchere.finalPrice} $ | Date de fin : ${new Date(enchere.endDate).toLocaleDateString()}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default HistoriqueEncheres;
