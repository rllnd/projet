import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InfoIcon from '@mui/icons-material/Info';

const WithdrawForm = () => {
  const [tokenBalance, setTokenBalance] = useState(0); // Solde en tokens de l'utilisateur
  const [fiatEquivalent, setFiatEquivalent] = useState(0); // Montant en Ariary
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null); // Taux de conversion dynamique
  const [platformBalance, setPlatformBalance] = useState(0); // Solde de la plateforme

  const withdrawalLimit = 500; // Limite de retrait en tokens

  // Charger le solde et le taux de conversion
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const balanceResponse = await axios.get('/api/seller/token-balance');
        setTokenBalance(balanceResponse.data.tokenBalance);

        const platformResponse = await axios.get('/api/platform/balance');
        setPlatformBalance(platformResponse.data.platformBalance);

        const exchangeRateResponse = await axios.get('/api/exchange-rate'); // Assurez-vous que cet endpoint est correct
        const rate = exchangeRateResponse.data.exchangeRate;
        setExchangeRate(rate);
        setFiatEquivalent(balanceResponse.data.tokenBalance * rate);
      } catch (error) {
        console.error("Erreur lors du chargement des données de portefeuille :", error);
      }
    };
    fetchWalletData();
  }, []);

  // Validation du formulaire
  const isFormValid = () => {
    const mobileNumberValid = /^03\d{8}$/.test(mobileNumber); // Numéro malgache valide
    const withdrawAmountValid = withdrawAmount > 0 && withdrawAmount <= tokenBalance && withdrawAmount <= withdrawalLimit; // Limite de retrait
    return mobileNumberValid && withdrawAmountValid;
  };

  // Calcul de l'équivalent en monnaie locale
  const calculateFiatEquivalent = (amount) => {
    return amount * exchangeRate;
  };

  // Soumettre la demande de retrait
  const handleWithdraw = async () => {
    try {
      // Retirer les tokens de l'utilisateur et les transférer vers le solde de la plateforme
      await axios.post('/api/seller/withdraw', {
        amount: withdrawAmount,
        mobileNumber,
      });

      // Mettre à jour les soldes
      setTokenBalance(tokenBalance - withdrawAmount);
      setPlatformBalance(platformBalance + parseFloat(withdrawAmount));

      alert('Demande de retrait envoyée avec succès !');
      setWithdrawAmount('');
      setMobileNumber('');
      setConfirmOpen(false);
    } catch (error) {
      console.error("Erreur lors de la demande de retrait :", error);
      alert("Échec de la demande de retrait.");
    }
  };

  return (
    <Card variant="outlined" sx={{ padding: 4, maxWidth: 600, margin: '0 auto', backgroundColor: '#f9f9f9' }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <MonetizationOnIcon sx={{ fontSize: 40, color: '#ff6f00' }} />
        <Typography variant="h5" fontWeight="bold" color="primary">Demande de Retrait</Typography>
      </Box>
      <Divider sx={{ marginBottom: 2 }} />

      {/* Instructions */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <InfoIcon color="info" />
        <Typography variant="body2" color="textSecondary">
          Indiquez le montant en tokens que vous souhaitez échanger. Chaque token vaut actuellement <strong>{exchangeRate} MGA</strong>. 
          Le montant équivalent en Ariary sera crédité sur votre compte Mobile Money.
        </Typography>
      </Box>

      {/* Solde et équivalent */}
      <Box mb={2}>
        <Typography variant="body1" color="textSecondary">
          Solde actuel : <strong>{tokenBalance} GTC</strong>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Équivalent en Ariary : <strong>{fiatEquivalent ? `${fiatEquivalent} MGA` : 'Chargement...'}</strong>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Limite de retrait : <strong>{withdrawalLimit} GTC</strong>
        </Typography>
      </Box>

      <Box component="form" onSubmit={(e) => e.preventDefault()} display="flex" gap={2} flexDirection="column">
        {/* Champ Montant */}
        <TextField
          type="number"
          label="Montant de Retrait (en GTC)"
          variant="outlined"
          value={withdrawAmount}
          onChange={(e) => {
            setWithdrawAmount(e.target.value);
            setFiatEquivalent(calculateFiatEquivalent(e.target.value));
          }}
          required
          fullWidth
          helperText={`Montant maximum : ${Math.min(tokenBalance, withdrawalLimit)} GTC`}
          error={withdrawAmount > withdrawalLimit}
        />

        {/* Champ Numéro Mobile Money */}
        <TextField
          type="text"
          label="Numéro Mobile Money (Madagascar)"
          variant="outlined"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
          fullWidth
          helperText="Entrez un numéro malgache valide commençant par '03' (ex : 0345678912)"
          error={!/^03\d{8}$/.test(mobileNumber) && mobileNumber !== ''}
        />

        {/* Montant Converti en Ariary */}
        <Typography variant="body2" color="textSecondary" mt={1}>
          Vous recevrez environ : <strong>{fiatEquivalent ? `${fiatEquivalent} MGA` : 'Calcul en cours...'}</strong>
        </Typography>

        {/* Bouton de soumission */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setConfirmOpen(true)}
          sx={{ marginTop: 2 }}
          disabled={!isFormValid()}
        >
          Demander le Retrait
        </Button>
      </Box>

      {/* Dialogue de Confirmation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmer le Retrait</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vous êtes sur le point de retirer <strong>{withdrawAmount} GTC</strong> (environ <strong>{fiatEquivalent} MGA</strong>) vers le numéro Mobile Money suivant : <strong>{mobileNumber}</strong>.
            <br />
            Veuillez confirmer que ces informations sont correctes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">Annuler</Button>
          <Button onClick={handleWithdraw} color="primary">Confirmer</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default WithdrawForm;
