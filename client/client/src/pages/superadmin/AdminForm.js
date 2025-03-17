import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { teal, orange } from '@mui/material/colors';
import axios from 'axios';

const AdminForm = () => {
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/admins',
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Administrateur ajouté avec succès.');
    } catch (error) {
      message.error('Erreur lors de l\'ajout de l\'administrateur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: teal[50],
        padding: isMobile ? 2 : 5,
      }}
    >
      <Card
        title={<Typography variant="h5" style={{ color: teal[700], fontWeight: 'bold', textAlign: 'center' }}>Ajouter un Administrateur</Typography>}
        bordered={false}
        style={{
          maxWidth: isMobile ? '100%' : '500px',
          width: '100%',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '10px',
          backgroundColor: 'white',
        }}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{
            '--antd-error-color': orange[600], // Changez la couleur de l'erreur ici
            '--antd-error-color-border': orange[400],
          }}
        >
          <Form.Item
            label={<Typography variant="body1" style={{ fontWeight: 'bold', color: teal[800] }}>Nom</Typography>}
            name="name"
            rules={[{ required: true, message: 'Veuillez entrer un nom.' }]}
          >
            <Input placeholder="Nom" />
          </Form.Item>
          <Form.Item
            label={<Typography variant="body1" style={{ fontWeight: 'bold', color: teal[800] }}>Email</Typography>}
            name="email"
            rules={[
              { required: true, message: 'Veuillez entrer un email.' },
              { type: 'email', message: 'Veuillez entrer un email valide.' },
            ]}
          >
            <Input type="email" placeholder="Email" />
          </Form.Item>
          <Form.Item
            label={<Typography variant="body1" style={{ fontWeight: 'bold', color: teal[800] }}>Mot de passe</Typography>}
            name="password"
            rules={[{ required: true, message: 'Veuillez entrer un mot de passe.' }]}
          >
            <Input.Password placeholder="Mot de passe" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              width: '100%',
              backgroundColor: teal[700],
              borderColor: teal[700],
              fontWeight: 'bold',
            }}
          >
            Ajouter un Administrateur
          </Button>
        </Form>
      </Card>
    </Box>
  );
};

export default AdminForm;
