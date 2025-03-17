import React, { useState, useEffect } from 'react';
import { Select, Input, DatePicker, Button, Spin, Alert, Table } from 'antd';
import Swal from 'sweetalert2';
import axios from 'axios';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { Line } from '@ant-design/charts'; // Pour les graphiques
import { saveAs } from 'file-saver'; // Pour exporter CSV
import Papa from 'papaparse'; // Pour convertir en CSV
import useDebounce from './useDebounce';


const { RangePicker } = DatePicker;

const Wrapper = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const FiltersWrapper = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #00786b;
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background-color: #00786b;
    color: white;
  }
  .ant-table-tbody > tr > td {
    background-color: #f9f9f9;
    color: black;
  }
`;

const AuctionHistory = () => {
  const [auctions, setAuctions] = useState([]);
  const [statistics, setStatistics] = useState({ daily: {}, monthly: {}, annual: {} });
 
  const [filters, setFilters] = useState({
    articleName: '',
    status: '',
    dateRange: [],
  });
  const debouncedArticleName = useDebounce(filters.articleName, 800); // 500ms

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les enchères
  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...(filters.articleName && { articleName: filters.articleName }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateRange.length && {
          startDate: dayjs(filters.dateRange[0]).toISOString(),
          endDate: dayjs(filters.dateRange[1]).toISOString(),
        }),
      };

      const response = await axios.get('/api/auctions/history', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setAuctions(response.data.data || []);
    } catch (error) {
      setError("Impossible de charger l'historique des enchères.");
      Swal.fire('Erreur', error.message || "Impossible de charger l'historique des enchères.", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/auctions/statistics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStatistics(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques : ", error);
    }
  };

  // Charger les données au démarrage et lorsqu'un filtre change
  useEffect(() => {
    fetchAuctions();
    fetchStatistics();
  }, [debouncedArticleName, filters.status, filters.dateRange]);

  // Préparer les données pour le graphique journalier
  const dailyData = Object.entries(statistics.daily).map(([date, amount]) => ({
    date,
    amount,
  }));

  const config = {
    data: dailyData,
    xField: 'date',
    yField: 'amount',
    label: {
      style: {
        fill: '#aaa',
      },
    },
    point: {
      size: 10,
      shape: 'diamond',
    },
  };

  // Exporter les données en CSV
  const handleExportCSV = () => {
    const csvData = auctions.map(({ auctionId, article, finalPrice, winner, status, auctionEndDate, totalBids, totalParticipants, duration, cancellationReason }) => ({
      ID: auctionId,
      Article: article?.name || 'N/A',
      MontantFinal: `${finalPrice || 0} GTC`,
      Gagnant: winner?.name || 'Aucun gagnant',
      Statut: status,
      DateDeCloture: dayjs(auctionEndDate).format('DD/MM/YYYY HH:mm'),
      NombreEnchères: totalBids,
      Participants: totalParticipants,
      Durée: duration || 'N/A',
      RaisonAnnulation: cancellationReason || 'N/A',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'historique_encheres.csv');
  };

  return (
    <Wrapper>
      <Title>Historique des Enchères</Title>
      {error && <Alert message={error} type="error" showIcon />}
      {loading ? (
        <Spin size="large" tip="Chargement des enchères..." />
      ) : (
        <>
          {/* Section Statistiques */}
          <div>
            <h3>Statistiques des Enchères</h3>
            <h4>Montants Journaliers</h4>
            <Line {...config} />
            <h4>Montants Mensuels</h4>
            <ul>
              {Object.entries(statistics.monthly).map(([month, amount]) => (
                <li key={month}>{month}: {amount} GTC</li>
              ))}
            </ul>
            <h4>Montants Annuels</h4>
            <ul>
              {Object.entries(statistics.annual).map(([year, amount]) => (
                <li key={year}>{year}: {amount} GTC</li>
              ))}
            </ul>
          </div>
          {/* Filtres */}
          <FiltersWrapper>
            <Input
              placeholder="Nom de l'article"
              onChange={(e) => setFilters({ ...filters, articleName: e.target.value })}
              value={filters.articleName}
              aria-label="Nom de l'article"
              
            />
            <Select
              placeholder="Statut"
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { label: 'Ouverte', value: 'open' },
                { label: 'Fermée', value: 'closed' },
                { label: 'Annulée', value: 'cancelled' },
              ]}
              aria-label="Statut"
            />
            <RangePicker
              onChange={(dates) =>
                setFilters({
                  ...filters,
                  dateRange: dates ? [dates[0], dates[1]] : [],
                })
              }
              aria-label="Sélectionner la plage de dates"
            />
            <Button type="primary" onClick={fetchAuctions}>
              Appliquer les filtres
            </Button>
            <Button type="default" onClick={handleExportCSV}>
              Exporter en CSV
            </Button>
          </FiltersWrapper>
          {/* Tableau */}
          <StyledTable 
            columns={[
              { title: "Nom de l'article", dataIndex: ['article', 'name'], key: 'articleName' },
              { title: 'Statut', dataIndex: 'status', key: 'status' },
              { title: 'Participants', dataIndex: 'totalParticipants', key: 'totalParticipants' },
              { title: 'Nombre d\'enchères', dataIndex: 'totalBids', key: 'totalBids' },
              { title: 'Montant final (GTC)', dataIndex: 'finalPrice', key: 'finalPrice' },
              { title: 'Gagnant', dataIndex: 'winner', key: 'winner', 
                render: (winner) => (winner ? winner.name : 'Aucun gagnant'),
              },
              { title: 'Durée', dataIndex: 'duration', key: 'duration' },
              { title: 'Raison d\'annulation', dataIndex: 'cancellationReason', key: 'cancellationReason' },
              { title: 'Date de Clôture', dataIndex: 'auctionEndDate', key: 'auctionEndDate',
                render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
              },
            ]} 
            dataSource={auctions} 
            rowKey="auctionId" 
            locale={{ emptyText: "Aucune enchère trouvée." }} 
            bordered
            pagination={{ pageSize: 10 }} 
          />
        </>
      )}
    </Wrapper>
  );
};

export default AuctionHistory;
