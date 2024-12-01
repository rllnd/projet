import React, { useState, useEffect } from 'react';  
import { Link } from 'react-router-dom';  
import { Container, Row, Col, Form, Card } from 'react-bootstrap';  
import axios from '../assets/axiosConfig'; // Assurez-vous que le chemin est correct
import '../styles/ArticleList.css';  

const ArticleList = () => {  
    const [articles, setArticles] = useState([]);  
    const [filteredArticles, setFilteredArticles] = useState([]);  
    const [category, setCategory] = useState('all');  
    const [categories, setCategories] = useState([]);  

    useEffect(() => {  
        const fetchArticles = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/articles/published');

              setArticles(response.data);
              setFilteredArticles(response.data);
          
              const uniqueCategories = ['all', ...new Set(response.data.map((article) => article.category))];  
              setCategories(uniqueCategories);
            } catch (error) {
              console.error("Erreur lors de la récupération des articles publiés :", error);
            }
        };
        
          
        fetchArticles();
    }, []);  

    const handleCategoryChange = (event) => {  
        const selectedCategory = event.target.value;  
        setCategory(selectedCategory);  

        if (selectedCategory === 'all') {  
            setFilteredArticles(articles);  
        } else {  
            const filtered = articles.filter(article => article.category === selectedCategory);  
            setFilteredArticles(filtered);  
        }  
    };  

    return (  
        <Container>  
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

            <Row className="product_grid">  
                {filteredArticles.length > 0 ? (  
                    filteredArticles.map((article) => (  
                        <Col lg="3" md="4" sm="6" xs="12" key={article.id} className="mb-4">  
                            <Card className="product_item h-100 shadow-sm">  
                                <Card.Img variant="top" src={`http://localhost:5000/${article.imgUrl}`} alt={article.productName} className="product-img" />  
                                <Card.Body className="d-flex flex-column">  
                                    <Card.Title className="product_name">{article.name}</Card.Title>  
                                    <Card.Text className="product_price">Prix : {article.price} GTC</Card.Text>  
                                    <Card.Text className="product_category text-muted">Catégorie : {article.category}</Card.Text>  
                                    <div className="mt-auto">  
                                        <Link to={`/articles/${article.id}`}>  
                                            <button className="btn btn-primary">Voir détails</button>  
                                        </Link>  
                                    </div>  
                                </Card.Body>  
                            </Card>  
                        </Col>  
                    ))  
                ) : (  
                    <Col lg="12" className="no-articles">  
                        <h4>Aucun article trouvé pour cette catégorie</h4>  
                    </Col>  
                )}  
            </Row>  
        </Container>  
    );  
};  

export default ArticleList;
