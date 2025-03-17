import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Select, DatePicker, Row, Col, Button } from 'antd';
import { Box, Typography, CircularProgress, Alert, useMediaQuery } from '@mui/material';
import { teal, red, green, blue } from '@mui/material/colors';
import { MonetizationOn, BarChart, AccountBalanceWallet, Payments, PictureAsPdf } from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Option } = Select;
const API_URL = 'http://localhost:5000/api';

const AdminRevenueDashboard = () => {
  const [revenues, setRevenues] = useState([]);
  const [platformBalance, setPlatformBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [commissionRevenue, setCommissionRevenue] = useState(0);
  const [feeRevenue, setFeeRevenue] = useState(0);
  const [dateFilter, setDateFilter] = useState(null);

  const isMobile = useMediaQuery('(max-width:572px)');
  const isTablet = useMediaQuery('(max-width:760px)');

  useEffect(() => {
    fetchRevenues();
    fetchPlatformBalance();
    const interval = setInterval(fetchPlatformBalance, 10000); // Rafraîchir toutes les 10 secondes

    return () => clearInterval(interval); // Nettoyer l'intervalle lors du démontage
  }, []);
 

  /** 📥 Récupérer les revenus */
  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/revenues`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const revenueData = response.data.revenues || [];
      setRevenues(revenueData);

      let total = 0, commission = 0, fee = 0;
      revenueData.forEach((rev) => {
        total += rev.amount;
        if (rev.type === 'commission') commission += rev.amount;
        if (rev.type === 'fee') fee += rev.amount;
      });

      setTotalRevenue(total);
      setCommissionRevenue(commission);
      setFeeRevenue(fee);
    } catch (error) {
      console.error('Erreur lors de la récupération des revenus :', error);
      setRevenues([]);
    } finally {
      setLoading(false);
    }
  };

  /** 📥 Récupérer le solde de la plateforme */
  const fetchPlatformBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/platform/platform-balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlatformBalance(response.data.platformBalance);
    } catch (error) {
      console.error('Erreur lors de la récupération du solde de la plateforme :', error);
    }
  };

  /** 🎯 Filtrage des revenus */
  const filteredRevenues = revenues.filter((rev) => {
    return !dateFilter || dayjs(rev.createdAt).isSame(dateFilter, 'day');
  });

  /** 📊 Configuration du graphique */
  const revenueChartData = {
    labels: filteredRevenues.map((rev) => dayjs(rev.createdAt).format('DD/MM')),
    datasets: [
      {
        label: 'Revenus (GTC)',
        data: filteredRevenues.map((rev) => rev.amount),
        backgroundColor: blue[500],
      },
    ],
  };

  /** 📌 Définition des couleurs */
  const typeColors = {
    commission: teal[500],
    fee: red[500],
  };

  /** 📌 Colonnes du tableau */
  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={typeColors[type] || blue[500]}>{type.toLowerCase()}</Tag>,
    },
    {
      title: 'Montant (GTC)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt) => `${amt.toFixed(2)} GTC`,
    },
  ];

  /** 📤 Export en PDF */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Rapport des Revenus - ${dayjs().format('DD/MM/YYYY')}`, 10, 10);

    autoTable(doc, {
      startY: 20,
      head: [['Date', 'Type', 'Montant (GTC)']],
      body: filteredRevenues.map((rev) => [
        dayjs(rev.createdAt).format('DD/MM/YYYY'),
        rev.type.toUpperCase(),
        `${rev.amount.toFixed(2)} GTC`,
      ]),
    });

    doc.save(`Revenus_${dayjs().format('YYYYMMDD')}.pdf`);
  };

  return (
    <Box sx={{ padding: 2, backgroundColor: teal[50], minHeight: '100vh' }}>
      <Typography variant={isMobile ? 'h6' : 'h5'} align="center" gutterBottom sx={{ color: teal[700] }}>
        Tableau de Bord des Revenus
      </Typography>

      {/* ✅ Solde de la plateforme */}
      <Card  sx={{ padding: 0, marginBottom: 0, backgroundColor: '#f9f9f9' }}>
        <Box display="flex" alignItems="center" >
          <MonetizationOn sx={{ fontSize: 30, color: 'black' }} />
          <Typography variant="h6" color="black">
            Solde de la Plateforme :
          </Typography>
          <Typography variant="h6" sx={{  color: 'black' }}>
            {platformBalance.toFixed(2)} GTC
          </Typography>
        </Box>
      </Card>

      {/* ✅ Bouton PDF */}
      <Box sx={{ textAlign: 'right', marginBottom: 2 }}>
        <Button
          type="primary"
          icon={<PictureAsPdf />}
          onClick={exportPDF}
          style={{ backgroundColor: red[500], borderColor: red[500] }}
        >
          Télécharger PDF
        </Button>
      </Box>

      {/* ✅ Cartes KPI */}
      <Row gutter={[12, 12]} style={{ marginBottom: 15 }}>
        <Col xs={24} sm={8}>
          <Card bordered>
            <Typography variant="subtitle1" color={teal[700]}><AccountBalanceWallet /> Commissions</Typography>
            <Typography variant="h6" style={{ color: teal[700] }}>
              {commissionRevenue.toFixed(2)} GTC
            </Typography>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered>
            <Typography variant="subtitle1" color={red[700]}><Payments /> Frais (Fee)</Typography>
            <Typography variant="h6" style={{ color: red[700] }}>
              {feeRevenue.toFixed(2)} GTC
            </Typography>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered>
            <Typography variant="subtitle1" color={blue[700]}><MonetizationOn /> Total Revenus</Typography>
            <Typography variant="h6" style={{ color: blue[700] }}>
              {totalRevenue.toFixed(2)} GTC
            </Typography>
          </Card>
        </Col>
      </Row>

      {/* ✅ Graphique */}
      <Card title={<><BarChart /> Graphique des Revenus</>} bordered style={{ marginBottom: 15 }}>
        <Bar data={revenueChartData} />
      </Card>

      {/* ✅ Tableau */}
      {loading ? (
        <CircularProgress />
      ) : (
        <Table columns={columns} dataSource={filteredRevenues} rowKey="id" pagination={{ pageSize: 5 }} bordered />
      )}
    </Box>
  );
};

export default AdminRevenueDashboard;
