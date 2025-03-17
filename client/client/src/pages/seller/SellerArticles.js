import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, Typography, Modal, Tooltip, Input, Button, Space, Tag, message, Grid
} from 'antd';
import { EditOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useMediaQuery } from '@mui/material';
import {teal} from '@mui/material/colors';
import { useSocket } from '../../contexts/SocketContext';
import { useMemo } from 'react'; // Assure-toi d'importer useMemo

const { TextArea } = Input;

const SellerArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    startPrice: '',
    shortDesc: '',
    fullDesc: '',
    endDate: '',
  });
  const [newImgFile, setNewImgFile] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);


  // Détecte les petits écrans
  const isMobile = useMediaQuery('(max-width:600px)');

  // Fetch Articles
    useEffect(() => {
      fetchArticles();
    
      if (socket) {
        socket.on("article-updated", (updatedArticle) => {
          console.log("🔄 Mise à jour de l'article (vendeur) :", updatedArticle);
    
          setArticles((prev) =>
            prev.map((article) =>
              article.id === updatedArticle.id
                ? { ...article, 
                    isAuctioned: updatedArticle.isAuctioned, 
                    isApproved: updatedArticle.isApproved, 
                    isRejected: updatedArticle.isRejected ?? article.isRejected,  
                    rejectReason: updatedArticle.rejectReason ?? article.rejectReason
                  }
                : article
            )
          );
        });
    
        socket.on("article-deleted", (articleId) => {
          console.log("🗑️ Suppression reçue en temps réel (Admin) :", articleId);
    
          setArticles((prev) => {
            const updatedArticles = prev.filter((article) => article.id !== articleId);
            console.log("✅ Après suppression (Admin), nombre d'articles restants :", updatedArticles.length);
            return [...updatedArticles]; // ✅ Forcer la mise à jour
          });
        });
    
    
        socket.on("article-created", (newArticle) => {
          console.log("🆕 Nouvel article reçu (Seller) :", newArticle);
    
          setArticles((prev) => {
            const exists = prev.some((article) => article.id === newArticle.id);
            return exists ? prev : [newArticle, ...prev]; // Ajoute l'article seulement s'il n'existe pas déjà
          });
        });

        


    
        return () => {
          socket.off("article-updated");
          socket.off("article-deleted");
          socket.off("article-created");
        };
      }
    }, [socket]);
    

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/articles/my-articles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des articles :", error);
      message.error('Erreur lors du chargement des articles.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
    setFormData({
      name: article.name,
      category: article.category?.name || '',
      startPrice: article.startPrice,
      shortDesc: article.shortDesc,
      fullDesc: article.fullDesc,
      endDate: article.endDate,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setArticles((prev) => prev.filter((article) => article.id !== id)); // ✅ Forcer un re-render
  
      if (socket) {
        socket.emit("article-deleted", id); // ✅ S'assurer que l'ID est bien envoyé
        console.log("🗑️ Événement WebSocket envoyé (Seller) : article-deleted", id);
      }
  
      message.success('Article supprimé avec succès.');
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article :", error);
      message.error('Échec de la suppression de l\'article.');
    }
  };
  

  const handleAuction = async (articleId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        message.error("Vous devez être connecté pour mettre un article en enchère.");
        return;
      }
  
      // 🔍 Récupérer les frais d'enchère (`auctionFee`) depuis l'API
      const response = await axios.get(`http://localhost:5000/api/platform/auction-get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const auctionFee = response.data.auctionFee; // 💰 Frais définis par l'admin
  
      // ✅ Afficher une confirmation avec le bon montant
      Modal.confirm({
        title: "Confirmer la mise en enchère",
        content: `Cette action coûtera ${auctionFee} GTC. Voulez-vous continuer ?`,
        okText: "Oui, payer et continuer",
        cancelText: "Annuler",
        onOk: async () => {
          try {
            await axios.post(
              `http://localhost:5000/api/auctions/create`, // ✅ Correction de l'URL (`/auctions/create` → `/auction/create`)
              { articleId },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            message.success("L'enchère a été créée avec succès !");
            fetchArticles(); // ✅ Mettre à jour la liste des articles après la mise en enchère
          } catch (error) {
            console.error("Erreur lors de la mise en enchère de l'article :", error);
            message.error(error.response?.data?.message || "Impossible de lancer l'enchère.");
          }
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des frais d'enchère :", error);
      message.error("Impossible de récupérer les frais d'enchère. Veuillez réessayer.");
    }
  };
  
  

  const handleModalSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('category', formData.category);
      formDataObj.append('startPrice', formData.startPrice);
      formDataObj.append('shortDesc', formData.shortDesc);
      formDataObj.append('fullDesc', formData.fullDesc);
      formDataObj.append('endDate', formData.endDate);
      if (newImgFile) formDataObj.append('imgFile', newImgFile);
      newGalleryFiles.forEach((file) => formDataObj.append(`galleryFiles`, file));

     // ✅ Forcer le statut "En attente" (`pending`) après modification si l'article était "Approuvé"
    if (selectedArticle.isApproved) {
      formDataObj.append('isApproved', false); // Annule l'approbation
      formDataObj.append('isRejected', false); // Remet l'article en attente
    }

      const response = await axios.put(`http://localhost:5000/api/articles/${selectedArticle.id}`, formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedArticle = response.data;
      
      message.success('Article mis à jour avec succès.');
       // 🔥 WebSocket : Diffuser la mise à jour à tous les vendeurs en temps réel
     if (socket) {
      socket.emit("article-updated", updatedArticle);
      console.log("🔄 Événement WebSocket envoyé : article-updated", updatedArticle);
    }

    // 🔄 Mettre à jour immédiatement l'article dans la liste
    setArticles((prev) =>
      prev.map((article) => (article.id === updatedArticle.id ? updatedArticle : article))
    );
      fetchArticles();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article :", error);
      message.error('Échec de la mise à jour de l\'article.');
    }
  };


  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      if (!article) return false;
      if (!article.isApproved && !article.isRejected) return true; // ✅ Articles en attente
      if (article.isApproved && !article.isAuctioned) return true;
      if (article.isAuctioned) return true;
      if (article.isRejected) return true;
      return false;
    });
  }, [articles]);
  
  console.log("📌 filteredArticles mis à jour :", filteredArticles);
  
  const columns = isMobile
  ? [
      {
        title: 'Titre',
        dataIndex: 'name',
        key: 'name',
        render: (name) => <strong>{name}</strong>,
      },
      {
        title: 'Prix',
        dataIndex: 'price',
        key: 'price',
        render: (price) => `${price} GTC`,
      },
      {
        title: 'Statut',
        key: 'status',
        render: (_, record) => (
          <Tag color={record.isRejected ? 'red' : record.isApproved ? 'green' : 'orange'}>
            {record.isRejected
              ? 'Rejeté'
              : record.isApproved
              ? record.isAuctioned
                ? 'En enchère'
                : 'Approuvé'
              : 'En attente'}
          </Tag>
        ),
      },

      
      
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ width: '100%' }} // Boutons prennent toute la largeur pour petits écrans
            >
              Modifier
            </Button>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
              style={{ width: '100%' }}
            >
              Supprimer
            </Button>
            {record.isApproved && !record.isAuctioned && (
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => handleAuction(record.id)}
                style={{ width: '100%' }}
              >
                Enchère
              </Button>
            )}
          </div>
        ),
      },
    ]
  : [
      {
        title: 'Titre',
        dataIndex: 'name',
        key: 'name',
        render: (name) => <strong>{name}</strong>,
      },
      {
        title: 'Catégorie',
        dataIndex: ['category', 'name'],
        key: 'category',
        render: (category) => category || 'Non spécifiée',
      },
      {
        title: 'Prix',
        dataIndex: 'price',
        key: 'price',
        render: (price) => `${price} GTC`,
      },
      {
        title: 'Statut',
        key: 'status',
        render: (_, record) => (
          <Tag color={record.isRejected ? 'red' : record.isApproved ? 'green' : 'orange'}>
            {record.isRejected
              ? 'Rejeté'
              : record.isApproved
              ? record.isAuctioned
                ? 'En enchère'
                : 'Approuvé'
              : 'En attente'}
          </Tag>
        ),
      },
      {
        title: 'Raison du Rejet',
        key: 'rejectReason',
        render: (_, record) => (
          record.isRejected ? (
            <Tooltip title={record.rejectReason}>
              <Typography.Text
                ellipsis={{ tooltip: record.rejectReason }}
                style={{
                  maxWidth: isMobile ? '100px' : '150px', // Largeur adaptative selon l'écran
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'red', // Met en évidence avec une couleur rouge
                }}
              >
                {record.rejectReason || 'Non spécifiée'}
              </Typography.Text>
            </Tooltip>
          ) : (
            <Typography.Text type="secondary">
              N/A
            </Typography.Text>
          )
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Modifier
            </Button>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            >
              Supprimer
            </Button>
            {record.isApproved && !record.isAuctioned && (
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => handleAuction(record.id)}
              >
                Enchère
              </Button>
            )}
          </Space>
        ),
      },
    ];

return (
  <div style={{ padding: '1rem' }}>
    <Typography.Title level={isMobile ? 4 : 3} style={{ textAlign: 'center', color: teal[600] }}>
      Mes Articles
    </Typography.Title>
    <Table 
       dataSource={filteredArticles}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      style={{ maxWidth: '100%', margin: 'auto' }}
    />

    <Modal
      title="Modifier l'Article"
      visible={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      onOk={handleModalSubmit}
      okText="Enregistrer"
      cancelText="Annuler"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="Titre"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          placeholder="Catégorie"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
        <Input
          placeholder="Prix"
          type="number"
          value={formData.startPrice}
          onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
        />
        <TextArea
          placeholder="Description courte"
          value={formData.shortDesc}
          onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
          rows={2}
        />
        <TextArea
          placeholder="Description complète"
          value={formData.fullDesc}
          onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
          rows={4}
        />
        <Input
          placeholder="Date de fin"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        />
      </Space>
    </Modal>
  </div>
);

};

export default SellerArticles;
