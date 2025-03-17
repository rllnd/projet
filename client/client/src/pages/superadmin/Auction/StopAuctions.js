import React, { useEffect, useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Input,
    Divider,
    CircularProgress,
    useMediaQuery,
    Grid,
    Select,
    MenuItem,
} from '@mui/material';
import { teal } from '@mui/material/colors';
import { Pagination as AntPagination, notification } from 'antd';
import axios from '../../../assets/axiosConfig';

const ClosedAuctions = () => {
    const [auctions, setAuctions] = useState([]);
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [auctionsPerPage] = useState(5);
    const [loading, setLoading] = useState(false);
    const [sortCriteria, setSortCriteria] = useState('day'); // Critère de tri
    const isSmallScreen = useMediaQuery('(max-width:600px)');

    // Notifications helper
    const openNotification = (type, message) => {
        notification[type]({
            message: message,
            duration: 2,
        });
    };

    useEffect(() => {
        const fetchClosedAuctions = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/auctions/closed', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAuctions(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des enchères fermées :", error);
                openNotification('error', 'Erreur lors du chargement des enchères.');
            } finally {
                setLoading(false);
            }
        };
        fetchClosedAuctions();
    }, []);

    const filteredAuctions = auctions.filter(auction => 
        auction.articleDetails?.name.toLowerCase().includes(filter.toLowerCase())
    );

    // Fonction de tri
    const sortAuctions = (auctions) => {
        return auctions.sort((a, b) => {
            const dateA = new Date(a.endDate);
            const dateB = new Date(b.endDate);
            if (sortCriteria === 'day') {
                return dateA - dateB; // Tri par jour
            } else if (sortCriteria === 'month') {
                return dateA.getMonth() - dateB.getMonth() || dateA.getFullYear() - dateB.getFullYear();
            } else if (sortCriteria === 'year') {
                return dateA.getFullYear() - dateB.getFullYear();
            }
            return 0;
        });
    };

    const displayedAuctions = sortAuctions(filteredAuctions).slice(
        (page - 1) * auctionsPerPage,
        page * auctionsPerPage
    );

    return (
        <Box p={3} sx={{ backgroundColor: teal[50], minHeight: '100vh' }}>
            <Typography variant="h4" gutterBottom color={teal[700]} align="center" fontWeight="bold">
                Liste des Enchères Fermées
            </Typography>

            <Divider sx={{ mb: 3, backgroundColor: teal[300] }} />

            <Grid container justifyContent="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={8} md={6}>
                    <Input 
                        placeholder="Rechercher par titre"
                        onChange={e => setFilter(e.target.value)}
                        style={{ marginBottom: '1rem', padding: '10px', borderRadius: '4px', width: '100%' }}
                    />
                </Grid>
            </Grid>

            <Grid container justifyContent="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4} md={3}>
                    <Select
                        value={sortCriteria}
                        onChange={e => setSortCriteria(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="day">Trier par Jour</MenuItem>
                        <MenuItem value="month">Trier par Mois</MenuItem>
                        <MenuItem value="year">Trier par Année</MenuItem>
                    </Select>
                </Grid>
            </Grid>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: teal[500] }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Titre</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix Final</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Catégorie</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acheteur</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date de Fin</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedAuctions.map((auction) => (
                                <TableRow key={auction.id}>
                                    <TableCell>
                                        <Typography variant="body1" fontWeight="bold">
                                            {auction.articleDetails?.name || 'Non disponible'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{auction.currentHighestBid || 0} GTC</TableCell>
                                    <TableCell>{auction.articleDetails?.category?.name || 'Non disponible'}</TableCell>
                                    <TableCell>{auction.highestBidder?.name || 'Non disponible'}</TableCell>
                                    <TableCell>{new Date(auction.endDate).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                            {displayedAuctions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="textSecondary">Aucune enchère fermée pour le moment.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Box mt={2} display="flex" justifyContent="center">
                <AntPagination
                    current={page}
                    pageSize={auctionsPerPage}
                    total={filteredAuctions.length}
                    onChange={(page) => setPage(page)}
                    showSizeChanger={false}
                    style={{ padding: '20px' }} // Ajout d'un style pour le padding
                />
            </Box>
        </Box>
    );
};

export default ClosedAuctions;