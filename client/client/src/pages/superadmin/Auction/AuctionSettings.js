import React, { useState, useEffect } from "react";
import {
  Typography,
  Alert,
  Container,
} from "@mui/material";
import { Card, Input, Button, Spin, Row, Col } from "antd";
import { TrophyOutlined } from "@ant-design/icons"; // Icône valide pour les enchères
import axios from "axios";
import { teal } from "@mui/material/colors";

const API_URL = "http://localhost:5000/api";

const AuctionSettings = () => {
  const [auctionFee, setAuctionFee] = useState(null);
  const [newAuctionFee, setNewAuctionFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAuctionFee = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token manquant ou invalide. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/platform/auction-get`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAuctionFee(response.data.auctionFee);
      } catch (err) {
        console.error("Erreur lors de la récupération des frais d'enchère :", err);
        setError("Erreur lors de la récupération des frais d'enchère.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionFee();
  }, []);

  const handleUpdateAuctionFee = async () => {
    if (!newAuctionFee || newAuctionFee <= 0) {
      setError("Veuillez entrer des frais d'enchère valides.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/platform/auction-fee`,
        { auctionFee: parseFloat(newAuctionFee) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAuctionFee(newAuctionFee);
      setSuccess("Frais d'enchère mis à jour avec succès.");
      setNewAuctionFee("");
    } catch (err) {
      console.error("Erreur lors de la mise à jour des frais d'enchère :", err);
      setError("Erreur lors de la mise à jour des frais d'enchère.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography
        variant="h4"
        sx={{ color: teal[700], fontWeight: "bold", textAlign: "center", mb: 4 }}
      >
        Paramètres des Enchères
      </Typography>

      <Spin spinning={loading}>
        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Row gutter={[16, 16]} justify="center">
          {/* Section des frais d'enchère */}
          <Col xs={24} sm={12} md={8}>
            <Card
              title={<><TrophyOutlined /> Frais d'Enchère</>}
              bordered={false}
              style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
            >
              <Typography variant="h6">
                Frais actuels : {auctionFee ?? "Non défini"} GTC
              </Typography>
              <Input
                placeholder="Nouveaux Frais d'Enchère"
                value={newAuctionFee}
                onChange={(e) => setNewAuctionFee(e.target.value)}
                type="number"
              />
              <Button
                type="primary"
                onClick={handleUpdateAuctionFee}
                style={{ marginTop: 16, backgroundColor: teal[700] }}
              >
                Mettre à jour
              </Button>
            </Card>
          </Col>
        </Row>
      </Spin>
    </Container>
  );
};

export default AuctionSettings;
