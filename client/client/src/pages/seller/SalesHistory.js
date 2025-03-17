import React, { useEffect, useState } from 'react';
import { Table, message, Typography, Tag, Modal, DatePicker, Button, Select } from 'antd';
import { Box, AppBar, Toolbar, IconButton, Grid, useMediaQuery } from '@mui/material';
import { teal } from '@mui/material/colors';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import dayjs from 'dayjs';

const API_URL = 'http://localhost:5000/api';

const TransactionsHistory = () => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const [filterType, setFilterType] = useState('day'); // Type de filtrage
  const [filterDate, setFilterDate] = useState(null);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/payments/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("[INFO] 🔍 Transactions récupérées :", response.data.transactions); // Ajoute ce log
           
        setTransactionHistory(response.data.transactions || []);
        setFilteredHistory(response.data.transactions || []);
      } catch (err) {
        message.error('Erreur lors de la récupération des transactions.');
      }
    };
    fetchTransactionHistory();
  }, []);

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  const handleFilter = () => {
    if (filterDate) {
      const filtered = transactionHistory.filter((transaction) => {
        const transactionDate = dayjs(transaction.createdAt);
        if (filterType === 'day') {
          return transactionDate.isSame(filterDate, 'day');
        } else if (filterType === 'month') {
          return transactionDate.isSame(filterDate, 'month');
        } else if (filterType === 'year') {
          return transactionDate.isSame(filterDate, 'year');
        }
        return false;
      });
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(transactionHistory);
    }
  };

  const typeColors = {
    purchase: 'green',
    sale: 'blue',
    reward: 'gold',
    spend: 'red',
    transfer: 'purple',
    refund:'gray',
    fee:'grey',
    escrow:'yellow',
    default: 'black',
  };

  const transactionColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={typeColors[type] || typeColors.default}>
          {(() => {
            switch (type) {
              case 'purchase':
                return 'Achat';
              case 'sale':
                return 'Vente';
              case 'reward':
                return 'Récompense';
              case 'spend':
                return 'Dépense';
                case 'escrow':
                return 'Récompense';
              case 'transfer':
                return 'Transfert';
              case 'refund':
                return 'Remboursement';  
                case 'fee':
                return 'Frais'; 
              default:
                return 'Inconnu';
            }
          })()}
        </Tag>
      ),
    },
    {
      title: 'Montant (GTC)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toFixed(2)} GTC`,
    },

    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'completed' ? 'green' : status === 'pending' ? 'blue' : 'red';
        // ✅ Forcer "fee" à toujours être "Terminée"
    if (status === 'fee') {
      status = "completed";
      color = "green";
    }
        return <Tag color={color}>{status === 'completed' ? 'Terminée' : status === 'pending' ? 'En attente' : 'Échouée'}</Tag>;
      },
    },
    
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: teal[50],
        minHeight: '100vh',
        padding: { xs: 2, sm: 4 },
      }}
    >
      {/* Barre d'en-tête */}
      <AppBar position="static" sx={{ backgroundColor: teal[700] }}>
        <Toolbar>
          <Typography
            variant="h4"
            sx={{ flexGrow: 1, color: '#fff', fontSize: { xs: 24, sm: 28, md: 32 } }}
          >
            Historique des Transactions
          </Typography>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Filtrage par date */}
      <Box sx={{ margin: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Select
          value={filterType}
          onChange={(value) => setFilterType(value)}
          style={{ width: '30%', marginRight: '10px' }}
        >
          <Select.Option value="day">Par Jour</Select.Option>
          <Select.Option value="month">Par Mois</Select.Option>
          <Select.Option value="year">Par Année</Select.Option>
        </Select>
        <DatePicker
          style={{ width: '60%' }}
          onChange={(date) => setFilterDate(date)}
          placeholder="Sélectionnez une date"
        />
        <Button type="primary" onClick={handleFilter} style={{ marginLeft: '10px' }}>
          Filtrer
        </Button>
      </Box>

      {/* Contenu principal */}
      <Box
        sx={{
          maxWidth: '100%',
          margin: 'auto',
          padding: { xs: 2, sm: 4 },
          backgroundColor: '#fff',
          borderRadius: 4,
          boxShadow: 3,
          overflowX: 'auto',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: teal[700],
            textAlign: 'center',
            marginBottom: 3,
            fontSize: { xs: 24, sm: 28, md: 32 },
            fontWeight: 'bold',
          }}
        >
          Historique des Transactions
        </Typography>
        <Grid container justifyContent="center">
          <Grid item xs={12}>
            <Table
              dataSource={filteredHistory}
              columns={transactionColumns}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
              })}
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                locale: { items_per_page: 'par page' },
              }}
              bordered
              scroll={{ x: isMobile ? 400 : 'max-content' }}
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
              size={isMobile ? 'small' : 'middle'}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Modal pour afficher les détails de la transaction */}
      <Modal
        title="Détails de la Transaction"
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
        width={isMobile ? '80%' : '400px'}
        bodyStyle={{ backgroundColor: teal[50], color: '#333', padding: '20px' }}
        titleStyle={{ backgroundColor: teal[700], color: '#fff' }}
      >
        {selectedTransaction && (
          <div>
            <p style={{ fontSize: isMobile ? '14px' : '16px' }}><strong>Type:</strong> {selectedTransaction.type}</p>
            <p style={{ fontSize: isMobile ? '14px' : '16px' }}><strong>Montant (GTC):</strong> {selectedTransaction.amount.toFixed(2)} GTC</p>
            <p style={{ fontSize: isMobile ? '14px' : '16px' }}><strong>Montant Réel (MGA):</strong> {selectedTransaction.saleAmount ? selectedTransaction.saleAmount.toLocaleString() + ' MGA' : 'N/A'}</p>
            <p style={{ fontSize: isMobile ? '14px' : '16px' }}><strong>Taux de Conversion Appliqué:</strong> {selectedTransaction.appliedConversionRate ? selectedTransaction.appliedConversionRate.toFixed(2) : 'N/A'}</p>
            <p style={{ fontSize: isMobile ? '14px' : '16px' }}><strong>Transaction ID:</strong> {selectedTransaction.transactionId}</p>
            <p style={{ fontSize: isMobile ? '14px' : '16px' }}><strong>Date:</strong> {new Date(selectedTransaction.createdAt).toLocaleString()}</p>
            <p style={{ fontSize: isMobile ? '14px' : '16px' }}><strong>Statut:</strong> {selectedTransaction.success ? 'Réussie' : 'Échouée'}</p>
          </div>
        )}
      </Modal>
    </Box>
  );
};

export default TransactionsHistory;