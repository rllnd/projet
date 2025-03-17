// components/FAQManager.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Switch, Form, Input, Typography, Card, Row, Col } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const FAQManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get('/api/faqs');
      setFaqs(response.data);
    } catch (error) {
      message.error('Erreur lors de la récupération des FAQ');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/faqs/${id}`);
      message.success('FAQ supprimée avec succès');
      fetchFAQs();
    } catch (error) {
      message.error('Erreur lors de la suppression de la FAQ');
    }
  };

  const handlePublishToggle = async (id, published) => {
    try {
      await axios.patch(`/api/faqs/${id}/publish`, { published: !published });
      message.success('Statut de publication mis à jour');
      fetchFAQs();
    } catch (error) {
      message.error('Erreur lors de la mise à jour du statut de publication');
    }
  };

  const handleEdit = (faq) => {
    setEditingFAQ(faq);
    form.setFieldsValue(faq);
  };

  const handleUpdate = async (values) => {
    try {
      if (editingFAQ) {
        await axios.put(`/api/faqs/${editingFAQ.id}`, values);
        message.success('FAQ mise à jour avec succès');
      } else {
        await axios.post('/api/faqs', values);
        message.success('FAQ ajoutée avec succès');
      }
      setEditingFAQ(null);
      form.resetFields();
      fetchFAQs();
    } catch (error) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const columns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      width: '40%', // Ajustez la largeur selon vos besoins
    },
    {
      title: 'Réponse',
      dataIndex: 'answer',
      key: 'answer',
      width: '40%', // Ajustez la largeur selon vos besoins
    },
    {
      title: 'Publié',
      key: 'published',
      render: (_, record) => (
        <Switch
          checked={record.published}
          onChange={() => handlePublishToggle(record.id, record.published)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>Modifier</Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette FAQ ?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              Supprimer
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#E0F2F1' }}>
      <Title level={2} style={{ color: '#00796B' }}>Gestion des FAQ</Title>
      <Card style={{ marginBottom: 20 }}>
        <Form form={form} onFinish={handleUpdate}>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="question"
                label="Question"
                rules={[{ required: true, message: 'Veuillez entrer la question' }]}
              >
                <Input placeholder="Entrez la question ici" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="answer"
                label="Réponse"
                rules={[{ required: true, message: 'Veuillez entrer la réponse' }]}
              >
                <Input.TextArea placeholder="Entrez la réponse ici" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#00796B', borderColor: '#00796B' }}>
              {editingFAQ ? 'Mettre à jour' : 'Ajouter'}
            </Button>
            {editingFAQ && (
              <Button style={{ marginLeft: 8 }} onClick={() => setEditingFAQ(null)}>
                Annuler
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <Table dataSource={faqs} columns={columns} rowKey="id" />
        </div>
      </Card>
    </div>
  );
};

export default FAQManager;