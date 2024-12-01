import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  Badge,
} from '@mui/material';
import { teal, grey, red, amber } from '@mui/material/colors';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { format } from 'date-fns';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);

      // Marquer toutes les notifications comme lues
      await axios.put(
        'http://localhost:5000/api/notifications/mark-as-read',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications :', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour déterminer l'icône et la couleur en fonction du type de notification
  const getNotificationDetails = (message) => {
    if (message.includes('succès') || message.includes('confirmé')) {
      return { icon: <CheckCircleOutlineIcon />, color: teal[500] };
    }
    if (message.includes('erreur') || message.includes('échoué')) {
      return { icon: <ErrorOutlineIcon />, color: red[500] };
    }
    if (message.includes('alerte') || message.includes('important')) {
      return { icon: <NotificationsActiveIcon />, color: amber[500] };
    }
    return { icon: <InfoOutlinedIcon />, color: grey[500] };
  };

  return (
    <Paper sx={{ maxWidth: '800px', margin: 'auto', padding: '2rem', backgroundColor: grey[100] }}>
      <Typography variant="h5" align="center" gutterBottom color={teal[700]}>
        Notifications
      </Typography>
      {loading ? (
        <CircularProgress color="primary" style={{ display: 'block', margin: 'auto' }} />
      ) : notifications.length === 0 ? (
        <Typography color="textSecondary" align="center">
          Aucune notification disponible.
        </Typography>
      ) : (
        <List>
          {notifications.map((notification) => {
            const { icon, color } = getNotificationDetails(notification.message);

            return (
              <ListItem
                key={notification.id}
                sx={{
                  borderBottom: `1px solid ${grey[300]}`,
                  '&:hover': { backgroundColor: grey[200] },
                  padding: '1rem',
                }}
              >
                <ListItemAvatar>
                  <Badge
                    color="secondary"
                    variant="dot"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <Avatar sx={{ backgroundColor: color }}>{icon}</Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: grey[900] }}>
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Paper>
  );
};

export default NotificationsList;
