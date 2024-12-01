import React, { useState } from 'react';  
import { Dialog, Typography, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';  

const BuyTokensModal = ({ onClose, onBuy }) => {  
  const [selectedAmount, setSelectedAmount] = useState(100);  
  const [phoneNumber, setPhoneNumber] = useState('');  

  const handleBuy = (method) => {  
    if (!phoneNumber) {  
      alert("Veuillez entrer votre numéro de téléphone pour le paiement.");  
      return;  
    }  
    onBuy(selectedAmount);  
    // Vous pouvez enregistrer également le number dans une base ou l’utiliser pour la transaction  
    console.log(`Achat de ${selectedAmount} tokens via ${method} pour le numéro : ${phoneNumber}`);  
  };  

  return (  
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>  
      <DialogTitle>Acheter des Tokens</DialogTitle>  
      <DialogContent>  
        <FormControl fullWidth sx={{ marginBottom: 2 }}>  
          <InputLabel>Montant des Tokens</InputLabel>  
          <Select  
            value={selectedAmount}  
            onChange={(e) => setSelectedAmount(Number(e.target.value))}  
            label="Montant des Tokens"  
          >  
            <MenuItem value={100}>100 Tokens (5,000 MGA)</MenuItem>  
            <MenuItem value={500}>500 Tokens (1,000,000 MGA)</MenuItem>  
            <MenuItem value={1000}>1000 Tokens (2,000,000 MGA)</MenuItem>  
          </Select>  
        </FormControl>  

        <TextField  
          label="Numéro de téléphone"  
          variant="outlined"  
          fullWidth  
          value={phoneNumber}  
          onChange={(e) => setPhoneNumber(e.target.value)}  
          sx={{ marginBottom: 2 }}  
        />  

        <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>Sélectionnez votre méthode de paiement :</Typography>  
        <Button variant="outlined" fullWidth sx={{ marginBottom: 1 }}  style={{ background: '#3E8C26', color:'#FFFFFF' }} onClick={() => handleBuy('MVola')}>Acheter avec MVola</Button>  
        <Button variant="outlined" fullWidth sx={{ marginBottom: 1 }} style={{ background: '#FF6A11',color:'#FFFFFF' }} onClick={() => handleBuy('Orange Money')}>Acheter avec Orange Money</Button>  
        <Button variant="outlined" fullWidth onClick={() => handleBuy('Airtel Money')} style={{ background: '#C22A1E',color:'#FFFFFF' }}>Acheter avec Airtel Money</Button>  
      </DialogContent>  
      <DialogActions>  
        <Button onClick={onClose} color="error">Fermer</Button>  
      </DialogActions>  
    </Dialog>  
  );  
};  

export default BuyTokensModal;