import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, CircularProgress } from '@mui/material';
import axios from 'axios';

const HistoriqueTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtres
  const [typeFilter, setTypeFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError("L'ID de l'utilisateur n'est pas disponible.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/transactions/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des transactions", error);
        setError("Erreur lors de la récupération des transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleFilterChange = () => {
    let filtered = transactions;

    if (typeFilter) {
      filtered = filtered.filter(transaction => transaction.transactionType === typeFilter);
    }
    if (amountFilter) {
      filtered = filtered.filter(transaction => transaction.amount >= parseFloat(amountFilter));
    }
    if (dateFilter) {
      filtered = filtered.filter(transaction => transaction.createdAt.startsWith(dateFilter));
    }

    setFilteredTransactions(filtered);
  };

  useEffect(handleFilterChange, [typeFilter, amountFilter, dateFilter, transactions]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>Historique des Transactions</Typography>

      {/* Filtres */}
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tous les Types</MenuItem>
          <MenuItem value="token_purchase">Achat de Tokens</MenuItem>
          <MenuItem value="auction_payment">Paiement Enchère</MenuItem>
        </Select>

        <TextField
          type="number"
          label="Montant minimum"
          variant="outlined"
          value={amountFilter}
          onChange={(e) => setAmountFilter(e.target.value)}
        />

        <TextField
          type="date"
          label="Date"
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type de Transaction</TableCell>
                <TableCell>Montant (GTC)</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.transactionType === 'token_purchase'
                        ? 'Achat de Tokens'
                        : transaction.transactionType === 'auction_payment'
                        ? 'Paiement Enchère'
                        : 'Autre'}
                    </TableCell>
                    <TableCell>{transaction.amount} GTC</TableCell>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Aucune transaction trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default HistoriqueTransactions;
