import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Snackbar, Alert, CircularProgress } from '@mui/material';
import { teal, grey } from '@mui/material/colors';
import RefreshIcon from '@mui/icons-material/Refresh';


const ActivateAccount = () => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = new URLSearchParams(location.search).get('userId');

  const handleActivation = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/activate-account', {
        userId,
        code,
      });
      setNotification({ open: true, message: response.data.message, severity: 'success' });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setNotification({ open: true, message: "Code d'activation invalide ou expiré.", severity: 'error' });
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await axios.post('http://localhost:5000/api/user/resend-activation-code', { userId });
      setNotification({ open: true, message: 'Code d\'activation renvoyé avec succès.', severity: 'info' });
    } catch (error) {
      setNotification({ open: true, message: 'Erreur lors du renvoi du code d\'activation.', severity: 'error' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          textAlign: 'center',
          backgroundColor: grey[50],
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: teal[700], fontWeight: 'bold' }}>
          Activer votre compte
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: grey[600] }}>
          Entrez le code d'activation que nous avons envoyé à votre adresse email.
        </Typography>
        <TextField
          label="Code d'activation"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: teal[200],
              },
              '&:hover fieldset': {
                borderColor: teal[500],
              },
              '&.Mui-focused fieldset': {
                borderColor: teal[700],
              },
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleActivation}
          fullWidth
          sx={{
            mt: 2,
            py: 1,
            backgroundColor: teal[600],
            '&:hover': {
              backgroundColor: teal[800],
            },
          }}
        >
          Activer
        </Button>
        <Button
          variant="text"
          onClick={handleResendCode}
          disabled={isResending}
          sx={{
            mt: 2,
            color: teal[700],
            textTransform: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isResending ? (
            <CircularProgress size={20} sx={{ color: teal[700], mr: 1 }} />
          ) : (
            <RefreshIcon sx={{ mr: 1 }} />
          )}
          {isResending ? "Renvoi en cours..." : "Renvoyer le code"}
        </Button>
      </Box>

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

export default ActivateAccount;
