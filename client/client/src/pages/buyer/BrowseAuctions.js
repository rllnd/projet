import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import products from '../../assets/data/products'; // Importation des données produits/enchères
import '../../styles/BrowseAuctions.css';

const BrowseAuctions = () => {
    const [auctions, setAuctions] = useState([]);
    const [filteredAuctions, setFilteredAuctions] = useState([]);
    const [category, setCategory] = useState('all');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Charger les enchères depuis les données disponibles et initialiser les catégories
        setAuctions(products);
        setFilteredAuctions(products);

        // Extraire les catégories uniques pour les options du filtre
        const uniqueCategories = ['all', ...new Set(products.map((product) => product.category))];
        setCategories(uniqueCategories);
    }, []);

    // Fonction pour filtrer les enchères par catégorie
    const handleCategoryChange = (event) => {
        const selectedCategory = event.target.value;
        setCategory(selectedCategory);

        if (selectedCategory === 'all') {
            setFilteredAuctions(auctions);
        } else {
            const filtered = auctions.filter(auction => auction.category === selectedCategory);
            setFilteredAuctions(filtered);
        }
    };

    return (
        <Container>
            {/* Barre de recherche par catégorie */}
            <Row className="my-4 category-select">
                <Col lg="12">
                    <Form.Group controlId="categorySelect">
                        <Form.Label>Filtrer par catégorie</Form.Label>
                        <Form.Control as="select" value={category} onChange={handleCategoryChange}>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>

            {/* Affichage des enchères filtrées */}
            <Row className="product_grid">
                {filteredAuctions.length > 0 ? (
                    filteredAuctions.map((auction) => (
                        <Col lg="3" md="4" sm="6" xs="12" key={auction.id} className="mb-4">
                            <Card className="product_item h-100 shadow-sm">
                                <Card.Img variant="top" src={auction.imgUrl} alt={auction.productName} className="product-img" />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="product_name">{auction.productName}</Card.Title>
                                    <Card.Text className="product_price">Prix : {auction.price} GTC</Card.Text>
                                    <Card.Text className="product_category text-muted">Catégorie : {auction.category}</Card.Text>
                                    <div className="mt-auto">
                                        <Link to={`/articles/${auction.id}`}>
                                            <button className="btn btn-primary">Voir détails</button>
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col lg="12" className="no-auctions">
                        <h4>Aucune enchère trouvée pour cette catégorie</h4>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default BrowseAuctions;
