import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Divider } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { teal } from '@mui/material/colors';
import axios from 'axios';

const SoldeCompte = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Fetch the balance and recent transactions from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId'); 
        const balanceResponse = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
       

        setBalance(balanceResponse.data.tokenBalance);
        
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des informations');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" sx={{ color: teal[700], fontWeight: 'bold', mb: 2 }}>
        Solde du Compte
      </Typography>
      <Card
        sx={{
          backgroundColor: teal[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 2,
          boxShadow: 3,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 6,
          },
        }}
      >
        <Avatar sx={{ bgcolor: teal[500], width: 56, height: 56 }}>
          <MonetizationOnIcon fontSize="large" />
        </Avatar>
        <CardContent sx={{ textAlign: 'center' }}>
          {loading ? (
            <CircularProgress color="inherit" />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: teal[700] }}>
                {balance} GTC
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Solde disponible
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Historique des transactions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ color: teal[700], fontWeight: 'bold', mb: 2 }}>
          Transactions Récentes
        </Typography>
        <Card sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {transactions.length > 0 ? (
    transactions.slice(0, 5).map((transaction) => (
      <TableRow key={transaction.id}>
        <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>{transaction.transactionType === 'token_purchase' ? 'Achat de Tokens' : 'Paiement Enchère'}</TableCell>
        <TableCell>{transaction.amount} GTC</TableCell>
        <TableCell>{transaction.status}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={4} align="center">
        Aucune transaction récente
      </TableCell>
    </TableRow>
  )}
</TableBody>
</Table>
        </Card>
      </Box>
    </Box>
  );
};

export default SoldeCompte;
