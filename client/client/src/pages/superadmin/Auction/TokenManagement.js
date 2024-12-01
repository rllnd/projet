import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Chip } from '@mui/material';
import { teal, red, green } from '@mui/material/colors';
import axios from 'axios';

const TokenManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [price, setPrice] = useState(10); 
  const [buyLimit, setBuyLimit] = useState(500); 
  const [withdrawLimit, setWithdrawLimit] = useState(300); 

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/transactions');
        setTransactions(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des transactions", error);
      }
    };

    fetchTransactions();
  }, []);

  const handleApproveTransaction = async (transactionId) => {
    try {
      await axios.post(`/api/transactions/approve/${transactionId}`);
      setTransactions((prev) => prev.map((trans) =>
        trans.id === transactionId ? { ...trans, status: 'approved' } : trans
      ));
      alert('Transaction approuvée avec succès.');
    } catch (error) {
      console.error("Erreur lors de l'approbation de la transaction", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ color: teal[700], textAlign: 'center', mb: 3 }}>
        Gestion des Tokens
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center' }}>
        <Button variant="contained" onClick={() => setPrice(price)} sx={{ fontSize: '0.8rem' }}>Mettre à jour le prix</Button>
        <Button variant="contained" onClick={() => setBuyLimit(buyLimit)} sx={{ fontSize: '0.8rem' }}>Mettre à jour la limite d'achat</Button>
        <Button variant="contained" onClick={() => setWithdrawLimit(withdrawLimit)} sx={{ fontSize: '0.8rem' }}>Mettre à jour la limite de retrait</Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700] }}>Utilisateur</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700] }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700] }}>Montant</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700] }}>Statut</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700] }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((trans) => (
            <TableRow key={trans.id}>
              <TableCell>{trans.user}</TableCell>
              <TableCell>{trans.type}</TableCell>
              <TableCell>{trans.amount}</TableCell>
              <TableCell>
                <Chip
                  label={trans.status === 'pending' ? 'En attente' : 'Approuvé'}
                  sx={{
                    backgroundColor: trans.status === 'pending' ? red[400] : green[400],
                    color: 'white',
                  }}
                />
              </TableCell>
              <TableCell>
                {trans.status === 'pending' && (
                  <Button variant="outlined" color="success" size="small" onClick={() => handleApproveTransaction(trans.id)}>
                    Approuver
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default TokenManagement;
