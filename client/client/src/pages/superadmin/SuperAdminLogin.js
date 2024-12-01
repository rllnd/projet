import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { AccountCircle, Visibility, VisibilityOff } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { teal, purple } from '@mui/material/colors';
import logo from '../../assets/images/Gtoken.webp';

const theme = createTheme({
  palette: {
    primary: {
      main: teal[700],
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: teal[700],
          textTransform: 'none',
          '&:hover': {
            backgroundColor: purple[500],
          },
        },
        text: {
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'transparent',
            color: teal[700],
          },
        },
      },
    },
  },
});

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/superadmin/login', {
        email,
        password,
      });

      // Store the token depending on "remember" state
      if (remember) {
        localStorage.setItem('token', response.data.token);
      } else {
        sessionStorage.setItem('token', response.data.token);
      }

      navigate('/superadmin-dashboard');
    } catch (error) {
      setError('Échec de la connexion. Vérifiez vos identifiants.');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberChange = (event) => {
    setRemember(event.target.checked);
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f4f6f8',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `
                         radial-gradient(circle at 80% 40%, rgba(0, 109, 176, 0.2) 10%, transparent 50%),
                         radial-gradient(circle at 50% 80%, rgba(10, 187, 34, 0.2) 10%, transparent 50%)`,
            backgroundSize: 'cover',
          }}
        />
        
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={0}>
            <img src={logo} alt="Logo" style={{ width: 40, height: 40, marginRight: 8, borderRadius: 50 }} />
            <Typography variant="h4" color="teal" gutterBottom sx={{ fontWeight: 'bold' }}>
              Admin Login
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
            GTOKEN_Dashboard
          </Typography>
          
          {error && <Typography color="error">{error}</Typography>}
          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={handleRememberChange}
                    sx={{ '&:hover': { color: teal[700] } }}
                  />
                }
                label="Remember"
                sx={{ ml: 0, mr: 2 }} 
              />
              <Button
                variant="text"
                onClick={handleForgotPassword}
                sx={{
                  textTransform: 'lowercase',
                  '&:hover': {
                    color: teal[700],
                  },
                  padding: 0,
                }}
              >
                forgot password?
              </Button>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                textTransform: 'lowercase',
                backgroundColor: teal[700],
                '&:hover': {
                  backgroundColor: teal[500],
                },
              }}
            >
              sign in
            </Button>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default SuperAdminLogin;
