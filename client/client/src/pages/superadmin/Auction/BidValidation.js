import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { Container, Typography, Box } from "@mui/material";
import axios from "axios";
import { teal } from "@mui/material/colors";

const API_URL = "http://localhost:5000/api";

const ConversionRateHistory = () => {
  const [historiqueTauxConversion, setHistoriqueTauxConversion] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchHistoriqueTauxConversion = async () => {
      try {
        const token = localStorage.getItem("token"); // Récupérer le token admin
        const response = await axios.get(`${API_URL}/conversion-rate/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setHistoriqueTauxConversion(response.data.rates);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique des taux :", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchHistoriqueTauxConversion();
  }, []);
  

  // Colonnes pour Ant Design Table
  const columns = [
    {
      title: "Date de mise à jour",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => {
        const date = new Date(text);
        return `${date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })} à ${date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      },
    },
    {
      title: "Devise source",
      dataIndex: "fromCurrency",
      key: "fromCurrency",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Devise cible",
      dataIndex: "toCurrency",
      key: "toCurrency",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Taux de conversion",
      dataIndex: "rate",
      key: "rate",
      render: (rate, record) => (
        <span style={{ color: "green", fontWeight: "bold" }}>
          1 {record.fromCurrency} = {rate} {record.toCurrency}
        </span>
      ),
    },
  ];
  
  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: "center", mb: 4, color: teal[700] }}>
        <Typography variant="h4">Historique des Taux de Conversion</Typography>
      </Box>
      <Table
        dataSource={historiqueTauxConversion}
        columns={columns}
        pagination={{ pageSize: 5 }}
        bordered
        loading={loading}
      />
    </Container>
  );
};

export default ConversionRateHistory;
