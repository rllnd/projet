import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import { teal, red } from '@mui/material/colors';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';

const apiUrl = '/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Réinitialiser le message d'erreur

    if (formData.email && formData.password) {
      try {
        const payload = {
          email: formData.email,
          password: formData.password,
        };
        const response = await axios.post(`${apiUrl}/auth/login`, payload);
        console.log('Réponse de connexion:', response.data); // Vérifiez la structure de la réponse

        localStorage.setItem('authToken', response.data.token); // Stockez le token

        // Vérifiez si 2FA est activé
        if (response.data.twoFactorAuthEnabled) {
          setIsTwoFactorEnabled(true);
        } else {
          handleSuccessfulLogin(response.data);
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
        setErrorMessage(error.response?.data?.message || 'Erreur lors de la connexion.');
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage('Veuillez remplir tous les champs.');
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('authToken');
      console.log('Token récupéré pour vérification:', token);
      if (!token) {
        throw new Error('Token d\'authentification manquant.');
      }

      const response = await axios.post(`${apiUrl}/two-factor-auth/verify`, {
        code: formData.twoFactorCode,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Données après vérification 2FA:', response.data);

      // Ajoutez le rôle à la réponse
      handleSuccessfulLogin(response.data);
    } catch (error) {
      console.error('Erreur de validation 2FA:', error.response?.data || error);
      setErrorMessage(error.response?.data?.message || 'Code de vérification en deux étapes invalide.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulLogin = (data) => {
    console.log('Données de connexion reçues:', JSON.stringify(data));

    // Vérifiez que le rôle est défini
    if (!data.role) {
      console.error('Le rôle de l\'utilisateur est indéfini. Vérifiez la réponse du serveur.');
      return; // Arrêtez l'exécution si le rôle est manquant
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userId', data._id);
    login({ role: data.role, token: data.token, email: data.email });

    console.log('Type de rôle:', typeof data.role);
    console.log('Valeur du rôle:', data.role);
    console.log('Navigation vers:', data.role === 'buyer' ? '/buyer-dashboard' : '/seller-dashboard');

    navigate(data.role === 'buyer' ? '/buyer-dashboard' : '/seller-dashboard');
  };

  const handleSignupRedirect = () => {
    navigate('/signup');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleResendCode = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('authToken')?.trim();
      if (!token) {
        throw new Error('Token d\'authentification manquant.');
      }

      await axios.post(`${apiUrl}/two-factor-auth/send-code`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Code de vérification renvoyé avec succès.');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du code de vérification:', error);
      setErrorMessage('Erreur lors de l\'envoi du code de vérification.');
    } finally {
      setLoading(false);
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
            Se connecter
          </Typography>

          <form onSubmit={isTwoFactorEnabled ? handleTwoFactorSubmit : handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Mot de passe"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleTogglePasswordVisibility} sx={{ color: 'white' }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
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

              {isTwoFactorEnabled && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="text"
                      label="Code de vérification 2FA"
                      name="twoFactorCode"
                      value={formData.twoFactorCode}
                      onChange={handleChange}
                      required
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
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleResendCode}
                      sx={{
                        marginTop: 1,
                        color: teal[500],
                        borderColor: teal[500],
                        '&:hover': { borderColor: teal[700], color: teal[700] },
                      }}
                    >
                      Renvoyer le code
                    </Button>
                  </Grid>
                </>
              )}

              <Grid item xs={12} textAlign="right">
                <Link
                  onClick={handleForgotPassword}
                  sx={{
                    color: teal[500],
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Mot de passe oublié ?
                </Link>
              </Grid>

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
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : (isTwoFactorEnabled ? 'Vérifier le code' : 'Connexion')}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Typography
            variant="body2"
            align="center"
            sx={{ marginTop: 2, color: 'white' }}
          >
            Pas encore inscrit ?{' '}
            <Button
              onClick={handleSignupRedirect}
              variant="text"
              sx={{ color: '#007bff' }}
            >
              Inscrivez-vous
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;