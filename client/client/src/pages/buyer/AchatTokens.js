import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Snackbar, Alert,
} from '@mui/material';
import MobileFriendlyIcon from '@mui/icons-material/MobileFriendly';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { teal, red } from '@mui/material/colors';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Définir l'URL de votre API

const AchatTokens = () => {
  const [tokenAmount, setTokenAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBalance(response.data.tokenBalance);
      } catch (err) {
        setError("Erreur lors de la récupération du solde.");
      }
    };
    fetchBalance();
  }, []);

  const handleOperatorSelect = (operator) => {
    if (tokenAmount > 0 && mobileNumber) {
      setSelectedOperator(operator);
      setOpenDialog(true);
    } else {
      setError("Veuillez entrer un montant valide de tokens et un numéro de téléphone.");
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    setOpenDialog(false);
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    try {
      const response = await axios.post(
        `${API_URL}/transactions/purchase`,
        { userId, operator: selectedOperator, tokenAmount, mobileNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(prevBalance => prevBalance + parseFloat(tokenAmount));
      setSuccess(true);
      // Réinitialiser les champs
      setTokenAmount('');
      setMobileNumber('');
      setSelectedOperator(null);
    } catch (error) {
      setError("Erreur lors de l'achat de tokens : " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h5" sx={{ color: teal[700], fontWeight: 'bold', mb: 4 }}>
        Acheter des Tokens (GTC)
      </Typography>
      
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 1, backgroundColor: teal[50], boxShadow: 1, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body1" sx={{ color: 'black' }}>
                Solde actuel : <strong>{balance} GTC</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 1, backgroundColor: teal[50], boxShadow: 1, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body1" sx={{ color: 'black' }}>
                Montant en tokens (GTC) à acheter :
              </Typography>
              <TextField
                label="Montant en GTC"
                variant="outlined"
                fullWidth
                size="small"
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Card sx={{ padding: 1, backgroundColor: teal[50], boxShadow: 1, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="body1" sx={{ color: 'black' }}>
              Numéro de téléphone pour le paiement mobile :
            </Typography>
            <TextField
              label="Numéro de téléphone"
              variant="outlined"
              fullWidth
              size="small"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h6" sx={{ mt: 3, mb: 2, color: teal[700], fontWeight: 'bold' }}>
        Choisissez votre moyen de paiement
      </Typography>
      <Grid container spacing={2}>
        {['Airtel', 'Orange', 'Telma'].map(operator => (
          <Grid item xs={12} sm={4} key={operator}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleOperatorSelect(operator)}
              startIcon={operator === 'Airtel' ? <MobileFriendlyIcon /> : operator === 'Orange' ? <MonetizationOnIcon /> : <AccountBalanceWalletIcon />}
              sx={{ padding: '6px 8px', color: operator === 'Airtel' ? red[600] : operator === 'Orange' ? 'orange' : teal[700], borderColor: operator === 'Airtel' ? red[600] : operator === 'Orange' ? 'orange' : teal[700] }}
            >
              {operator} Money
            </Button>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmer l'achat</DialogTitle>
        <DialogContent>
          <Typography color="grey">
            Vous êtes sur le point d'acheter {tokenAmount} GTC via {selectedOperator} avec le numéro {mobileNumber}.
            Veuillez confirmer pour continuer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Annuler
          </Button>
          <Button onClick={handlePurchase} variant="contained" color="primary">
            {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Achat de {tokenAmount} GTC réussi !
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AchatTokens;