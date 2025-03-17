import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, TextField, CircularProgress, Paper,
} from '@mui/material';
import { Button, Modal, message, Table, Card } from 'antd';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AchatTokens = () => {
  const [tokenAmount, setTokenAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [receiverPhoneNumber, setReceiverPhoneNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [balanceResponse] = await Promise.all([
          axios.get(`${API_URL}/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setBalance(balanceResponse.data.tokenBalance);
        
      } catch (err) {
        message.error('Erreur lors de la récupération des données.');
      }
    };
    fetchBalance();
  }, []);

  const validatePhoneNumber = (operator, number) => {
    const patterns = {
      MVOLA: /^034\d{7}$/,
      'Orange Money': /^032\d{7}$/,
      'Airtel Money': /^033\d{7}$/,
    };
    return patterns[operator]?.test(number);
  };

  const handleOperatorSelect = (operator) => {
    if (!tokenAmount || !mobileNumber || tokenAmount <= 0) {
      message.error('Veuillez entrer un montant valide et un numéro de téléphone.');
      return;
    }

    if (!validatePhoneNumber(operator, mobileNumber)) {
      message.error(`Le numéro de téléphone ne correspond pas au format de ${operator}.`);
      return;
    }

    setSelectedOperator(operator);
    setIsModalVisible(true);
  };

  const handlePurchase = async () => {
    setLoading(true);
    setIsModalVisible(false);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_URL}/payments/purchase1`,
        {
          operator: selectedOperator,
          amount: parseFloat(tokenAmount),
          phoneNumber: mobileNumber,
          receiverPhoneNumber,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setBalance((prevBalance) => prevBalance + parseFloat(tokenAmount));
        message.success('Achat réussi !');
        setTokenAmount('');
        setMobileNumber('');
        setReceiverPhoneNumber('');
      } else {
        message.error(response.data.message || 'Erreur lors de la transaction.');
      }
    } catch (err) {
      message.error('Erreur lors de l\'achat : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };



  return (
    <Box sx={{ padding: 4, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" sx={{ color: '#00A86B', fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
        Achat de GTC
      </Typography>

      <Paper elevation={3} sx={{ padding: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#00A86B', fontWeight: 'bold' }}>
          Solde Actuel
        </Typography>
        <Typography variant="h4" sx={{ color: '#00A86B', fontWeight: 'bold' }}>
          {balance} GTC
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Montant en GTC"
            variant="outlined"
            fullWidth
            size="small"
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Numéro de Téléphone"
            variant="outlined"
            fullWidth
            size="small"
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
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

      <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#00A86B', fontWeight: 'bold' }}>
        Choisissez votre opérateur mobile
      </Typography>
      <Grid container spacing={2}>
        {[
            { name: 'MVOLA', color: '#FCE205', logo: '/telma.png' },
            { name: 'Orange Money', color: '#FF8300', logo: '/orange.png' },
            { name: 'Airtel Money', color: '#FF0000', logo: '/airtel.png' },

        ].map(({ name, color, logo }) => (
          <Grid item xs={4} key={name}>
            <Button
              style={{
                backgroundColor: color,
                color: '#fff',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => handleOperatorSelect(name)}
            >
             <img
                src={logo}
                alt={name}
                style={{ width: 24, height: 24, marginRight: 8 }}
                />

              {name}
            </Button>
          </Grid>
        ))}
      </Grid>

     

            <Modal
            title="Confirmer l'achat"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={[
                <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                Annuler
                </Button>,
                <Button key="confirm" type="primary" onClick={handlePurchase} loading={loading}>
                Confirmer
                </Button>,
            ]}
            >
            <p>
                Vous allez acheter <strong>{tokenAmount} GTC</strong> via <strong>{selectedOperator}</strong> avec le numéro <strong>{mobileNumber}</strong>.
            </p>
            </Modal>

    </Box>
  );
};

export default AchatTokens;
