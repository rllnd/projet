import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Modal,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Table, Tag } from 'antd';
import { teal, grey, red } from '@mui/material/colors';

const StoppedAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchStoppedAuctions = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          'http://localhost:5000/api/auctions/sellerStopped',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAuctions(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des enchères stoppées :', error);
        setAuctions([]);
        setLoading(false);
      }
    };

    fetchStoppedAuctions();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(new Date(dateString));
  };

  const handleViewDetails = (auction) => {
    setSelectedAuction(auction);
    setModalVisible(true);
  };

  const renderDetailsModal = () => {
    if (!selectedAuction) return null;

    const {
      article = {},
      currentHighestBid,
      reason,
      finalizedAt,
      totalBids,
      participants,
      transactions = [],
    } = selectedAuction;

    return (
      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Paper
          sx={{
            padding: 3,
            margin: 'auto',
            maxWidth: 700,
            backgroundColor: grey[100],
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" color={teal[600]} id="modal-title">
            Détails de l'enchère : {article.name || 'Non spécifié'}
          </Typography>
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="subtitle1" color={grey[800]}>
              <strong>Nom :</strong> {article.name || 'N/A'}
            </Typography>
            <Typography variant="subtitle1" color={grey[800]}>
              <strong>Prix le plus élevé :</strong> {currentHighestBid || 0} GTC
            </Typography>
            <Typography variant="subtitle1" color={grey[800]}>
              <strong>Nombre d'enchères :</strong> {totalBids || 0}
            </Typography>
            <Typography variant="subtitle1" color={grey[800]}>
              <strong>Participants uniques :</strong> {participants || 0}
            </Typography>
            <Typography variant="subtitle1" color={grey[800]}>
              <strong>Raison :</strong> {reason || 'N/A'}
            </Typography>
            <Typography variant="subtitle1" color={grey[800]}>
              <strong>Date de fin :</strong> {formatDate(finalizedAt)}
            </Typography>
          </Box>
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6" color={teal[600]}>
              Transactions
            </Typography>
            {transactions.length > 0 ? (
              <Table
                dataSource={transactions}
                columns={[
                  { title: 'Type', dataIndex: 'type', key: 'type' },
                  { title: 'Montant (GTC)', dataIndex: 'amount', key: 'amount' },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                  { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (date) => formatDate(date) },
                ]}
                rowKey="id"
                pagination={false}
              />
            ) : (
              <Typography color={grey[800]}>Aucune transaction liée.</Typography>
            )}
          </Box>
          <Button
            onClick={() => setModalVisible(false)}
            variant="contained"
            sx={{ marginTop: 2, backgroundColor: teal[500] }}
          >
            Fermer
          </Button>
        </Paper>
      </Modal>
    );
  };

  const columns = [
    { title: 'Article', dataIndex: ['article', 'name'], key: 'articleName' },
    { title: 'Catégorie', dataIndex: ['category', 'name'], key: 'categoryName' },
    { title: 'Prix le Plus Élevé', dataIndex: 'currentHighestBid', key: 'currentHighestBid', render: (value) => `${value || 0} GTC` },
    { title: 'Raison', dataIndex: 'reason', key: 'reason', render: (reason) => <Tag color={reason === 'Inactivité' ? grey[500] : red[500]}>{reason || 'N/A'}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          onClick={() => handleViewDetails(record)}
          variant="contained"
          size="small"
          sx={{
            backgroundColor: teal[700],
            color: 'white',
            fontSize: '0.8rem',
            padding: '4px 8px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: teal[800],
            },
          }}
        >
          Voir Détails
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, backgroundColor: grey[100], minHeight: '100vh' }}>
      <Typography variant="h4" color={teal[600]} gutterBottom>
        Enchères Stoppées
      </Typography>
      <Table
        columns={columns}
        dataSource={auctions}
        rowKey={(record) => record.id}
        pagination={{ pageSize: 10 }}
      />
      {renderDetailsModal()}
    </Box>
  );
};

export default StoppedAuctions;
