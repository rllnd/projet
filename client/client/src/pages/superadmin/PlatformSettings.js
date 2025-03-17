import React, { useState, useEffect } from "react";
import {
  Typography,
  Alert,
  Container,
} from "@mui/material";
import { Card, Input, Button, Spin, Space, Row, Col } from "antd"; // Ant Design Components
import {
  DollarOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
} from "@ant-design/icons"; // Ant Design Icons
import axios from "axios";
import { teal } from "@mui/material/colors";

const API_URL = "http://localhost:5000/api";

const AdminSettings = () => {
  const [conversionRate, setConversionRate] = useState(null);
  const [newRate, setNewRate] = useState("");
  const [minPurchaseLimit, setMinPurchaseLimit] = useState("");
  const [maxPurchaseLimit, setMaxPurchaseLimit] = useState("");
  const [currentMinPurchaseLimit, setCurrentMinPurchaseLimit] = useState(null);
  const [currentMaxPurchaseLimit, setCurrentMaxPurchaseLimit] = useState(null);
  const [minSaleLimit, setMinSaleLimit] = useState("");
  const [maxSaleLimit, setMaxSaleLimit] = useState("");
  const [currentMinSaleLimit, setCurrentMinSaleLimit] = useState(null);
  const [currentMaxSaleLimit, setCurrentMaxSaleLimit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token manquant ou invalide. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      try {
        const [rateResponse, limitsResponse] = await Promise.all([
          axios.get(`${API_URL}/conversion-rate/rate`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/platform/limits`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setConversionRate(rateResponse.data.rate);
        setCurrentMinPurchaseLimit(limitsResponse.data.purchaseLimits?.min ?? "Non défini");
        setCurrentMaxPurchaseLimit(limitsResponse.data.purchaseLimits?.max ?? "Non défini");
        setCurrentMinSaleLimit(limitsResponse.data.saleLimits?.min ?? "Non défini");
        setCurrentMaxSaleLimit(limitsResponse.data.saleLimits?.max ?? "Non défini");
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setError("Erreur lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateRate = async () => {
    if (!newRate || newRate <= 0) {
      setError("Veuillez entrer un taux valide.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/conversion-rate/update`,
        { rate: parseFloat(newRate) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversionRate(newRate);
      setSuccess("Taux de conversion mis à jour avec succès.");
      setNewRate("");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du taux de conversion :", err);
      setError("Erreur lors de la mise à jour du taux de conversion.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePurchaseLimits = async () => {
    if (
      (minPurchaseLimit && minPurchaseLimit < 0) ||
      (maxPurchaseLimit && maxPurchaseLimit < 0)
    ) {
      setError("Les limites d'achat doivent être des nombres positifs.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/platform/update-purchase-limits`,
        {
          minPurchaseLimit: parseFloat(minPurchaseLimit),
          maxPurchaseLimit: parseFloat(maxPurchaseLimit),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Limites d'achat mises à jour avec succès.");
    } catch (err) {
      console.error("Erreur lors de la mise à jour des limites d'achat :", err);
      setError("Erreur lors de la mise à jour des limites d'achat.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSaleLimits = async () => {
    if (
      (minSaleLimit && minSaleLimit < 0) ||
      (maxSaleLimit && maxSaleLimit < 0)
    ) {
      setError("Les limites de vente doivent être des nombres positifs.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/platform/update-sale-limits`,
        {
          minSaleLimit: parseFloat(minSaleLimit),
          maxSaleLimit: parseFloat(maxSaleLimit),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Limites de vente mises à jour avec succès.");
    } catch (err) {
      console.error("Erreur lors de la mise à jour des limites de vente :", err);
      setError("Erreur lors de la mise à jour des limites de vente.");
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
        Paramètres Administratifs
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

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card
              title={<><DollarOutlined /> Taux de Conversion</>}
              bordered={false}
              style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
            >
              <Typography variant="h6">
                Taux actuel : {conversionRate ?? "Non défini"} MGA/GTC
              </Typography>
              <Input
                placeholder="Nouveau Taux de Conversion"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                type="number"
              />
              <Button type="primary" onClick={handleUpdateRate} style={{ marginTop: 16, backgroundColor:teal[700] }}>
                Mettre à jour
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              title={<><ShoppingCartOutlined /> Limites d'Achat</>}
              bordered={false}
              style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
            >
              <Typography  sx={{ color: 'black'}}>Minimum : {currentMinPurchaseLimit} GTC</Typography>
              <Typography sx={{ color: 'black'}}>Maximum : {currentMaxPurchaseLimit} GTC</Typography>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                  placeholder="Limite Minimum"
                  value={minPurchaseLimit}
                  onChange={(e) => setMinPurchaseLimit(e.target.value)}
                  type="number"
                />
                <Input
                  placeholder="Limite Maximum"
                  value={maxPurchaseLimit}
                  onChange={(e) => setMaxPurchaseLimit(e.target.value)}
                  type="number"
                />
              </Space>
              <Button type="primary" onClick={handleUpdatePurchaseLimits} style={{ marginTop: 16, backgroundColor:teal[700] }}>
                Mettre à jour
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              title={<><WalletOutlined /> Limites de Vente</>}
              bordered={false}
              style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
            >
              <Typography sx={{ color: 'black'}}>Minimum : {currentMinSaleLimit} GTC</Typography>
              <Typography sx={{ color: 'black'}}>Maximum : {currentMaxSaleLimit} GTC</Typography>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                  placeholder="Limite Minimum"
                  value={minSaleLimit}
                  onChange={(e) => setMinSaleLimit(e.target.value)}
                  type="number"
                />
                <Input
                  placeholder="Limite Maximum"
                  value={maxSaleLimit}
                  onChange={(e) => setMaxSaleLimit(e.target.value)}
                  type="number"
                />
              </Space>
              <Button
                type="primary"
                onClick={handleUpdateSaleLimits}
                style={{ marginTop: 16, backgroundColor:teal[700] }}
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

export default AdminSettings;

