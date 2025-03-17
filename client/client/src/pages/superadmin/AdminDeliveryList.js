import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Select, Input, DatePicker, Card, Row, Col } from 'antd';
import { Box, Typography, CircularProgress, useMediaQuery, Divider, Chip } from '@mui/material';
import { teal, red, orange, green, blue, grey } from '@mui/material/colors';
import { LocalShipping, Person, ShoppingCart } from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

const AdminDeliveryList = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(null);

  const isMobile = useMediaQuery('(max-width:572px)');
  const isTablet = useMediaQuery('(max-width:760px)');

  // 🛒 Récupérer les livraisons
  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/admin/deliveries', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDeliveries(response.data.deliveries || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des livraisons :', error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Filtrer les livraisons
  const filteredDeliveries = Array.isArray(deliveries)
    ? deliveries.filter((delivery) => {
        return (
          (!statusFilter || delivery.status === statusFilter) &&
          (!search || delivery.buyer?.name.toLowerCase().includes(search.toLowerCase())) &&
          (!dateFilter || dayjs(delivery.createdAt).isSame(dateFilter, 'day'))
        );
      })
    : [];

  // 🎯 Afficher les détails dans une MODAL
  const showDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setModalVisible(true);
  };

  // 📌 Définition des statuts avec couleur
  const statusColors = {
    pending: orange[500], // En attente
    shipped: blue[500],  // Expédié
    delivered: green[500], // Livré
  };

  // 📌 Colonnes pour écrans larges
  const allColumns = [
    {
      title: 'Acheteur',
      dataIndex: ['buyer', 'name'],
      key: 'buyer',
      render: (name) => <Typography>{name || 'Non spécifié'}</Typography>,
    },
    {
      title: 'Vendeur',
      dataIndex: ['seller', 'name'],
      key: 'seller',
      render: (name) => <Typography>{name || 'Non spécifié'}</Typography>,
    },
    {
      title: 'Article',
      dataIndex: ['auction', 'articleDetails', 'name'],
      key: 'articleName',
      render: (name) => name || 'Non spécifié',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || red[500]}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => showDetails(record)}>
          Voir détails
        </Button>
      ),
    },
  ];

  // 📌 Colonnes pour mobiles (≤ 572px) sans la date
  const mobileColumns = allColumns.filter(col => !['buyer','seller','createdAt'].includes(col.key));

  return (
    <Box sx={{ padding: 3, backgroundColor: teal[50], minHeight: '100vh' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} align="center" gutterBottom style={{ color: teal[700] }}>
        Gestion des Livraisons
      </Typography>

      {/* 📌 Filtres */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 2 }}>
        <Select
          placeholder="Filtrer par statut"
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          style={{ width: isTablet ? '100%' : '200px' }}
        >
          <Option value="pending">En attente</Option>
          <Option value="shipped">Expédié</Option>
          <Option value="delivered">Livré</Option>
        </Select>
        <Input
          placeholder="Rechercher acheteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: isTablet ? '100%' : '200px' }}
        />
        <DatePicker
          style={{ width: isTablet ? '100%' : '200px' }}
          onChange={(date) => setDateFilter(date)}
          placeholder="Filtrer par date"
        />
      </Box>

      {/* 📌 Tableau des livraisons */}
      {loading ? (
        <CircularProgress />
      ) : (
        <Table
          columns={isMobile ? mobileColumns : allColumns}
          dataSource={filteredDeliveries}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          bordered
        />
      )}

      {/* 📌 Modal pour afficher les détails */}
      <Modal
        title="Détails de la Livraison"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedDelivery && (
          <Card bordered style={{ background: grey[50], padding: '10px' }}>
            <Row gutter={[16, 16]}>
              {/* Informations de l'Acheteur */}
              <Col span={12}>
                <Card title={<><Person /> Acheteur</>} bordered>
                  <p><strong>Nom :</strong> {selectedDelivery.buyer?.name}</p>
                  <p><strong>Email :</strong> {selectedDelivery.buyer?.email}</p>
                  <p><strong>Adresse :</strong> {selectedDelivery.buyer?.address || 'Non spécifiée'}</p>
                </Card>
              </Col>

              {/* Informations du Vendeur */}
              <Col span={12}>
                <Card title={<><Person /> Vendeur</>} bordered>
                  <p><strong>Nom :</strong> {selectedDelivery.seller?.name}</p>
                  <p><strong>Email :</strong> {selectedDelivery.seller?.email}</p>
                </Card>
              </Col>
            </Row>

            <Divider />

            {/* Détails de la Livraison */}
            <Card title={<><LocalShipping /> Livraison</>} bordered>
              <p><strong>Article :</strong> {selectedDelivery.auction?.articleDetails?.name}</p>
              <p><strong>Statut :</strong> <Chip label={selectedDelivery.status} color="primary" /></p>
              <p><strong>Numéro de suivi :</strong> {selectedDelivery.trackingNumber || 'Non spécifié'}</p>
              <p><strong>Date :</strong> {dayjs(selectedDelivery.createdAt).format('DD/MM/YYYY HH:mm')}</p>
            </Card>
          </Card>
        )}
      </Modal>
    </Box>
  );
};

export default AdminDeliveryList;
