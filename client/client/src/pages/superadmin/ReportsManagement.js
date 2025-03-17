import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress, Skeleton 
} from '@mui/material';
import { Tag, Tooltip } from 'antd';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { useMediaQuery } from '@mui/material';

const actionDescriptions = {
  "POST /api/admins": "Ajout d'un administrateur",
  "DELETE /api/admins/:id": "Supprimer un admin",
  "PUT /api/admins/:id": "Mise à jour d'un administrateur",
  "DELETE /api/users/:id": "Supprimer un utilisateur",
  "PUT /api/articles/:id/publish": "Publier un article",
  "PUT /api/articles/:id/approve": "Approuver un article",
  "PUT /api/articles/:id/reject": "Rejet d'un article",
  "PUT /api/auctions/stop/:id": "Arrêter une enchère",
  "PUT /api/auctions/cancel/:id": "Annuler une enchère",
  "DELETE /api/messages/:id": "Supprimer un message",
  "POST /api/create": "Ajout d'une catégorie",
  "PUT /api/categories/:id": "Changer une catégorie",
  "DELETE /api/categories/:id": "Supprimer une catégorie",
  "PUT /api/platform/update-sale-limits": "Limiter vente de Token",
  "PUT /api/platform/update-purchase-limits": "Limiter achat de Token",
  "DELETE /api/superadmin/users/:id":"Supprimer un utilisateur",
  "PUT /api/conversion-rate/update":"Changer Taux de Conversion", 
  "PUT /api/superadmin/auctions/cancel/:id": "Annuler une enchère", 
  "POST /api/faqs": "Ajouter une FAQ",
  "PUT /api/faqs/:id": "Mise à jour d'une FAQ",
  "DELETE /api/faqs/:id": "Supprimer une FAQ",
  "PUT /api/conversion/update": "changer taux de conversion",
};

const getActionDescription = (action) => {
  for (const key in actionDescriptions) {
    const regex = new RegExp(`^${key.replace(/:\w+/g, "\\d+")}$`);
    if (regex.test(action) || action.startsWith(key.replace(/:\w+/g, ""))) {
      const idMatch = action.match(/\/(\d+)$/);
      const id = idMatch ? idMatch[1] : null;
      return id ? `${actionDescriptions[key]} (ID: ${id})` : actionDescriptions[key];
    }
  }
  return action;
};

const getTagColor = (action) => {
  if (action.startsWith("POST")) return "green";
  if (action.startsWith("DELETE")) return "red";
  if (action.startsWith("PUT")) return "blue";
  return "default";
};

const AdminAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const isMobile = useMediaQuery('(max-width:592px)');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/audit/get');
        setLogs(response.data.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des logs :", error);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/audit/generate', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'rapport_audit.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur lors du téléchargement du rapport :", error);
    }
    setDownloading(false);
  };

  const formatDetails = (details) => {
    if (!details || details.trim() === "" || details === "{}" || details === "null") {
      return <span style={{ color: "gray" }}>Aucun détail fourni</span>;
    }
  
    try {
      const parsedDetails = JSON.parse(details);
      
      if (typeof parsedDetails === "object" && Object.keys(parsedDetails).length === 0) {
        return <span style={{ color: "gray" }}>Aucune information spécifique enregistrée</span>;
      }
  
      return (
        <ul style={{
          backgroundColor: "#f9f9f9",
          padding: "8px",
          borderRadius: "5px",
          listStyleType: "none"
        }}>
          {Object.entries(parsedDetails).map(([key, value], index) => (
            <li key={index}>
              <strong>{key.replace(/_/g, " ")} :</strong> {value}
            </li>
          ))}
        </ul>
      );
  
    } catch (error) {
      return <span style={{ color: "red" }}>⚠️ Erreur d'affichage des détails</span>;
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
        Historique des Audits
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<DownloadIcon />}
        onClick={handleDownloadReport}
        disabled={downloading}
        sx={{ marginBottom: 2 }}
      >
        {downloading ? <CircularProgress size={18} color="inherit" /> : "Télécharger le Rapport"}
      </Button>

      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={200} />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976D2" }}>
              <TableRow>
                {isMobile ? (
                  <>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nom Admin</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Action</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nom Admin</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Action</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Détails</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  {isMobile ? (
                    <>
                      <TableCell>{log.adminName}</TableCell>
                      <TableCell>
                        <Tooltip title={log.action}>
                          <Tag color={getTagColor(log.action)}>
                            {getActionDescription(log.action)}
                          </Tag>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>{log.adminName}</TableCell>
                      <TableCell>
                        <Tooltip title={log.action}>
                          <Tag color={getTagColor(log.action)}>
                            {getActionDescription(log.action)}
                          </Tag>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {log.details && log.details !== "{}" ? (
                          <>{formatDetails(log.details)}</>
                        ) : (
                          <span style={{ color: "gray" }}>Aucun détail disponible</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminAudit;