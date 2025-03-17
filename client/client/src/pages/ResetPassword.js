import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  InputAdornment,
} from '@mui/material';
import { teal, red } from '@mui/material/colors';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    
    setPasswordMismatch(false); // Réinitialise l'état si les mots de passe correspondent

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password`, { token, password });
      setMessage(response.data.message);
      setPassword(''); // Réinitialise le champ mot de passe après soumission
      setConfirmPassword(''); // Réinitialise le champ de confirmation
      setErrorMessage(''); // Réinitialise le message d'erreur
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe.');
      setMessage(''); // Réinitialise le message de succès
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 2,
        backgroundColor: 'rgba(37, 81, 122, 0.555)',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '10px',
          backgroundColor: 'rgba(11, 37, 70, 0.733)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          color: 'white',
        }}
      >
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Réinitialiser le mot de passe
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Champ Nouveau Mot de Passe */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <ErrorOutlineIcon sx={{ color: 'white' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(37, 81, 122, 0.555)' },
                      '&:hover fieldset': { borderColor: 'white' },
                    },
                  }}
                />
              </Grid>

              {/* Champ Confirmation Mot de Passe */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  error={passwordMismatch}
                  helperText={passwordMismatch ? "Les mots de passe ne correspondent pas." : ""}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <ErrorOutlineIcon sx={{ color: 'white' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(37, 81, 122, 0.555)' },
                      '&:hover fieldset': { borderColor: 'white' },
                    },
                  }}
                />
              </Grid>

              {/* Message de succès */}
              {message && (
                <Grid item xs={12}>
                  <Typography variant="body2" align="center" sx={{ color: teal[500] }}>
                    {message}
                  </Typography>
                </Grid>
              )}

              {/* Message d'erreur avec icône */}
              {errorMessage && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: red[500],
                      fontSize: '0.9rem',
                      textAlign: 'center',
                    }}
                  >
                    <ErrorOutlineIcon sx={{ marginRight: 1 }} />
                    <Typography variant="body2">{errorMessage}</Typography>
                  </Box>
                </Grid>
              )}

              {/* Bouton Réinitialiser */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: teal[700],
                    '&:hover': { backgroundColor: teal[500] },
                    color: 'white',
                  }}
                >
                  Réinitialiser
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;