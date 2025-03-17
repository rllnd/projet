import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProductList from "../components/UI/ProductList";
import axios from "../assets/axiosConfig";

const MesEncheresSuivies = () => {
  const [enchereSuivies, setEnchereSuivies] = useState([]);

  useEffect(() => {
    const fetchFollowedAuctions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:5000/api/articles/user/followed-auctions", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 🔥 Utiliser `response.data.followedAuctions` filtré depuis le backend
        setEnchereSuivies(response.data.followedAuctions);
      } catch (error) {
        console.error("Erreur lors de la récupération des enchères suivies :", error);
      }
    };

    fetchFollowedAuctions();
  }, []);

  return (
    <Container>
      <Row>
        <Col lg="12" className="text-center">
          <h2 className="section__title">Toutes mes enchères suivies</h2>
        </Col>
        <ProductList 
          data={enchereSuivies} 
          additionalInfo={(article) => (
                  <p>
                    Fin le {new Date(article.endDate).toLocaleDateString()}
                  </p>
          )}
        />
      </Row>
    </Container>
  );
};

export default MesEncheresSuivies;
