import React from 'react';
import { Link } from 'react-router-dom';
import { FaGavel, FaUser } from 'react-icons/fa'; // Icônes pour les offres et les enchérisseurs
import "../../styles/productlist.css";
const Productlist = ({ data, additionalInfo }) => {
  console.log("Données reçues dans ProductList :", data);

  const incrementViews = async (articleId) => {
    try {
      await fetch(`http://localhost:5000/api/articles/${articleId}/views`, {
        method: 'POST',
      });
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues :", error);
    }
  };

  if (!data || data.length === 0) {
    return <p>Aucun article trouvé.</p>;
  }

  return (
    <div className="product-grid">
      {data.map((article) => (
        <div className="product-card" key={article.id}>
          <div className="product-image">
            <img src={article.imgUrl} alt={article.name} />
          </div>
          <div className="product-details">
            <h3>{article.name}</h3>
            <p>{article.shortDesc}</p>
            <p className="price">{article.price} GTC</p>
            {/* Conteneur pour afficher les offres et les enchérisseurs côte à côte */}
            <div className="bid-info">
              <p className="bids"><FaGavel /> {article.bidCount} offres</p>
              <p className="bidders"><FaUser /> {article.bidderCount} enchérisseurs</p>
            </div>
            {additionalInfo && additionalInfo(article)}
            <Link 
              to={`/articles/${article.id}`} 
              className="view-btn"
              onClick={() => incrementViews(article.id)}
            >
              Voir plus
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Productlist;