import React, { useEffect, useState } from 'react';
import { Table, Button, message, Typography } from 'antd';
import axios from 'axios';
import { teal } from '@mui/material/colors'; // Import de la couleur teal

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/messages');
        setMessages(response.data);
      } catch (error) {
        message.error('Erreur lors de la récupération des messages');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/messages/${id}`);
      setMessages(messages.filter(message => message.id !== id));
      message.success('Message supprimé avec succès');
    } catch (error) {
      message.error('Erreur lors de la suppression du message');
      console.error(error);
    }
  };

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    { title: 'E-mail', dataIndex: 'email', key: 'email' },
    { title: 'Sujet', dataIndex: 'subject', key: 'subject' },
    { title: 'Message', dataIndex: 'message', key: 'message' },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button
          type="primary"
          danger
          onClick={() => handleDelete(record.id)}
          style={{
            borderRadius: '5px',
            backgroundColor: teal[500], // Couleur rouge
            borderColor: teal[500], // Bordure rouge
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = teal[500] // Couleur au survol
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = teal[500]; // Réinitialiser la couleur
          }}
        >
          Supprimer
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: '20px', textAlign: 'center', color:teal[700] }}>
        Messages de Contact
      </Typography.Title>
      <Table
        dataSource={messages}
        columns={columns}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default ContactMessages;