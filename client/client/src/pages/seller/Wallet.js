import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';
import { Button, Tabs, Modal, message } from 'antd';
import { teal, grey } from '@mui/material/colors';
import axios from 'axios';

const { TabPane } = Tabs;
const API_URL = 'http://localhost:5000/api';

const GestionTokens = () => {
  const [tokenAmount, setTokenAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [receiverPhoneNumber, setReceiverPhoneNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [conversionRate, setConversionRate] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operation, setOperation] = useState('sell'); // 'sell' ou 'buy'
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [conversionRateResponse, balanceResponse] = await Promise.all([
          axios.get(`${API_URL}/conversion-rate/rate`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (conversionRateResponse.data.success && conversionRateResponse.data.rate) {
          setConversionRate(conversionRateResponse.data.rate);
        }

        setBalance(balanceResponse.data.tokenBalance || 0);
      } catch (err) {
        setErrorMessage('Erreur lors de la récupération des données.');
      }
    };
    fetchData();
  }, []);

  const handleOperation = async () => {
    if (!tokenAmount || tokenAmount <= 0 || !phoneNumber || !selectedOperator) {
      message.error('Veuillez remplir tous les champs correctement.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = operation === 'sell' ? `${API_URL}/payments/sell` : `${API_URL}/payments/purchase1`;
      const payload =
        operation === 'sell'
          ? { amount: parseFloat(tokenAmount), phoneNumber, operator: selectedOperator }
          : { operator: selectedOperator, amount: parseFloat(tokenAmount), phoneNumber, receiverPhoneNumber };

      const response = await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setBalance((prev) => (operation === 'sell' ? prev - parseFloat(tokenAmount) : prev + parseFloat(tokenAmount)));
        setTokenAmount('');
        setPhoneNumber('');
        setReceiverPhoneNumber('');
        setSelectedOperator('');
      } else {
        setErrorMessage(response.data.message || 'Erreur lors de la transaction.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur inconnue.';
      setErrorMessage(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const calculatedAmount = tokenAmount ? (tokenAmount * conversionRate).toFixed(2) : '0.00';

  const operators = [
    { name: 'MVOLA', color: '#FCE205', logo: '/telma.png' },
    { name: 'Orange Money', color: '#FF8300', logo: '/orange.png' },
    { name: 'Airtel Money', color: '#FF0000', logo: '/airtel.png' },
  ];

  return (
    <Box
      sx={{
        padding: 4,
        maxWidth: 900,
        margin: '0 auto',
        backgroundColor: grey[50],
        borderRadius: 2,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h5" sx={{ color: teal[700], fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
        Gestion des Tokens (GTC)
      </Typography>

      <Paper elevation={3} sx={{ padding: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: teal[700], fontWeight: 'bold' }}>
          Solde Actuel
        </Typography>
        <Typography variant="h4" sx={{ color: teal[500], fontWeight: 'bold' }}>
          {balance} GTC
        </Typography>
        <Typography variant="body1" sx={{ color: teal[500], mt: 1 }}>
          Taux de Conversion : <strong>{conversionRate > 0 ? `1 GTC = ${conversionRate} MGA` : 'N/A'}</strong>
        </Typography>
      </Paper>

      <Tabs defaultActiveKey="sell" centered onChange={(key) => setOperation(key)}>
        <TabPane tab="Vente de Tokens" key="sell">
          <Typography variant="body1" sx={{ mb: 2, color: teal[700], fontWeight: 'bold' }}>
            Vendez vos tokens et recevez de l'argent.
          </Typography>
        </TabPane>
        <TabPane tab="Achat de Tokens" key="buy">
          <Typography variant="body1" sx={{ mb: 2, color: teal[700], fontWeight: 'bold' }}>
            Achetez des tokens en utilisant votre opérateur mobile.
          </Typography>
        </TabPane>
      </Tabs>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label={`Montant en GTC (${operation === 'sell' ? 'à vendre' : 'à acheter'})`}
            variant="outlined"
            fullWidth
            size="small"
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Numéro de Téléphone"
            variant="outlined"
            fullWidth
            size="small"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Grid>
      </Grid>

      {operation === 'buy' && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Numéro du Récepteur"
              variant="outlined"
              fullWidth
              size="small"
              type="tel"
              value={receiverPhoneNumber}
              onChange={(e) => setReceiverPhoneNumber(e.target.value)}
            />
          </Grid>
        </Grid>
      )}

      <Typography variant="h6" sx={{ mt: 4, mb: 2, color: teal[700], fontWeight: 'bold' }}>
        Choisissez votre opérateur
      </Typography>
      <Grid container spacing={2}>
        {operators.map(({ name, logo,color }) => (
          <Grid item xs={4} key={name}>
            <Button
              style={{
                backgroundColor: color,
                color: '#fff',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => setSelectedOperator(name)}
            >
              <img src={logo} alt={name} style={{ width: 24, height: 24, marginRight: 8 }} />
              {name}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Button
        type="primary"
        block
        style={{ marginTop: 16, backgroundColor: teal[700], borderColor: teal[700] }}
        onClick={() => setIsModalOpen(true)}
        disabled={!tokenAmount || !selectedOperator}
      >
        Confirmer
      </Button>

      <Modal
        title={operation === 'sell' ? 'Confirmer la Vente' : "Confirmer l'Achat"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOperation}
        confirmLoading={loading}
      >
        <p style={{ color: grey[700] }}>
          Vous allez {operation === 'sell' ? 'vendre' : 'acheter'}{' '}
          <strong>{tokenAmount} GTC</strong> via{' '}
          <strong>{selectedOperator}</strong>.
        </p>
        <p style={{ color: grey[800] }}>
          Montant {operation === 'sell' ? 'attendu' : 'requis'} :{' '}
          <strong>{calculatedAmount} MGA</strong>
        </p>
      </Modal>


      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage('')}>
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage('')}>
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionTokens;
