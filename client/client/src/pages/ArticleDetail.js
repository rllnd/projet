import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BidForm from '../components/UI/BidForm';
import '../styles/ArticleDetail.css';
import CountdownTimer from '../components/UI/CountdownTimer';

const baseUrl = "http://localhost:5000";
const normalizePath = (path) => (path ? path.replace(/\\/g, '/') : '');

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [bids, setBids] = useState([]);
  const [currentBid, setCurrentBid] = useState(0);
  const [userTokens, setUserTokens] = useState(0);
  const [mainImage, setMainImage] = useState('');
  const [auctionId, setAuctionId] = useState(null);

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/articles/${id}`);
      const data = response.data;

      console.log("Données reçues de l'API :", JSON.stringify(data, null, 2));

      if (data.auctionDetails) {
        setAuctionId(data.auctionDetails.id || null);
      } else {
        setAuctionId(null);
      }

      // Normalisation des chemins pour les images
      if (typeof data.gallery === 'string') {
        try {
          data.gallery = JSON.parse(data.gallery);
        } catch (error) {
          data.gallery = [];
        }
      }

      data.gallery = Array.isArray(data.gallery)
        ? data.gallery.map(normalizePath)
        : [];

        setArticle(data);
    setMainImage(`${baseUrl}/${normalizePath(data.imgUrl)}`);
    setCurrentBid(data.auction?.currentHighestBid || data.price || 0); // Récupérez le prix actuel ou la base
    setAuctionId(data.auction?.id || null); // Récupérez l'ID de l'enchère associée
    setBids(data.bids || []); 
    } catch (error) {
      console.error("Erreur lors de la récupération de l'article :", error);
    }
  };

  const fetchUserTokens = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/api/user/token-balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserTokens(response.data.balance || 0);
    } catch (error) {
      console.error("Erreur lors de la récupération des tokens :", error);
    }
  };

  useEffect(() => {
    fetchArticle();
    fetchUserTokens();
  }, [id]);

  if (!article) {
    return <p>Chargement des détails de l'article...</p>;
  }

  return (
    <div className="article-detail">
      <div className="article-header">
        <h1>{article.name}</h1>
        <p className="category">Catégorie : <strong>{article.category}</strong></p>
        <p className="end-date">
          Clôture de l'enchère : <CountdownTimer endDate={article.endDate} />
        </p>
        <p className="seller">
          Vendu par : <strong>{article.seller?.name || 'Vendeur inconnu'}</strong>
          {article.seller?.email && <span> (Contact : {article.seller.email})</span>}
        </p>
      </div>

      <div className="article-body">
        <div className="main-content">
          <div className="main-image-container">
            <img src={mainImage} alt={article.name} className="main-image" />
          </div>
          <div className="gallery">
            {Array.isArray(article.gallery) && article.gallery.length > 0 ? (
              article.gallery.map((image, index) => (
                <img
                  key={index}
                  src={`${baseUrl}/${normalizePath(image)}`}
                  alt={`${article.name} - image ${index + 1}`}
                  className="gallery-image"
                  onClick={() => setMainImage(`${baseUrl}/${normalizePath(image)}`)}
                />
              ))
            ) : (
              <p>Aucune image disponible.</p>
            )}
          </div>

          <h3>Description</h3>
          <p>{article.fullDesc}</p>
        </div>

        <div className="sidebar">
           <div className="price-section">
    <h2>Prix actuel</h2>
    <p className="current-price">{currentBid} GTC</p>
    <p className="auto-bid-status">
      {article.auctionDetails?.maxAutoBid
        ? `Enchère automatique activée jusqu'à ${article.auctionDetails.maxAutoBid} GTC`
        : "Aucune enchère automatique active"}
    </p>
    <p className="user-tokens">Solde restant : {userTokens} GTC</p>
  </div>

            {/* Intégration de BidForm */}
            <BidForm
              articleId={id}
              currentBid={currentBid}
              setCurrentBid={setCurrentBid}
              bids={bids}
              setBids={setBids}
              userTokens={userTokens}
              refreshArticle={fetchArticle}
            />
          </div>
          </div>
    </div>
  );
};

export default ArticleDetail;
