import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { Table, Input, Pagination, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { teal, red } from '@mui/material/colors';

const CancelledAuctionsList = () => {
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
      const response = await axios.get('http://localhost:5000/api/auctions/cancelled', {
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
    auction.articleDetails?.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Colonnes du tableau pour les écrans larges
  const fullColumns = [
    {
      title: 'Article',
      dataIndex: 'articleName',
      key: 'articleName',
      render: (_, auction) => (
        <Typography sx={{ fontWeight: 'bold' }}>
          {auction.articleDetails?.name || 'Non disponible'}
        </Typography>
      ),
    },
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      render: (_, auction) => auction.articleDetails?.category?.name || 'Non disponible',
    },
    {
      title: 'Prix ',
      dataIndex: 'price',
      key: 'price',
      render: (_, auction) => `${auction.articleDetails?.price || 0} GTC`,
    },
    {
      title: 'Prix du départ',
      dataIndex: 'startprice',
      key: 'startprice',
      render: (_, auction) => auction.articleDetails?.startprice|| 'Prix inconnu',
    },
    {
      title: 'Raison',
      dataIndex: 'cancellationReason',
      key: 'cancellationReason',
      render: (reason) => (
        <Tag color={red[500]}>{reason || 'Non spécifiée'}</Tag>
      ),
    },
    {
      title: 'Date d\'annulation',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  // Colonnes pour les petits écrans
  const mobileColumns = [
    {
      title: 'Article',
      dataIndex: 'articleName',
      key: 'articleName',
      render: (_, auction) => (
        <Typography sx={{ fontWeight: 'bold' }}>
          {auction.articleDetails?.name || 'Non disponible'}
        </Typography>
      ),
    },
    {
      title: 'Prix',
      dataIndex: 'price',
      key: 'price',
      render: (_, auction) => `${auction.articleDetails?.price || 0} GTC`,
    },
    {
      title: 'Raison',
      dataIndex: 'cancellationReason',
      key: 'cancellationReason',
      render: (reason) => (
        <Tag color={red[500]}>{reason || 'Non spécifiée'}</Tag>
      ),
    },
    
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        align="center"
        gutterBottom
        style={{ color: teal[700] }}
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
          Aucune enchère annulée disponible.
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

export default CancelledAuctionsList;
