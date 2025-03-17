import React, { useState } from 'react';
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
  Link,
} from '@mui/material';
import { teal, red } from '@mui/material/colors';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EmailIcon from '@mui/icons-material/Email';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message);
      setEmail(''); // Réinitialise le champ email après soumission
      setErrorMessage(''); // Réinitialise le message d'erreur
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email.');
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
            Mot de passe oublié
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Champ Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <EmailIcon sx={{ color: 'white' }} />
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

              {/* Bouton Envoyer le lien de réinitialisation */}
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
                  Envoyer le lien de réinitialisation
                </Button>
              </Grid>
            </Grid>
          </form>

          <Typography
            variant="body2"
            align="center"
            sx={{ marginTop: 2, color: 'white' }}
          >
            Vous avez un compte ?{' '}
            <Link
              href="/login"
              sx={{ color: teal[500], textDecoration: 'underline' }}
            >
              Connectez-vous
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;