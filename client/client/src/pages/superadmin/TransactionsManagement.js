import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { teal, red, green, blue } from '@mui/material/colors';

const initialTransactions = [
  { id: 1, user: 'Utilisateur1', type: 'Achat', amount: 50, status: 'pending', mobileNumber: '+261 34 12 345 67' },
  { id: 2, user: 'Utilisateur2', type: 'Vente', amount: 100, status: 'approved', mobileNumber: '+261 33 45 678 90' },
];

const TokenManagement = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [price, setPrice] = useState(10);
  const [buyLimit, setBuyLimit] = useState(500);
  const [withdrawLimit, setWithdrawLimit] = useState(300);

  const handlePriceChange = () => {
    alert(`Le prix du token a été mis à jour à ${price} Ar.`);
  };

  

  const handleLimitChange = () => {
    alert(`Limites mises à jour : Achat - ${buyLimit} tokens, Retrait - ${withdrawLimit} tokens.`);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ color: teal[700], fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
        Gestion des Tokens
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 4,
          alignItems: 'center'
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          width: '100%',
          maxWidth: 600,
          justifyContent: 'center'
        }}>
          <TextField
            label="Prix par token (Ar)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ width: { xs: '100%', sm: '30%' } }}
          />
          <TextField
            label="Limite d'achat (tokens)"
            type="number"
            value={buyLimit}
            onChange={(e) => setBuyLimit(e.target.value)}
            sx={{ width: { xs: '100%', sm: '30%' } }}
          />
          <TextField
            label="Limite de retrait (tokens)"
            type="number"
            value={withdrawLimit}
            onChange={(e) => setWithdrawLimit(e.target.value)}
            sx={{ width: { xs: '100%', sm: '30%' } }}
          />
        </Box>
        
        <Box sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: teal[700],
              color: 'white',
              '&:hover': { bgcolor: teal[900] },
              fontSize: '0.75rem',
              padding: '6px 12px'
            }}
            onClick={handleLimitChange}
          >
            Mettre à jour les limites
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: blue[700],
              color: 'white',
              '&:hover': { bgcolor: blue[900] },
              fontSize: '0.75rem',
              padding: '6px 12px'
            }}
            onClick={handlePriceChange}
          >
            Mettre à jour le prix
          </Button>
        </Box>
      </Box>

      <Table sx={{ minWidth: { xs: 250, md: 650 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700], fontSize: 16 }}>Utilisateur</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700], fontSize: 16 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700], fontSize: 16 }}>Montant (GTC)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700], fontSize: 16 }}>Statut</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700], fontSize: 16 }}>Numéro Mobile</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: teal[700], fontSize: 16 }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.user}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>
                <Chip
                  label={transaction.status === 'pending' ? 'En attente' : 'Approuvé'}
                  color={transaction.status === 'pending' ? 'warning' : 'success'}
                  sx={{
                    backgroundColor: transaction.status === 'pending' ? red[400] : green[400],
                    color: 'white',
                  }}
                />
              </TableCell>
              <TableCell>{transaction.mobileNumber}</TableCell>
              <TableCell>
                {transaction.status === 'pending' && (
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    onClick={() => alert(`Transaction approuvée pour ${transaction.user}`)}
                    sx={{ fontSize: '0.75rem', padding: '4px 6px' }}
                  >
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
