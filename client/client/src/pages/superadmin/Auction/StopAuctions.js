import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { teal } from '@mui/material/colors';

const ClosedAuctions = () => {
    const [auctions, setAuctions] = useState([]);

    useEffect(() => {
        fetchClosedAuctions();
    }, []);

    const fetchClosedAuctions = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/auctions/closed', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAuctions(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des enchères fermées :", error);
        }
    };

    return (
        <TableContainer component={Paper} sx={{ marginBottom: '2rem', maxWidth: '90%', margin: 'auto' }}>
            <Typography variant="h4" align="center" gutterBottom color={teal[700]}>
                <strong>Enchères Fermées</strong>
            </Typography>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: teal[500] }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Titre</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix Final</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Catégorie</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date de Fin</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {auctions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                <Typography color="textSecondary">Aucune enchère fermée pour le moment.</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        auctions.map((auction) => (
                            <TableRow key={auction.id}>
                                <TableCell>{auction.articleDetails?.name || 'Non disponible'}</TableCell>
                                <TableCell>{auction.currentHighestBid || 0} GTC</TableCell>
                                <TableCell>{auction.articleDetails?.category || 'Non disponible'}</TableCell>
                                <TableCell>{new Date(auction.endDate).toLocaleString()}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ClosedAuctions;
