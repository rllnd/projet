import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { Container, Typography, Box } from "@mui/material";
import axios from "axios";
import { teal } from "@mui/material/colors";

const API_URL = "http://localhost:5000/api";

const ConversionRateRecent = () => {
  const [recentRates, setRecentRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentRates = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${API_URL}/conversion-rate/recent`,{
          headers: { Authorization: `Bearer ${token}` },
        }
        );
        setRecentRates(response.data.rates);
      } catch (error) {
        console.error("Erreur lors de la récupération des taux récents :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentRates();
  }, []);

  // Colonnes pour Ant Design Table
  const columns = [
    {
      title: "Date de mise à jour",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString("fr-FR"), // Format lisible
    },
    {
      title: "Taux de conversion",
      dataIndex: "rate",
      key: "rate",
      render: (rate) => <span style={{ fontWeight: "bold", color: "green" }}>1 GTC = {rate} MGA</span>,
    },
  ];

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: "center", mb: 3, color: teal[700] }}>
        <Typography variant="h5">Derniers Taux de Conversion</Typography>
      </Box>
      <Table
        dataSource={recentRates}
        columns={columns}
        pagination={false} // Pas de pagination car on affiche 5 éléments max
        bordered
        loading={loading}
      />
    </Container>
  );
};

export default ConversionRateRecent;
