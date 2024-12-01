import React from 'react';
import './Footer.css';
import logo from '../../../src/assets/images/Gtoken.webp';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <Container>
                <Row>
                    {/* Colonne 1 : Logo et description */}
                    <Col lg="3" md="6" sm="12" className="footer-column">
                        <div className="footer__logo">
                            <img src={logo} alt="Logo Gtoken" className="footer__logo-img" />
                            <h2 className="footer__logo-text">Gtoken <span className="highlight">Enchères</span></h2>
                        </div>
                        <p className="footer__description">
                            Plateforme de ventes aux enchères pour tous.
                        </p>
                    </Col>

                    {/* Colonne 2 : Liens Importants */}
                    <Col lg="3" md="6" sm="12" className="footer-column">
                        <h5 className="footer__title">Liens Importants</h5>
                        <ul className="footer__list">
                            <li><a href="/products">Produits</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </Col>

                    {/* Colonne 3 : Liens de la société */}
                    <Col lg="3" md="6" sm="12" className="footer-column">
                        <h5 className="footer__title">Liens de la société</h5>
                        <ul className="footer__list">
                            <li><a href="/about">À propos de nous</a></li>
                            <li><a href="/cookie-policy">Politique de Cookies</a></li>
                            <li><a href="/terms">Conditions d'utilisation</a></li>
                            <li><a href="/privacy">Politique de confidentialité</a></li>
                        </ul>
                    </Col>

                    {/* Colonne 4 : Informations de Contact */}
                    <Col lg="3" md="6" sm="12" className="footer-column">
                        <h5 className="footer__title">Informations de contact</h5>
                        <p className="footer__contact">
                            BP 16122, Antananarivo, Madagascar
                        </p>
                        <p className="footer__contact">
                            <a href="mailto:gtokeninfo@gmail.com" style={{ color: '#bbb', textDecoration: 'none' }}>
                                rllnddavid@gmail.com
                            </a>
                        </p>
                        <div className="footer__social-icons">
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <FaFacebook />
                            </a>
                            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <FaTwitter />
                            </a>
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <FaInstagram />
                            </a>
                            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <FaLinkedin />
                            </a>
                        </div>
                    </Col>
                </Row>

                {/* Ligne pour le Copyright */}
                <Row>
                    <Col lg="12" className="text-center mt-4">
                        <p className="footer__copy">
                            © {year} Développé par David Pabel. Tous droits réservés.
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
