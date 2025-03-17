import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../contexts/SocketContext'; // Importer WebSocket

import {
  Typography,
  Grid,
  Box,
  TextField,
  MenuItem,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { Button, Upload, message, Form, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { styled } from '@mui/system';
import { blue, teal } from '@mui/material/colors';

const StyledContainer = styled(Box)(({ theme }) => ({
  backgroundColor: blue[50],
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  marginTop: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Centre horizontalement
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: teal[500],
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: teal[700],
  },
  fontWeight: 'bold',
  borderRadius: '8px',
}));

const CreateArticleForm = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const isMobile = useMediaQuery('(max-width:600px)');
  const socket = useSocket(); // Initialiser WebSocket

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (error) {
        message.error('Erreur lors de la récupération des catégories.');
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (values) => {
    const formData = new FormData();
  
    // Ajouter les données texte et fichiers au FormData
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'imgFile' && value) {
        formData.append('imgFile', value.originFileObj);
      } else if (key === 'galleryFiles' && value) {
        value.forEach((file) => {
          formData.append('galleryFiles', file.originFileObj);
        });
      } else if (value !== undefined) {
        formData.append(key, value);
      }
    });
  
    // Afficher le contenu de FormData pour déboguer
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }
  
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:5000/api/articles/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      const newArticle = response.data;
      
      // Émettre un événement WebSocket après création de l’article
      if (socket) {
        console.log("🟢 Émission WebSocket : create-article", newArticle);
        socket.emit("create-article", newArticle);
      }

      message.success('Article créé avec succès !');
      form.resetFields();
    } catch (error) {
      console.error("Erreur lors de la création de l'article :", error.response?.data || error);
      message.error(error.response?.data.message || "Échec de la création de l'article.");
    }
  };
  

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <StyledContainer maxWidth={isMobile ? 'sm' : 'md'}>
        <Typography variant="h4" align="center" gutterBottom color="teal">
          <strong>Créer un nouvel article d'enchère</strong>
        </Typography>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ categoryId: '', startPrice: '', endDate: '' }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Form.Item
                name="name"
                label="Nom de l'article"
                rules={[{ required: true, message: 'Veuillez entrer un nom.' }]}
              >
                <TextField fullWidth variant="outlined" placeholder="Nom de l'article" />
              </Form.Item>
            </Grid>

            <Grid item xs={12} md={6}>
              <Form.Item
                name="categoryId"
                label="Catégorie"
                rules={[{ required: true, message: 'Veuillez sélectionner une catégorie.' }]}
              >
                <Select placeholder="Sélectionnez une catégorie">
                  {categories.map((category) => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Grid>

            <Grid item xs={12} md={6}>
              <Form.Item
                name="startPrice"
                label="Prix de départ"
                rules={[{ required: true, message: 'Veuillez entrer un prix.' }]}
              >
                <TextField
                  fullWidth
                  type="number"
                  variant="outlined"
                  placeholder="Prix de départ"
                />
              </Form.Item>
            </Grid>

            <Grid item xs={12} md={6}>
              <Form.Item
                name="endDate"
                label="Date de fin de l'enchère"
                rules={[{ required: true, message: 'Veuillez entrer une date de fin.' }]}
              >
                <TextField
                  fullWidth
                  type="date"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Form.Item>
            </Grid>

            <Grid item xs={12} md={6}>
              <Form.Item
                name="shortDesc"
                label="Description courte"
                rules={[{ required: true, message: 'Veuillez entrer une description courte.' }]}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  placeholder="Description courte"
                />
              </Form.Item>
            </Grid>

            <Grid item xs={12} md={6}>
              <Form.Item
                name="fullDesc"
                label="Description complète"
                rules={[{ required: true, message: 'Veuillez entrer une description complète.' }]}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Description complète"
                />
              </Form.Item>
            </Grid>

            <Grid item xs={12} md={6}>
              <Form.Item
                name="imgFile"
                label="Image principale (JPG/PNG)"
                rules={[{ required: true, message: "L'image principale est obligatoire." }]}
              >
                <Upload
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(info) => {
                    const file = info.fileList[0];
                    form.setFieldsValue({ imgFile: file });
                  }}
                >
                  <Button icon={<UploadOutlined />}>Télécharger</Button>
                </Upload>
              </Form.Item>
            </Grid>

            <Grid item xs={12} md={6}>
              <Form.Item
                name="galleryFiles"
                label="Galerie d'images (max 10)"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || !value.fileList) {
                        return Promise.resolve(); // Pas de fichier téléchargé, validation réussie
                      }
                      if (value.fileList.length > 10) {
                        return Promise.reject(new Error('La galerie ne peut contenir que 10 images maximum.'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Upload
                  listType="picture"
                  multiple
                  beforeUpload={() => false}
                  onChange={(info) => {
                    form.setFieldsValue({ galleryFiles: info.fileList });
                  }}
                >
                  <Button icon={<UploadOutlined />}>Télécharger</Button>
                </Upload>
              </Form.Item>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <StyledButton type="primary" htmlType="submit">
              Créer l'article
            </StyledButton>
          </Box>
        </Form>
      </StyledContainer>
    </Grid>
  );
};

export default CreateArticleForm;