import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Button, Divider, MenuItem, Select, FormControl, Grid } from "@mui/material"; 
import { Input, Spin, message, Table as AntTable, Pagination } from "antd"; 
import { teal } from "@mui/material/colors"; 

const SellerDeliveries = ({ userId }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [trackingNumbers, setTrackingNumbers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Erreur : Vous devez être connecté.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/deliveries/users/${userId}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDeliveries(Array.isArray(response.data) ? response.data : []);
      setFilteredDeliveries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError("Erreur lors du chargement des livraisons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDeliveries();
    }
  }, [userId]);

  useEffect(() => {
    let filtered = deliveries;

    if (dateFilter) {
      const today = new Date();
      if (dateFilter === "day") {
          filtered = filtered.filter(delivery => new Date(delivery.createdAt).toDateString() === today.toDateString());
      } else if (dateFilter === "month") {
          filtered = filtered.filter(delivery => {
              const deliveryDate = new Date(delivery.createdAt);
              return deliveryDate.getMonth() === today.getMonth() && deliveryDate.getFullYear() === today.getFullYear();
          });
      } else if (dateFilter === "year") {
          filtered = filtered.filter(delivery => new Date(delivery.createdAt).getFullYear() === today.getFullYear());
      }
    }

    if (statusFilter) {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }

    setFilteredDeliveries(filtered);
  }, [deliveries, dateFilter, statusFilter]);

  const handleTrackingChange = (deliveryId, value) => {
    setTrackingNumbers((prev) => ({ ...prev, [deliveryId]: value }));
  };

  const markAsShipped = async (deliveryId) => {
    if (!trackingNumbers[deliveryId]) {
      message.error("Veuillez entrer un numéro de suivi !");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/deliveries/ship/${deliveryId}`, {
        trackingNumber: trackingNumbers[deliveryId],
      });

      message.success("Article marqué comme expédié !");
      fetchDeliveries();
    } catch (error) {
      message.error("Erreur lors de la mise à jour.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return { color: "#D32F2F", backgroundColor: "#FFCDD2" };
      case "shipped":
        return { color: "#1976D2", backgroundColor: "#BBDEFB" };
      case "delivered":
        return { color: "#388E3C", backgroundColor: "#C8E6C9" };
      default:
        return { color: "#616161", backgroundColor: "#E0E0E0" };
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "shipped":
        return "Expédié";
      case "delivered":
        return "Livré";
      default:
        return "Statut inconnu";
    }
  };

  if (loading) return <Spin tip="Chargement..." />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px", overflowX: "auto" }}>
      <Typography variant="h5" sx={{ marginBottom: 2, color: teal[600] }}>📦 Mes Livraisons</Typography>
      <Divider sx={{ marginBottom: 2 }} />

      <Box sx={{ marginBottom: "16px" }}>
        <FormControl variant="outlined" sx={{ marginRight: 2 }}>
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Aucune date</MenuItem>
            <MenuItem value="day">Aujourd'hui</MenuItem>
            <MenuItem value="month">Ce mois-ci</MenuItem>
            <MenuItem value="year">Cette année</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Tous les statuts</MenuItem>
            <MenuItem value="pending">En attente</MenuItem>
            <MenuItem value="shipped">Expédié</MenuItem>
            <MenuItem value="delivered">Livré</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredDeliveries.length === 0 ? (
        <Typography>Aucune livraison correspondante à vos filtres.</Typography>
      ) : (
        <>
          {/* Affichage en Grid pour les petits écrans */}
          <Grid container spacing={2} display={{ xs: 'flex', sm: 'none' }}>
            {filteredDeliveries.map(delivery => (
              <Grid item xs={12} key={delivery.id} sx={{ padding: 2, border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {delivery.auction?.articleDetails?.name || "Non spécifié"}
                </Typography>
                <Typography>Acheteur : {delivery.buyer?.name || "Non spécifié"}</Typography>
                <span style={getStatusStyle(delivery.status)}>{translateStatus(delivery.status)}</span>
                <Typography>Numéro de Suivi : {delivery.trackingNumber || "Non disponible"}</Typography>
                <Typography>Adresse : {delivery.buyer?.address || "Non spécifiée"}</Typography>
                {delivery.status === "pending" && (
                  <>
                    <Input placeholder="Numéro de suivi" onChange={(e) => handleTrackingChange(delivery.id, e.target.value)} />
                    <Button
                      sx={{ backgroundColor: teal[500], color: "white", textTransform: 'none', marginTop: 1 }}
                      onClick={() => markAsShipped(delivery.id)}
                    >
                      Marquer comme expédié
                    </Button>
                  </>
                )}
              </Grid>
            ))}
          </Grid>

          {/* Affichage en tableau pour les écrans plus grands */}
          <Grid container spacing={2} display={{ xs: 'none', sm: 'flex' }}>
            <AntTable
              dataSource={filteredDeliveries.slice((page - 1) * rowsPerPage, page * rowsPerPage)}
              columns={[
                {
                  title: "Article",
                  dataIndex: "article",
                  render: (text, delivery) => (
                    <strong>{delivery.auction?.articleDetails?.name || "Non spécifié"}</strong>
                  ),
                },
                { title: "Acheteur", dataIndex: "buyer", render: (text, delivery) => delivery.buyer?.name || "Non spécifié" },
                { title: "Statut", dataIndex: "status", render: (text, delivery) => <span style={getStatusStyle(delivery.status)}>{translateStatus(delivery.status)}</span> },
                {
                  title: "Numéro de Suivi",
                  dataIndex: "trackingNumber",
                  render: (text, delivery) =>
                    delivery.status === "pending" ? (
                      <Input placeholder="Numéro de suivi" onChange={(e) => handleTrackingChange(delivery.id, e.target.value)} />
                    ) : (
                      delivery.trackingNumber || "Non disponible"
                    ),
                },
                {
                  title: "Adresse de l'Acheteur",
                  dataIndex: "buyerAddress",
                  render: (text, delivery) => (
                    <Typography>{delivery.buyer?.address || "Non spécifiée"}</Typography>
                  ),
                },
                {
                  title: "Action",
                  dataIndex: "action",
                  render: (text, delivery) => (
                    delivery.status === "pending" ? (
                      <Button
                        sx={{ backgroundColor: teal[500], color: "white", textTransform: 'none' }}
                        onClick={() => markAsShipped(delivery.id)}
                      >
                        Marquer comme expédié
                      </Button>
                    ) : null
                  ),
                },
              ]}
              rowKey="id"
              pagination={false}
              scroll={{ x: 600 }}
              style={{ width: '100%' }}  // Assurez-vous que le tableau utilise toute la largeur disponible.
            />
          </Grid>
        </>
      )}
      <Pagination current={page} pageSize={rowsPerPage} total={filteredDeliveries.length} onChange={setPage} />
    </Box>
  );
};

export default SellerDeliveries;