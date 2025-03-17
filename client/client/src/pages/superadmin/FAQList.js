// components/FAQList.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Switch, Form, Input } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FAQList = () => {
  const [faqs, setFaqs] = useState([]);
  const [editingFAQ, setEditingFAQ] = useState(null); // État pour l'édition
  const [form] = Form.useForm(); // Formulaire d'édition

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
    setEditingFAQ(faq); // Définir la FAQ à modifier
    form.setFieldsValue(faq); // Remplir le formulaire avec les données de la FAQ
  };

  const handleUpdate = async (values) => {
    try {
      await axios.put(`/api/faqs/${editingFAQ.id}`, values);
      message.success('FAQ mise à jour avec succès');
      setEditingFAQ(null); // Réinitialiser l'état d'édition
      fetchFAQs(); // Récupérer la liste mise à jour
    } catch (error) {
      message.error('Erreur lors de la mise à jour de la FAQ');
    }
  };

  const columns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'Réponse',
      dataIndex: 'answer',
      key: 'answer',
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
    <div>
      <Link to="/faqs/add">
        <Button type="primary" style={{ marginBottom: 16 }}>
          Ajouter une FAQ
        </Button>
      </Link>

      {editingFAQ && (
        <Form form={form} onFinish={handleUpdate} style={{ marginBottom: 16 }}>
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: 'Veuillez entrer la question' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="answer"
            label="Réponse"
            rules={[{ required: true, message: 'Veuillez entrer la réponse' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Mettre à jour
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setEditingFAQ(null)}>
              Annuler
            </Button>
          </Form.Item>
        </Form>
      )}

      <Table dataSource={faqs} columns={columns} rowKey="id" />
    </div>
  );
};

export default FAQList;