// client/src/components/UI/Productlist.js
import React from 'react';
import { Link } from 'react-router-dom';

const Productlist = ({ data, additionalInfo }) => {
  console.log("Données reçues dans ProductList :", data); // Vérifiez les données ici
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
            {additionalInfo && additionalInfo(article)} {/* Affiche les infos supplémentaires */}
            <Link to={`/articles/${article.id}`} className="view-btn">
              Voir plus
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Productlist;
