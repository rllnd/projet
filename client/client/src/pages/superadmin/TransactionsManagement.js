import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tabs, Card, message, Button, Badge, Modal, Input, Select, Tag, Descriptions } from 'antd';
import { Box, Typography, Skeleton } from '@mui/material';
import { teal } from '@mui/material/colors';
import axios from 'axios';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { green, red, blue, orange, purple, cyan, grey,yellow} from '@mui/material/colors';

const { TabPane } = Tabs;
const { Option } = Select;

const statusColors = {
  Réussie: 'green',
  Échouée: 'red',
  "En attente": 'gold',
};

const transactionColors = {
  purchase: teal[400], // Achat de tokens
  sale: orange[500], // Vente de tokens
  refund: 'black', // Remboursement
  spend: red[300], // Dépense
  reward: orange[300], // Récompense
  commission: cyan[700], // Commission
  escrow: grey[200], // Escrow
  fee: grey[700], // Frais
  default: grey[50], // Par défaut (blanc)
};


const transactionTypes = {
  purchase: "Achat de Tokens",
  sale: "Vente de Tokens",
  refund: "Remboursement",
  spend: "Dépense",
  reward: "Récompense",
  commission: "Commission",
  escrow: "Escrow",
  fee: "frais de mise en enchère",

};
const TransactionTable = ({ transactions, loading, showDetails }) => (
  loading ? <Skeleton active /> : (
    <Table
      dataSource={transactions}
      columns={[
        {
          title: 'Date',
          dataIndex: 'createdAt',
          key: 'createdAt',
          render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
          title: 'Type de transaction',
          dataIndex: 'type',
          key: 'type',
          render: (type) => (
            <Tag color={transactionColors[type] || transactionColors.default}>
              {transactionTypes[type] || "Type inconnu"}
            </Tag>
          ),
        },
        {
          title: 'Montant (GTC)',
          dataIndex: 'amount',
          key: 'amount',
          render: (amt) => `${amt.toFixed(2)} GTC`,
        },
        {
          title: 'Montant Réel (MGA)',
          dataIndex: 'saleAmount',
          key: 'saleAmount',
          render: (amt) => `${amt?.toLocaleString()} MGA` || 'N/A',
        },
        {
          title: 'Opérateur',
          dataIndex: 'operator',
          key: 'operator',
        },
        {
          title: 'Statut',
          dataIndex: 'success',
          key: 'success',
          render: (success) => (
            <Badge color={statusColors[success ? 'Réussie' : 'Échouée']} text={success ? 'Réussie' : 'Échouée'} />
          ),
        },
        {
          title: 'Actions',
          key: 'actions',
          render: (_, record) => (
            <Button type="link" onClick={() => showDetails(record)}>
              Détails
            </Button>
          ),
        },
      ]}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  )
);

const AdminTransactionHistory = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('daily');
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  



  const fetchTransactions = useCallback(async (type) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`/api/transactions/history?filterType=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setTransactions(data.transactions);
      } else {
        message.error('Erreur lors de la récupération des transactions.');
      }
    } catch (error) {
      message.error('Erreur serveur.');
    } finally {
      setLoading(false);
    }
  }, []);

  

  useEffect(() => {
    fetchTransactions(filterType);
  }, [filterType, fetchTransactions]);

  const filteredTransactions = transactions.filter((transaction) => {
    return (
      (!selectedType || transaction.type === selectedType) &&
      (!selectedStatus || transaction.success === (selectedStatus === "Réussie")) &&
      (!search || transaction.operator?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const showDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Historique des Transactions (${filterType})`, 10, 10);

    autoTable(doc, {
      startY: 20,
      head: [['Date', 'Type', 'Montant (GTC)', 'Montant (MGA)', 'Opérateur', 'Statut']],
      body: transactions.map(tx => [
        dayjs(tx.createdAt).format('DD/MM/YYYY HH:mm'),
        transactionTypes[tx.type] || "Type inconnu",
        `${tx.amount.toFixed(2)} GTC`,
        tx.saleAmount ? `${tx.saleAmount.toLocaleString()} MGA` : 'N/A',
        tx.operator || 'N/A',
        tx.success ? 'Réussie' : 'Échouée',
      ]),
    });

    doc.save(`Transactions_${filterType}_${dayjs().format('YYYYMMDD')}.pdf`);
  };


  return (
    <Box sx={{ padding: 4, backgroundColor: teal[50], minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ textAlign: 'center', color: teal[700], fontWeight: 'bold', marginBottom: 3 }}>
        Supervision des Transactions
      </Typography>
      
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
          <Input
            placeholder="Rechercher par opérateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filtrer par type"
            value={selectedType}
            onChange={setSelectedType}
            allowClear
            style={{ width: 200 }}
          >
            {Object.entries(transactionTypes).map(([key, label]) => (
              <Option key={key} value={key}>{label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Statut"
            value={selectedStatus}
            onChange={setSelectedStatus}
            allowClear
            style={{ width: 200 }}
          >
            <Option value="Réussie"><Tag color="green">Réussie</Tag></Option>
            <Option value="Échouée"><Tag color="red">Échouée</Tag></Option>
          </Select>

          <Button type="primary" onClick={exportPDF} style={{ backgroundColor: teal[700], borderColor: teal[700] }}>
            Télécharger PDF
          </Button>
        </div>

        <Tabs defaultActiveKey="daily" centered onChange={setFilterType}>
          <TabPane tab="Journalières" key="daily">
            <TransactionTable transactions={filteredTransactions} loading={loading} showDetails={showDetails} />
          </TabPane>
          <TabPane tab="Mensuelles" key="monthly">
            <TransactionTable transactions={filteredTransactions} loading={loading} showDetails={showDetails} />
          </TabPane>
          <TabPane tab="Annuelles" key="annual">
            <TransactionTable transactions={filteredTransactions} loading={loading} showDetails={showDetails} />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Détails de la Transaction"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedTransaction && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Date">{dayjs(selectedTransaction.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="Type">{transactionTypes[selectedTransaction.type]}</Descriptions.Item>
            <Descriptions.Item label="Montant">{selectedTransaction.amount} GTC</Descriptions.Item>
            <Descriptions.Item label="Montant Réel">{selectedTransaction.saleAmount} MGA</Descriptions.Item>
            <Descriptions.Item label="Opérateur">{selectedTransaction.operator || "Non spécifié"}</Descriptions.Item>
            <Descriptions.Item label="Utilisateur">
              {selectedTransaction.user?.name} ({selectedTransaction.user?.email})
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Badge color={statusColors[selectedTransaction.success ? "Réussie" : "Échouée"]} text={selectedTransaction.success ? "Réussie" : "Échouée"} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Box>
  );
};

export default AdminTransactionHistory;
