import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Select,
  MenuItem,
  Grid,
} from "@mui/material"; 
import { teal, red, blue, grey } from '@mui/material/colors'; 
import { message } from "antd"; 

const BuyerDeliveries = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmationCodes, setConfirmationCodes] = useState({});
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      if (!token) {
        message.error("Erreur : Vous devez être connecté.");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/deliveries/users/me/purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPurchases(response.data);
    } catch (error) {
      message.error("Erreur lors du chargement des achats.");
      console.error("Erreur lors du chargement des achats :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleConfirmationCodeChange = (deliveryId, value) => {
    setConfirmationCodes((prev) => ({ ...prev, [deliveryId]: value }));
  };

  const confirmReception = async (deliveryId) => {
    if (!confirmationCodes[deliveryId]) {
      message.error("Veuillez entrer votre code de confirmation !");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `http://localhost:5000/api/deliveries/confirm/${deliveryId}`,
        { codeUnique: confirmationCodes[deliveryId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Réception confirmée ! 🎉");
      fetchPurchases();
    } catch (error) {
      message.error("Erreur lors de la confirmation.");
      console.error("Erreur lors de la confirmation :", error);
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "pending":
        return { text: "En attente", color: red[500] };
      case "shipped":
        return { text: "Expédié", color: blue[500] };
      case "delivered":
        return { text: "Livré", color: teal[500] };
      default:
        return { text: "Statut inconnu", color: grey[600] };
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const statusMatch = statusFilter === "all" || purchase.status === statusFilter;

    // Filtre de date
    const today = new Date();
    let dateMatch = true;

    if (dateFilter === "day") {
      dateMatch = new Date(purchase.createdAt).toDateString() === today.toDateString();
    } else if (dateFilter === "month") {
      dateMatch = new Date(purchase.createdAt).getMonth() === today.getMonth() && new Date(purchase.createdAt).getFullYear() === today.getFullYear();
    } else if (dateFilter === "year") {
      dateMatch = new Date(purchase.createdAt).getFullYear() === today.getFullYear();
    }

    return statusMatch && dateMatch;
  });

  const purchasesToDisplay = filteredPurchases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const confirmAddress = (deliveryId) => {
    message.success("Votre adresse a été confirmée !");
    setAddressConfirmed(true);
  };

  if (loading) return <Typography>Chargement...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: "20px", backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <Typography variant="h5" sx={{ marginBottom: "20px", color: teal[600] }}>📦 Mes Achats</Typography>

      {/* Filtre de statut et de date */}
      <Box sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 120, marginRight: 2 }}
        >
          <MenuItem value="all">Tous les statuts</MenuItem>
          <MenuItem value="pending">En attente</MenuItem>
          <MenuItem value="shipped">Expédié</MenuItem>
          <MenuItem value="delivered">Livré</MenuItem>
        </Select>

        <Select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">Toutes les dates</MenuItem>
          <MenuItem value="day">Aujourd'hui</MenuItem>
          <MenuItem value="month">Ce mois-ci</MenuItem>
          <MenuItem value="year">Cette année</MenuItem>
        </Select>
      </Box>

      {/* Utiliser Grid pour les écrans petits */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }} display={{ xs: 'flex', sm: 'none' }}>
        {purchasesToDisplay.map((purchase) => (
          <Grid item xs={12} key={purchase.id} sx={{ border: '1px solid #ccc', borderRadius: '4px', padding: '10px', marginBottom: '10px' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {purchase.auction?.articleDetails?.name || "Non spécifié"}
            </Typography>
            <Typography>{purchase.seller?.name || "Non spécifié"}</Typography>
            <Box sx={{ padding: '2px 5px', border: `1px solid ${translateStatus(purchase.status).color}`, borderRadius: '4px', display: 'inline-block' }}>
              <Typography sx={{ color: translateStatus(purchase.status).color }}>{translateStatus(purchase.status).text}</Typography>
            </Box>
            <Typography>{purchase.trackingNumber || "Non disponible"}</Typography>
            <Typography>{purchase.address || "Non spécifiée"}</Typography>
            {purchase.status === "shipped" && !addressConfirmed && (
              <Button 
                variant="contained" 
                sx={{ backgroundColor: teal[500], color: "white", marginTop: 1, textTransform: 'none' }} 
                onClick={() => confirmAddress(purchase.id)}
              >
                Confirmer l'adresse
              </Button>
            )}
            {addressConfirmed && <Typography color="green">Adresse confirmée.</Typography>}
            {purchase.status === "shipped" && (
              <>
                <TextField
                  size="small"
                  placeholder="Code de confirmation"
                  onChange={(e) => handleConfirmationCodeChange(purchase.id, e.target.value)}
                  sx={{ width: '100%', marginTop: 1 }}
                />
                <Button
                  variant="contained"
                  sx={{ backgroundColor: teal[500], color: "white", marginTop: 1, textTransform: 'none' }}
                  onClick={() => confirmReception(purchase.id)}
                >
                  Confirmer réception
                </Button>
              </>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Utiliser Table pour les écrans plus grands */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Table>
          <TableHead sx={{ backgroundColor: teal[600] }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Article</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vendeur</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Numéro de Suivi</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Adresse</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Code de Confirmation</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchasesToDisplay.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {purchase.auction?.articleDetails?.name || "Non spécifié"}
                  </Typography>
                </TableCell>
                <TableCell>{purchase.seller?.name || "Non spécifié"}</TableCell>
                <TableCell>
                  <Box sx={{ padding: '2px 5px', border: `1px solid ${translateStatus(purchase.status).color}`, borderRadius: '4px', display: 'inline-block' }}>
                    <Typography sx={{ color: translateStatus(purchase.status).color }}>{translateStatus(purchase.status).text}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{purchase.trackingNumber || "Non disponible"}</TableCell>
                <TableCell>{purchase.address || "Non spécifiée"}</TableCell>
                <TableCell>
                  {purchase.status === "shipped" ? (
                    <TextField
                      size="small"
                      placeholder="Code de confirmation"
                      onChange={(e) => handleConfirmationCodeChange(purchase.id, e.target.value)}
                      sx={{ width: '100%' }}
                    />
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {purchase.status === "shipped" && (
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: teal[500], color: "white", textTransform: 'none' }}
                      onClick={() => confirmReception(purchase.id)}
                    >
                      Confirmer réception
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredPurchases.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
};

export default BuyerDeliveries;