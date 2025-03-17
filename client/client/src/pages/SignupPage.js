import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { teal } from '@mui/material/colors';
import { UploadOutlined } from '@ant-design/icons';
import { Upload } from 'antd'; 
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'buyer',
    profilePicture: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (info) => {
    if (info.file.status === 'done') {
      setFormData((prevData) => ({
        ...prevData,
        profilePicture: info.file.originFileObj,
      }));
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    const userData = new FormData();
    userData.append('name', formData.name);
    userData.append('firstName', formData.firstName);
    userData.append('lastName', formData.lastName);
    userData.append('email', formData.email);
    userData.append('password', formData.password);
    userData.append('phone', formData.phone);
    userData.append('role', formData.role);
    if (formData.profilePicture) {
      userData.append('profilePicture', formData.profilePicture);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Inscription réussie. Redirection vers la page d’activation...');
      setErrorMessage('');
      setTimeout(() => {
        navigate(`/activate-account?userId=${response.data.userId}`);
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Erreur lors de l'inscription.");
      setSuccessMessage('');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'rgba(37, 81, 122, 0.555)',
      }}
    >
      <Card
        sx={{
          width: '90%',
          maxWidth: '600px',
          borderRadius: '10px',
          backgroundColor: 'rgba(11, 37, 70, 0.733)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          color: 'white',
        }}
      >
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Inscription
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={1}>
              {/* Champ Nom */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small" // Réduire la taille
                  label="Nom"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <PersonIcon sx={{ color: 'white' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(37, 81, 122, 0.555)' },
                    },
                  }}
                />
              </Grid>

              {/* Champ Prénom */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small" // Réduire la taille
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(37, 81, 122, 0.555)' },
                    },
                  }}
                />
              </Grid>

              {/* Champ Nom de famille */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small" // Réduire la taille
                  label="Nom de famille"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(37, 81, 122, 0.555)' },
                    },
                  }}
                />
              </Grid>

              {/* Champ Rôle */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: 'white' }}>Rôle</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    sx={{
                      '& .MuiSelect-select': { color: 'white' },
                      '& .MuiInputLabel-root': { color: 'white' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(37, 81, 122, 0.555)' },
                      },
                    }}
                  >
                    <MenuItem value="buyer">Acheteur</MenuItem>
                    <MenuItem value="seller">Vendeur</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Champs Email et Téléphone côte à côte */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small" // Réduire la taille
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
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small" // Réduire la taille
                  type="tel"
                  label="Numéro de téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <PhoneIcon sx={{ color: 'white' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(37, 81, 122, 0.555)' },
                    },
                  }}
                />
              </Grid>

              {/* Mot de passe */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small" // Réduire la taille
                  type={showPassword ? 'text' : 'password'}
                  label="Mot de passe"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          sx={{ color: 'white' }}
                        >
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
                    },
                  }}
                />
              </Grid>

              {/* Confirmation mot de passe */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small" // Réduire la taille
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirmer mot de passe"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPasswordVisibility}
                          sx={{ color: 'white' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(37, 81, 122, 0.555)' },
                    },
                  }}
                />
              </Grid>

              {/* Upload */}
              <Grid item xs={12}>
                <Upload
                  name="profilePicture"
                  showUploadList={false}
                  customRequest={({ file, onSuccess }) => {
                    setTimeout(() => {
                      onSuccess('ok');
                    }, 0);
                  }}
                  onChange={handleFileChange}
                  accept="image/*"
                >
                  <Button
                    variant="contained"
                    startIcon={<UploadOutlined />}
                    fullWidth
                    sx={{ backgroundColor: teal[500], color: 'white' }}
                  >
                    Ajouter une photo de profil
                  </Button>
                </Upload>
              </Grid>

              {/* Erreurs et succès */}
              <Grid item xs={12}>
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                {successMessage && <Alert severity="success">{successMessage}</Alert>}
              </Grid>

              {/* Bouton Inscription */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ backgroundColor: teal[500], color: 'white', '&:hover': { backgroundColor: teal[700] } }}
                >
                  S'inscrire
                </Button>
              </Grid>
            </Grid>
          </form>

          <Typography
            variant="body2"
            align="center"
            sx={{ marginTop: 2, color: 'white' }}
          >
            Déjà inscrit ?{' '}
            <Button onClick={handleLoginRedirect} variant="text" sx={{ color: teal[500] }}>
              Connectez-vous
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Signup;