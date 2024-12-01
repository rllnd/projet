import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationBadge = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/notifications/unread', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues :', error);
    }
  };

  return (
    <IconButton color="inherit" onClick={onClick}>
      <Badge badgeContent={unreadCount} color="secondary">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationBadge;
