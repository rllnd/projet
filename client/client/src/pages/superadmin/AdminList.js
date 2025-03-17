import React, { useState, useEffect } from 'react';
import { Table, Button, Spin, Space, Popconfirm, message, Card } from 'antd';
import { Typography, Box, useMediaQuery } from '@mui/material';
import { teal, red } from '@mui/material/colors';
import axios from 'axios';

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)'); // Responsiveness check for mobile devices

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admins', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(response.data);
      } catch (error) {
        message.error('Erreur lors de la récupération des administrateurs.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins((prev) => prev.filter((admin) => admin.id_admin !== id));
      message.success('Administrateur supprimé avec succès.');
    } catch (error) {
      message.error('Erreur lors de la suppression.');
    }
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Voulez-vous vraiment supprimer cet administrateur ?"
            onConfirm={() => handleDelete(record.id_admin)}
            okText="Oui"
            cancelText="Non"
          >
            <Button danger style={{ backgroundColor: teal[700], color:'#fff', borderColor: teal[600] }}>
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: teal[50],
        minHeight: '100vh',
        padding: isMobile ? 2 : 5,
      }}
    >
      <Card
        title={
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: teal[700],
              textAlign: 'center',
            }}
          >
            Liste des Administrateurs
          </Typography>
        }
        bordered={false}
        style={{
          maxWidth: isMobile ? '100%' : '900px',
          margin: '0 auto',
          boxShadow: '0px 4px 12px rgba(37, 107, 73, 0.1)',
          borderRadius: '10px',
          backgroundColor: 'white',
        }}
      >
        <Spin spinning={loading}>
          <Table
            dataSource={admins}
            columns={columns}
            rowKey="id_admin"
            pagination={{
              position: ['bottomCenter'],
              pageSize: isMobile ? 5 : 10, // Adjust pagination for mobile view
            }}
            style={{ marginTop: '16px' }}
          />
        </Spin>
      </Card>
    </Box>
  );
};

export default AdminList;
