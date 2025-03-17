import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Tooltip,
  Avatar,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { Table, Tag, Modal, Card, Input, Pagination, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { teal, grey, red, green } from '@mui/material/colors';

const AuctionHistory = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Détecter les écrans de petite taille
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchAuctionHistory = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          'http://localhost:5000/api/auctions/seller-auctions',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Données reçues :', response.data);
        setAuctions(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Erreur de chargement de l\'historique des enchères :', error);
        setLoading(false);
      }
    };

    fetchAuctionHistory();
  }, []);

  const handleViewDetails = (auction) => {
    setSelectedAuction(auction);
  };

  const filteredAuctions = Array.isArray(auctions)
    ? auctions.filter((auction) =>
        auction.articleName.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  // Colonnes pour les grands écrans
  const desktopColumns = [
    {
      title: 'Article',
      dataIndex: 'articleName',
      key: 'articleName',
      render: (name) => <Typography sx={{ fontWeight: 'bold' }}>{name}</Typography>,
    },
    {
      title: 'Catégorie',
      dataIndex: 'articleCategory',
      key: 'articleCategory',
    },
    {
      title: 'Prix de départ',
      dataIndex: 'startPrice',
      key: 'startPrice',
      render: (startPrice) => `${startPrice} GTC`,
    },
    {
      title: 'Statut',
      key: 'status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'closed' ? 'blue' : 'red'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Raison',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Gagnant',
      key: 'winner',
      render: (_, auction) =>
        auction.winner ? (
          <Tooltip title={`Email: ${auction.winner.email}`}>
            <Space>
              <Avatar sx={{ bgcolor: green[500] }}>
                {auction.winner.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography>{auction.winner.name}</Typography>
            </Space>
          </Tooltip>
        ) : (
          <Typography color={red[500]}>Aucun gagnant</Typography>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, auction) => (
        <Button
          onClick={() => handleViewDetails(auction)}
          sx={{
            color: 'white',
            backgroundColor: teal[500],
            textTransform: 'none',
          }}
        >
          Voir détails
        </Button>
      ),
    },
  ];

  // Colonnes pour les petits écrans
  const mobileColumns = [
    {
      title: 'Article',
      dataIndex: 'articleName',
      key: 'articleName',
      render: (name) => <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{name}</Typography>,
    },
    {
      title: 'Gagnant',
      key: 'winner',
      render: (_, auction) =>
        auction.winner ? (
          <Tooltip title={`Email: ${auction.winner.email}`}>
            <Avatar sx={{ bgcolor: green[500] }}>
              {auction.winner.name.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
        ) : (
          <Typography color={red[500]}>Aucun</Typography>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, auction) => (
        <Button
          onClick={() => handleViewDetails(auction)}
          sx={{
            color: 'white',
            backgroundColor: teal[500],
            fontSize: '0.8rem',
            padding: '4px 8px',
          }}
        >
          Détails
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        color={teal[600]}
        gutterBottom
      >
        Historique des Enchères
      </Typography>
      <Input
        placeholder="Rechercher un article"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, width: isMobile ? '100%' : '50%' }}
      />
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
        <Table
          columns={isMobile ? mobileColumns : desktopColumns}
          dataSource={filteredAuctions.slice(
            (page - 1) * pageSize,
            page * pageSize
          )}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: 'Aucune enchère trouvée.',
          }}
        />

          <Pagination
            current={page}
            pageSize={pageSize}
            total={filteredAuctions.length}
            onChange={(page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }}
            style={{ marginTop: 16, textAlign: 'center' }}
          />
        </>
      )}
      {selectedAuction && (
        <Modal
          title={`Détails de l'enchère : ${selectedAuction.articleName}`}
          visible={!!selectedAuction}
          onCancel={() => setSelectedAuction(null)}
          footer={[
            <Button key="back" onClick={() => setSelectedAuction(null)}>
              Fermer
            </Button>,
          ]}
          width={isMobile ? '90%' : '60%'}
        >
          <Card>
            <p>
              <strong>Catégorie :</strong> {selectedAuction.articleCategory}
            </p>
            <p>
              <strong>Prix de départ :</strong> {selectedAuction.startPrice} GTC
            </p>
            <p>
              <strong>Meilleure enchère :</strong> {selectedAuction.currentHighestBid} GTC
            </p>
            <p>
              <strong>Raison :</strong> {selectedAuction.reason}
            </p>
            <p>
              <strong>Nombre total d'enchères :</strong> {selectedAuction.totalBids}
            </p>
            <Typography variant="h6" color={teal[500]} gutterBottom>
              Transactions
            </Typography>
            <Table
  dataSource={selectedAuction.transactions}
  columns={[
    { 
      title: 'Type', 
      dataIndex: 'type', 
      key: 'type',
      render: (type) => {
        let color = "blue";
        let text = "Inconnu";
        
        if (type === "escrow") {
          color = "orange";
          text = "Fonds bloqués";
        } else if (type === "reward") {
          color = "green";
          text = "Paiement reçu";
        } else if (type === "commission") {
          color = "red";
          text = "Frais de commission";
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    { title: 'Montant', dataIndex: 'amount', key: 'amount' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { 
      title: 'Statut', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        return <Tag color={status === "completed" ? "green" : "blue"}>{status === "completed" ? "Terminée" : "En attente"}</Tag>;
      }
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleString(),
    },
  ]}
  rowKey="id"
  pagination={false}
/>

          </Card>
        </Modal>
      )}
    </Box>
  );
};

export default AuctionHistory;
