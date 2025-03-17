import React, { useState, useEffect } from 'react';
import {
  Typography,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { Table, Input, Pagination, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { teal, red, blue } from '@mui/material/colors';
import axios from 'axios';

const EncheresAnnulees = () => {
  const [cancelledAuctions, setCancelledAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Détecter les écrans mobiles
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchCancelledAuctions();
  }, []);

  const fetchCancelledAuctions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/auctions/buyercancelled', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCancelledAuctions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des enchères annulées :', error);
    } finally {
      setLoading(false);
    }
  };

  // Recherche dans les enchères annulées
  const filteredAuctions = cancelledAuctions.filter((auction) =>
    auction.articleName?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Colonnes du tableau pour les écrans larges
  const fullColumns = [
    {
      title: 'Nom de l\'Article',
      dataIndex: 'articleName',
      key: 'articleName',
      render: (text) => (
        <Typography sx={{ fontWeight: 'bold' }}>{text}</Typography>
      ),
    },
    {
      title: 'Prix de Départ (GTC)',
      dataIndex: 'startPrice',
      key: 'startPrice',
      render: (price) => `${price} GTC`,
    },
    {
      title: 'Prix Final (GTC)',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      render: (price) => price ? `${price} GTC` : 'Non défini',
    },
    {
      title: 'Dernière Mise',
      dataIndex: 'lastBid',
      key: 'lastBid',
      render: (bid) => (
        bid ? (
          <Typography sx={{ color: blue[700] }}>{`${bid} GTC`}</Typography>
        ) : (
          <Tag color="gray">Aucune mise</Tag>
        )
      ),
    },
    {
      title: 'Raison',
      dataIndex: 'cancelReason',
      key: 'cancelReason',
      render: (reason) => (
        <Tag color={red[500]}>{reason || 'Non spécifiée'}</Tag>
      ),
    },
    {
      title: 'Date d\'Annulation',
      dataIndex: 'cancelDate',
      key: 'cancelDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  // Colonnes pour les petits écrans
  const mobileColumns = [
    {
      title: 'Nom de l\'Article',
      dataIndex: 'articleName',
      key: 'articleName',
      render: (text) => (
        <Typography sx={{ fontWeight: 'bold' }}>{text}</Typography>
      ),
    },
    {
      title: 'Dernière Mise',
      dataIndex: 'lastBid',
      key: 'lastBid',
      render: (bid) => (
        bid ? (
          <Typography sx={{ color: blue[700] }}>{`${bid} GTC`}</Typography>
        ) : (
          <Tag color="gray">Aucune mise</Tag>
        )
      ),
    },
    {
      title: 'Raison',
      dataIndex: 'cancelReason',
      key: 'cancelReason',
      render: (reason) => (
        <Tag color={red[500]}>{reason || 'Non spécifiée'}</Tag>
      ),
    },
    {
      title: 'Date d\'Annulation',
      dataIndex: 'cancelDate',
      key: 'cancelDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f4f6f9', borderRadius: '12px' }}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        align="center"
        gutterBottom
        style={{ color: teal[700], fontWeight: 'bold' }}
      >
        Enchères Annulées
      </Typography>

      <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
        <Input
          placeholder="Rechercher un article"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: isMobile ? '100%' : '50%' }}
        />
      </Space>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress color="primary" />
        </div>
      ) : filteredAuctions.length === 0 ? (
        <Typography color="textSecondary" align="center">
          Aucune enchère annulée trouvée.
        </Typography>
      ) : (
        <>
          <Table
            columns={isMobile ? mobileColumns : fullColumns}
            dataSource={filteredAuctions.slice((page - 1) * pageSize, page * pageSize)}
            rowKey="id"
            pagination={false}
            bordered
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
    </div>
  );
};

export default EncheresAnnulees;
