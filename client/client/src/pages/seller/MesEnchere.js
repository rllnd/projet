import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Badge, Button } from 'react-bootstrap';
import { AiOutlineEdit, AiOutlineClose } from 'react-icons/ai';
import axios from 'axios';
import '../../styles/MyAuctions.css';

const MyAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/auctions/seller/auctions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuctions(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des enchères :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const handleEdit = (auctionId) => {
    console.log('Éditer enchère', auctionId);
  };

  const handleClose = (auctionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir clôturer cette enchère ?')) {
      console.log('Clôturer enchère', auctionId);
    }
  };

  if (loading) {
    return <p>Chargement des enchères...</p>;
  }

  return (
    <Container>
      <h2 className="my-4 mes">Mes Enchères</h2>
      {auctions.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nom de l'article</th>
              <th>Prix de départ</th>
              <th>Offre la plus élevée</th>
              <th>Participants</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((auction) => (
              <tr key={auction.id}>
                <td>
                  <Link to={`/auctions/${auction.id}`} className="auction-link">
                    {auction.article.name}
                  </Link>
                </td>
                <td>{auction.article.price} GTC</td>
                <td>{auction.currentHighestBid || 'Aucune offre'} GTC</td>
                <td>
                  <Badge bg="info">{auction.participants || '0'} participants</Badge>
                </td>
                <td>
                  <Badge bg={auction.status === 'open' ? 'success' : 'secondary'}>
                    {auction.status === 'open' ? 'Active' : 'Clôturée'}
                  </Badge>
                </td>
                <td>
                  <Button variant="primary" onClick={() => handleEdit(auction.id)} className="me-2">
                    <AiOutlineEdit /> Modifier
                  </Button>
                  <Button variant="danger" onClick={() => handleClose(auction.id)}>
                    <AiOutlineClose /> Clôturer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="error">Aucune enchère trouvée.</p>
      )}
    </Container>
  );
};

export default MyAuctions;
