import React, { useState, useEffect } from 'react';
import Helmet from '../components/Helmet/Helmet';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Accordion } from "react-bootstrap";
import "../styles/home.css";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductList from "../components/UI/ProductList";
import axios from '../assets/axiosConfig';
import heroImg from '../assets/images/téléchargement.jfif';
import { Modal } from 'antd';
const HomePage = () => {
  const [userRole, setUserRole] = useState(null);
  const [articleCelebre, setArticleCelebre] = useState([]);
  const [enchereEncours, setEnchereEncours] = useState([]);
  const [enchereSuivies, setEnchereSuivies] = useState([]); // État pour les enchères suivies
  const [faqs, setFaqs] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const navigate = useNavigate(); // Hook pour gérer la redirection

  useEffect(() => {
    const fetchFamousArticles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/articles/famous');
        setArticleCelebre(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des articles célèbres :", error);
      }
    };

    const fetchCurrentAuctions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/articles/auctions');
        setEnchereEncours(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des enchères en cours :", error);
      }
    };

    const fetchFollowedAuctions = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Récupérer le token du localStorage
        const response = await axios.get('http://localhost:5000/api/articles/user/followed-auctions', {
          headers: {
            Authorization: `Bearer ${token}` // Ajouter le token dans l'en-tête
          }
        });
        setEnchereSuivies(response.data.followedAuctions);
        setUserRole(response.data.userRole);
      } catch (error) {
        console.error("Erreur lors de la récupération des enchères suivies :", error);
      }
    };


    const fetchFAQs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/faqs');
        setFaqs(response.data.filter(faq => faq.published));
      } catch (error) {
        console.error("Erreur lors de la récupération des FAQ :", error);
      }
    };

    fetchFamousArticles();
    fetchCurrentAuctions();
    fetchFollowedAuctions(); // Récupération des enchères suivies
    fetchFAQs();
  }, [enchereSuivies]);

  const year = new Date().getFullYear();

  // Filtrer les enchères en cours
  const filteredAuctions = enchereEncours
    .filter(auction => {
      const matchesDate = filterDate ? new Date(auction.endDate).toLocaleDateString() === new Date(filterDate).toLocaleDateString() : true;
      const matchesTitle = filterTitle ? auction.name.toLowerCase().includes(filterTitle.toLowerCase()) : true;
      return matchesDate && matchesTitle;
    })
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));  // 🔥 Assurez-vous que l'ordre reste stable

    const handleBidClick = () => {
      const token = localStorage.getItem('authToken');
    
      if (!token) {
        Modal.confirm({
          title: "Vous devez vous connecter",
          content: "Veuillez vous connecter pour pouvoir enchérir sur un article.",
          okText: "Se connecter",
          cancelText: "Annuler",
          onOk() {
            navigate("/login"); // 🔥 Redirection automatique vers la page de connexion
          }
        });
      } else {
        navigate("/articles"); // ✅ Si connecté, aller vers la page des enchères
      }
    };
  return (
    <Helmet title={'Home'}>
      <section className="hero__section">
  <Container>
    <Row className="align-items-center">
      <Col lg="6" md="6" sm="12">
        <div className="hero__content">
          <p className="hero__subtitle">Les articles célèbres en {year} </p>
          <h2 className="hero__title">Veuillez enchérir sur les articles de votre choix</h2>
          <p>Cherchez des nouveaux articles et ne ratez pas l'occasion</p>
          <motion.button
            whileTap={{ scale: 1.2 }}
            className="buy__btn"
            onClick={handleBidClick} // Appelle la fonction
          >
            Enchérir maintenant
          </motion.button>
        </div>
      </Col>
      <Col lg="6" md="6" sm="12" className="d-flex justify-content-center">
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
              <h2 className="section__title">Les articles célèbres 🔥</h2>
            </Col>
            <ProductList
              data={articleCelebre}
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
              <h2 className="section__title">Les enchères en cours 🔥</h2>
            </Col>
            <Col lg="12">
              <div className="filter-container">
                <label className="filter-label">Filtrer par date:</label>
                <input
                  type="date"
                  className="filter-input"
                  onChange={(e) => setFilterDate(e.target.value)}
                />
                <label className="filter-label">Filtrer par titre:</label>
                <input
                  type="text"
                  className="filter-input"
                  onChange={(e) => setFilterTitle(e.target.value)}
                  placeholder="Titre de l'article"
                />
                <motion.button whileTap={{ scale: 1.2 }} className="btn btn-primary">
                  Appliquer les filtres
          </motion.button>
              </div>
            </Col>
            <ProductList
              data={filteredAuctions}
              additionalInfo={(article) => (
                <p>
                  Fin le {new Date(article.endDate).toLocaleDateString()}
                </p>
              )}
            />
          </Row>
        </Container>
      </section>
      {userRole !== 'seller' && enchereSuivies.length > 0 && (
        <section className="enchres-suivies">
          <Container>
            <Row>
              <Col lg="12" className="text-center">
                <h2 className="section__title">Enchères Suivies 🔥</h2>
              </Col>

              <ProductList
                data={enchereSuivies.slice(0, 4)}
                additionalInfo={(article) => (
                  <p>
                    Fin le {new Date(article.endDate).toLocaleDateString()}
                  </p>
                )}
              />
              {enchereSuivies.length > 4 && (
                <Col lg="12">
                  <div className="buy__btn1-container">
                    <Link to="/mes-encheres-suivies" className="buy__btn1">
                      Voir toutes les enchères suivies
              </Link>
                  </div>
                </Col>
              )}
            </Row>
          </Container>
        </section>
      )}


      <section className="how-it-works">
        <Container>
          <Row className="text-center">
            <Col lg="12">
              <h2 className="section__title">Comment ça fonctionne ? 🎯</h2>
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
                {faqs.map((faq, index) => ( // Affichage dynamique des FAQ
                  <Accordion.Item eventKey={index.toString()} className="faq-item" key={faq.id}>
                    <Accordion.Header>{faq.question}</Accordion.Header>
                    <Accordion.Body>
                      {faq.answer}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default HomePage;