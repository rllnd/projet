import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';

const CancelAuctionDialog = ({ open, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalComment, setAdditionalComment] = useState('');

  // Liste des raisons d'annulation valides (doit correspondre à la liste backend)
  const reasons = [
    'Article non conforme',
    'Demande du vendeur',
    'Problème technique',
    'Fraude suspectée',
  ];

  const handleConfirm = () => {
    if (!selectedReason) {
      alert('Veuillez sélectionner une raison d\'annulation.');
      return;
    }

    onConfirm(selectedReason, additionalComment); // Envoyer la raison au parent
    setSelectedReason('');
    setAdditionalComment('');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Annuler l'enchère</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Raison de l'annulation"
          fullWidth
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value)}
          margin="normal"
        >
          {reasons.map((reason, index) => (
            <MenuItem key={index} value={reason}>
              {reason}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Commentaire supplémentaire (facultatif)"
          fullWidth
          multiline
          rows={4}
          value={additionalComment}
          onChange={(e) => setAdditionalComment(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Annuler
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelAuctionDialog;
