// components/Feedback.js
import axios from '../../assets/axiosConfig';
import React from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { teal } from '@mui/material/colors'; // Import de la couleur teal

const Feedback = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      // Envoyer le feedback à l'API
      await axios.post('/api/feedback', values);
      message.success('Merci pour votre retour !');
      form.resetFields();
    } catch (error) {
      message.error('Erreur lors de l\'envoi de votre retour');
    }
  };

  return (
    <Card
      style={{
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(11, 37, 70, 0.733)', // Couleur de fond similaire
        color: 'white', // Couleur du texte blanche
      }}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="feedback"
          label={<span style={{ color: 'white' }}>Vos suggestions</span>} // Label en blanc
          rules={[{ required: true, message: 'Veuillez entrer vos suggestions' }]}
        >
          <Input.TextArea 
            placeholder="Entrez vos suggestions ici" 
            style={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} // Styles du TextArea
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: teal[700], // Couleur du bouton
              borderColor: teal[700], // Couleur de la bordure du bouton
              color: 'white',
              '&:hover': { backgroundColor: teal[500] }, // Couleur au survol
            }}
          >
            Soumettre
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Feedback;