import React, { useEffect, useState } from 'react';
import { Table, Input, Pagination, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  Typography,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { teal, red, grey } from '@mui/material/colors';
import axios from 'axios';

const LostAuctionsList = () => {
  const [lostAuctions, setLostAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchLostAuctions();
  }, []);

  const fetchLostAuctions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/auctions/buyerexpired', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLostAuctions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des enchères perdues :', error);
    } finally {
      setLoading(false);
    }
  };

  // Recherche dans les enchères perdues
  const filteredAuctions = lostAuctions.filter((auction) =>
    auction.articleDetails?.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Colonnes pour les écrans larges
  const fullColumns = [
    {
      title: 'Article',
      dataIndex: 'articleDetails',
      key: 'articleName',
      render: (article) => (
        <Typography sx={{ fontWeight: 'bold' }}>
          {article?.name || 'Non disponible'}
        </Typography>
      ),
    },
    {
      title: 'Prix départ (GTC)',
      dataIndex: 'articleDetails',
      key: 'startPrice',
      render: (article) => article?.startPrice || 'Non défini',
    },
    {
      title: 'Votre Dernière Mise (GTC)',
      dataIndex: 'bids',
      key: 'userBid',
      render: (bids) => bids?.[0]?.amount || 'Non défini',
    },
    {
      title: 'Prix Final (GTC)',
      dataIndex: 'articleDetails',
      key: 'finalPrice',
      render: (article) => article?.price || 'Non défini',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={red[500]}>
          {status === 'closed' ? 'Fermée' : 'Statut inconnu'}
        </Tag>
      ),
    },
    {
      title: 'Date de Clôture',
      dataIndex: 'finalizedAt',
      key: 'finalizedAt',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  // Colonnes pour les écrans mobiles
  const mobileColumns = [
    {
      title: 'Article',
      dataIndex: 'articleDetails',
      key: 'articleName',
      render: (article) => (
        <Typography sx={{ fontWeight: 'bold' }}>
          {article?.name || 'Non disponible'}
        </Typography>
      ),
    },
    {
      title: 'Prix Final (GTC)',
      dataIndex: 'articleDetails',
      key: 'finalPrice',
      render: (article) => article?.price || 'Non défini',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={red[500]}>
          {status === 'closed' ? 'Fermée' : 'Statut inconnu'}
        </Tag>
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
        Enchères Perdues
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
          Vous n'avez participé à aucune enchère perdue.
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

export default LostAuctionsList;
