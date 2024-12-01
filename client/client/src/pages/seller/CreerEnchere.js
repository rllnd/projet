import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
  ProgressBar
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../styles/CreateAuction.css';

const CreateAuction = () => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des champs
    if (!productName || !description || !startPrice || !endDate || !category) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    // Vérification que le prix de départ est positif
    if (parseFloat(startPrice) <= 0) {
      setError('Le prix de départ doit être un nombre positif.');
      return;
    }

    // Vérification que la date de clôture est dans le futur
    const currentDate = new Date();
    const selectedDate = new Date(endDate);
    if (selectedDate <= currentDate) {
      setError('La date de clôture doit être dans le futur.');
      return;
    }

    setLoading(true);
    setUploadProgress(10); // Simule le début du téléchargement

    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('description', description);
    formData.append('startPrice', startPrice);
    formData.append('endDate', endDate);
    formData.append('category', category);
    images.forEach((image, index) => formData.append(`image${index}`, image));

    try {
      const response = await fetch('/api/seller/auctions', {
        method: 'POST',
        body: formData,
      });

      setLoading(false);
      if (response.ok) {
        setUploadProgress(100);
        setTimeout(() => {
          navigate('/seller/my-auctions');
        }, 1000); // Attend un peu pour afficher la progression à 100%
      } else {
        setError('Erreur lors de la création de l\'enchère.');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur.');
      setLoading(false);
    }
  };

  return (
    <div className='page'>
      <Container fluid className="create-auction-container">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} className="mb-4">
            <Card className="p-4 shadow-sm border-0">
              <h2 className="mb-4 text-center" style={{ color: '#1c2b4a' }}>Créer une Nouvelle Enchère</h2>
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col sm={6}>
                    <Form.Group controlId="productName" className="mb-4">
                      <Form.Label className="mb-2">Nom de l'Article</Form.Label>
                      <Form.Control
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Nom de l'article"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group controlId="category" className="mb-4">
                      <Form.Label className="mb-2">Catégorie</Form.Label>
                      <Form.Control
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Catégorie de l'article"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col sm={6}>
                    <Form.Group controlId="startPrice" className="mb-4">
                      <Form.Label className="mb-2">Prix de Départ (GTC)</Form.Label>
                      <Form.Control
                        type="number"
                        value={startPrice}
                        onChange={(e) => setStartPrice(e.target.value)}
                        placeholder="Prix de départ de l'enchère"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group controlId="endDate" className="mb-4">
                      <Form.Label className="mb-2">Date de Clôture</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="images" className="mb-4">
                  <Form.Label className="mb-2">Images de l'Article</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                  />
                  {uploadProgress > 0 && (
                    <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className="mt-2" />
                  )}
                </Form.Group>

                <Form.Group controlId="description" className="mb-4">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description détaillée de l'article"
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 btn-lg"
                  disabled={loading}
                  style={{ backgroundColor: '#1c2b4a', borderColor: '#1c2b4a' }}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Créer l\'Enchère'}
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateAuction;
