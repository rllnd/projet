import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Alert, 
  Table, 
  Tag, 
  Spin, 
  Select, 
  Pagination, 
  Image, 
  Button, 
  Modal 
} from 'antd';
import { 
  TrophyOutlined as TrophyIcon, 
  LoadingOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  IdcardOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import '../../styles/styles.css'; // Assurez-vous d'importer le fichier CSS

const { Option } = Select;

const EncheresGagnees = () => {
  const [encheres, setEncheres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchEncheresGagnees = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/auctions/won', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEncheres(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des enchères gagnées', error);
        setError('Impossible de charger les enchères gagnées');
      } finally {
        setLoading(false);
      }
    };
    fetchEncheresGagnees();
  }, []);

  const handleSellerClick = (seller) => {
    setSelectedSeller(seller);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Article',
      dataIndex: 'articleName',
      key: 'articleName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            width={50}
            src={record.imageUrl}
            alt={text}
            style={{ marginRight: '10px' }}
          />
          <Typography style={{ fontWeight: '600' }}>
            {text}
          </Typography>
        </div>
      ),
    },
    {
      title: 'Prix Final',
      dataIndex: 'currentHighestBid',
      key: 'currentHighestBid',
      render: (text) => <span>{text} GTC</span>,
    },
    {
      title: 'Date de Fin',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text) => <span>{new Date(text).toLocaleDateString()}</span>,
    },
    {
      title: 'Statut',
      key: 'status',
      render: () => (
        <Tag color="success" icon={<TrophyIcon />} >
          Gagné
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button type="link" onClick={() => handleSellerClick(record.seller)}>
          Détails Vendeur
        </Button>
      ),
    },
  ];

  const filterEncheres = () => {
    const filtered = encheres.filter((enchere) => {
      const endDate = new Date(enchere.endDate);
      const today = new Date();
      switch (filter) {
        case 'day':
          return endDate.toDateString() === today.toDateString();
        case 'month':
          return endDate.getMonth() === today.getMonth() && endDate.getFullYear() === today.getFullYear();
        case 'year':
          return endDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredEncheres = filterEncheres();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredEncheres.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ padding: '32px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        gutterBottom
        style={{
          color: '#2A9D8F',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '36px',
        }}
      >
        <TrophyIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Mes Enchères Remportées
      </Typography>

      <Select 
        defaultValue="all" 
        style={{ width: 120, marginBottom: '16px' }} 
        onChange={setFilter}
      >
        <Option value="all">Tout</Option>
        <Option value="day">Aujourd'hui</Option>
        <Option value="month">Ce Mois-ci</Option>
        <Option value="year">Cette Année</Option>
      </Select>

      {error && (
        <Alert message={error} type="error" style={{ marginBottom: '16px' }} />
      )}

      {loading ? (
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      ) : currentItems.length === 0 ? (
        <Typography variant="h6" style={{ textAlign: 'center', color: '#888' }}>
          Vous n'avez pas encore remporté d'enchères
        </Typography>
      ) : (
        <Table 
          dataSource={currentItems} 
          columns={columns} 
          rowKey="id" 
          pagination={false} 
          scroll={{ x: true }} 
        />
      )}

      <Pagination 
        current={currentPage} 
        pageSize={itemsPerPage} 
        total={filteredEncheres.length} 
        onChange={(page) => setCurrentPage(page)} 
        style={{ marginTop: '16px', textAlign: 'center' }} 
      />

      {/* Modal pour afficher les détails du vendeur */}
      <Modal
        title="Détails du Vendeur"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        bodyStyle={{ padding: '0' }} // Suppression de padding par défaut
      >
        <div className="modal-header">
          <Typography.Title level={4} className="modal-title">
            {selectedSeller?.name} {selectedSeller?.lastName}
          </Typography.Title>
        </div>
        <div className="modal-content">
          <Image
            width={100}
            src={selectedSeller?.profilePicture}
            alt="Photo de profil"
            className="profile-picture"
          />
          <Typography.Paragraph>
            <MailOutlined /> <strong>Email :</strong> {selectedSeller?.email}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <PhoneOutlined /> <strong>Téléphone :</strong> {selectedSeller?.phone}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <HomeOutlined /> <strong>Adresse :</strong> {selectedSeller?.address}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <IdcardOutlined /> <strong>CIN :</strong> {selectedSeller?.cin}
          </Typography.Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default EncheresGagnees;