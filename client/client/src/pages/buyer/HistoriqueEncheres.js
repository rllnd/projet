import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, useMediaQuery, Card } from '@mui/material';
import { Table, Tag, Pagination, Space } from 'antd';
import axios from 'axios';
import { teal, red, grey } from '@mui/material/colors';

const AuctionHistoryList = () => {
  const [auctionHistory, setAuctionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchAuctionHistory();
  }, []);

  const fetchAuctionHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/auctions/history-transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuctionHistory(response.data?.data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des enchères :', err);
      setError('Impossible de charger l\'historique des enchères.');
    } finally {
      setLoading(false);
    }
  };

  const transactionText = (type, amount, description) => {
    if (type === "spend") return `Dépensé : ${amount} GTC pour "${description}".`;
    if (type === "refund") return `Remboursement : ${amount} GTC pour "${description}".`;
    return `${amount} GTC (${description})`;
};


  const columns = [
    { title: "Nom de l'Article", dataIndex: 'articleName', key: 'articleName' },
    { title: 'Catégorie', dataIndex: 'articleCategory', key: 'articleCategory', responsive: ['lg'] }, // Affiché uniquement sur les grands écrans
    { title: 'Prix de Départ', dataIndex: 'startPrice', key: 'startPrice', render: (price) => `${price} GTC`, responsive: ['lg'] }, // Affiché uniquement sur les grands écrans
    { title: 'Prix Final', dataIndex: 'currentHighestBid', key: 'currentHighestBid', render: (price) => `${price} GTC` },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'cancelled' ? red[500] : status === 'closed' ? teal[500] : grey[500]}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Transactions',
      dataIndex: 'transactions',
      key: 'transactions',
      render: (transactions) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          {transactions.length ? (
            transactions.map((t) => (
              <Card key={t.id} style={cardStyle}>
              <Typography variant="body2">{transactionText(t.type, t.amount, t.description)}</Typography>

              </Card>
            ))
          ) : (
            <Tag color="volcano">Aucune transaction</Tag>
          )}
        </Space>
      ),   
    },
    { title: 'Nombre de Mises', dataIndex: 'bids', key: 'bids', render: (bids) => bids.length },
  ];

  // Filtrer les colonnes en fonction de la taille de l'écran
  const filteredColumns = isMobile
    ? columns.filter(col => !col.responsive || !col.responsive.includes('lg'))
    : columns;

  const containerStyle = {
    padding: isMobile ? '0.5rem' : '1rem',
    maxWidth: '1200px',
    margin: 'auto',
  };

  const cardStyle = {
    margin: '0.5rem 0',
    padding: '0.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={containerStyle}>
      <Typography variant={isMobile ? 'h5' : 'h4'} align="center" gutterBottom style={{ color: teal[700] }}>
        Historique des Enchères
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Table
          columns={filteredColumns}
          dataSource={auctionHistory.slice((page - 1) * pageSize, page * pageSize)}
          rowKey="id"
          pagination={false}
          bordered
        />
      )}
      <Pagination
        current={page}
        pageSize={pageSize}
        total={auctionHistory.length}
        onChange={(page, pageSize) => {
          setPage(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default AuctionHistoryList;