import React, { useState, useEffect } from 'react';
import Helmet from '../components/Helmet/Helmet';
import { Container, Row, Col, Accordion, Card } from "react-bootstrap";
import "../styles/home.css";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductList from "../components/UI/ProductList";
import axios from '../assets/axiosConfig';
import heroImg from '../assets/images/téléchargement.jfif';

const HomePage = () => {
  const [articleCelebre, setArticleCelebre] = useState([]);
  const [enchereEncours, setEnchereEncours] = useState([]);

  useEffect(() => {
    // Récupération des articles célèbres
    const fetchFamousArticles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/articles/famous'); // Appel API
        setArticleCelebre(response.data); // Stockage des articles célèbres
      } catch (error) {
        console.error("Erreur lors de la récupération des articles célèbres :", error);
      }
    };;

    // Récupération des enchères en cours
    const fetchCurrentAuctions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/articles/auctions');
        setEnchereEncours(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des enchères en cours :", error);
      }
    };

    fetchFamousArticles();
    fetchCurrentAuctions();
  }, []);

  const year = new Date().getFullYear();

  return (
    <Helmet title={'Home'}>
      <section className="hero__section">
        <Container>
          <Row>
            <Col lg='6' md='6'>
              <div className="hero__content">
                <p className="hero__subtitle">Les articles célèbres en {year}</p>
                <h2>Veuillez enchérir sur les articles de votre choix</h2>
                <p>Cherchez des nouveaux articles et ne ratez pas l'occasion</p>
                <motion.button whileTap={{ scale: 1.2 }} className="buy__btn">
                  <Link to="/articles">Enchérir maintenant</Link>
                </motion.button>
              </div>
            </Col>
            <Col lg="6" md="6">
              <div className="hero__image">
                <img src={heroImg} alt="Hero" className="img-fluid" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="trending__products">
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h2 className="section__title">Les articles célèbres</h2>
            </Col>
            <ProductList
              data={articleCelebre} // Données réelles des articles célèbres
              additionalInfo={(article) => (
                <p>
                  {article.views} vues, {article.bids} enchères
                </p>
              )}
            />
          </Row>
        </Container>
      </section>

      <section className="enchre_cours">
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h2 className="section__title">Les enchères en cours</h2>
            </Col>
            <ProductList 
              data={enchereEncours} 
              additionalInfo={(article) => (
                <p>
                  Fin le {new Date(article.endDate).toLocaleDateString()}, {article.bids} enchères
                </p>
              )}
            />
          </Row>
        </Container>
      </section>

      <section className="how-it-works">
        <Container>
          <Row className="text-center">
            <Col lg="12">
              <h2 className="section__title">Comment ça fonctionne ?</h2>
              <p className="how-it-works-description"></p>
            </Col>
          </Row>
          <Row className="how-it-works-steps">
            <Col className="step">
              <div className="step-circle">01</div>
              <h4 className="step-title">Choisissez les Produits</h4>
              <p className="step-description">Il est très facile de créer un compte et de commencer votre aventure.</p>
            </Col>
            <Col className="step">
              <div className="step-circle">02</div>
              <h4 className="step-title">Faites une Offre</h4>
              <p className="step-description">Parcourez les articles en vente et placez vos enchères facilement.</p>
            </Col>
            <Col className="step">
              <div className="step-circle">03</div>
              <h4 className="step-title">Gagnez votre Enchère</h4>
              <p className="step-description">Si vous remportez l'enchère, finalisez la transaction pour recevoir votre article.</p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="faq-section">
      <Container>
        <Row>
          <Col lg="12" className="text-center mb-4">
            <h2 className="section__title">Questions fréquentes</h2>
          </Col>
          <Col lg="8" className="mx-auto">
            <Accordion defaultActiveKey="0" className="faq-accordion">
              {/* Questions fréquentes */}
              <Accordion.Item eventKey="0" className="faq-item">
                <Accordion.Header>Comment acheter des tokens sur la plateforme ?</Accordion.Header>
                <Accordion.Body>
                  Pour acheter des tokens, accédez à la section de gestion des tokens dans votre compte et suivez les instructions pour effectuer un paiement via Mobile Money. Une fois approuvé, les tokens seront crédités sur votre compte.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1" className="faq-item">
                <Accordion.Header>Comment fonctionne le système d'enchères ?</Accordion.Header>
                <Accordion.Body>
                  Notre système d'enchères permet aux utilisateurs de placer des enchères sur des articles en utilisant des tokens. La personne ayant la plus haute enchère à la fin de la période d'enchères remporte l'article.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2" className="faq-item">
                <Accordion.Header>Puis-je retirer mes tokens ?</Accordion.Header>
                <Accordion.Body>
                  Oui, les vendeurs peuvent demander un retrait de leurs tokens accumulés en réalisant une demande de retrait dans la section de gestion des tokens. La demande sera approuvée par l'administrateur et transférée sur votre compte Mobile Money.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3" className="faq-item">
                <Accordion.Header>Quelle est la limite d'achat et de retrait de tokens ?</Accordion.Header>
                <Accordion.Body>
                  La limite d'achat par transaction est de 500 tokens, et la limite de retrait est de 300 tokens. Vous pouvez ajuster ces limites en fonction de vos besoins.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>
      </Container>
    </section>
    </Helmet>
  );
};

export default HomePage;
