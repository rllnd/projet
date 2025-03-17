// components/ContactForm.js
import React from 'react';
import { Form, Input, Button, message, Card, Row, Col } from 'antd';
import axios from 'axios';
import { teal } from '@mui/material/colors'; // Import de la couleur teal

const ContactForm = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      // Récupérez le token d'authentification depuis le stockage local ou un autre moyen
      const token = localStorage.getItem('authToken'); // Remplacez par votre méthode de récupération du token
  
      // Effectuez l'appel POST avec le token
      await axios.post('/api/contact', values, {
        headers: {
          Authorization: `Bearer ${token}`, // Ajoutez le token dans les en-têtes
        },
      });
  
      message.success('Votre message a été envoyé avec succès');
      form.resetFields();
    } catch (error) {
      message.error('Erreur lors de l\'envoi du message');
      console.error('Détails de l\'erreur:', error); // Journaliser l'erreur pour le débogage
    }
  };

  return (
    <Card
      style={{
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(11, 37, 70, 0.733)', // Couleur de fond
        color: 'white', // Couleur du texte blanche
      }}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={<span style={{ color: 'white' }}>Nom</span>}
              rules={[{ required: true, message: 'Veuillez entrer votre nom' }]}
            >
              <Input placeholder="Entrez votre nom" style={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label={<span style={{ color: 'white' }}>E-mail</span>}
              rules={[{ required: true, type: 'email', message: 'Veuillez entrer un e-mail valide' }]}
            >
              <Input placeholder="Entrez votre e-mail" style={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="subject"
              label={<span style={{ color: 'white' }}>Sujet</span>}
              rules={[{ required: true, message: 'Veuillez entrer le sujet' }]}
            >
              <Input placeholder="Entrez le sujet" style={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="message"
              label={<span style={{ color: 'white' }}>Message</span>}
              rules={[{ required: true, message: 'Veuillez entrer votre message' }]}
            >
              <Input.TextArea placeholder="Entrez votre message ici" style={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: teal[700], // Couleur du bouton
              borderColor: teal[700], // Couleur de la bordure du bouton
              color: 'white',
            }}
          >
            Envoyer
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ContactForm;