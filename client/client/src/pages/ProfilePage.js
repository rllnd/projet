import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Avatar, Button, Form, Input, Upload, message, Row, Col, Spin } from 'antd';
import { EditOutlined, UploadOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { indigo, red, grey } from '@mui/material/colors';
import 'antd/dist/reset.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: '',
    joinedOn: '',
    profilePicture: '',
    address: '',
    cin: '',
    dateOfBirth: '',
    gender: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState(userData);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        setUpdatedData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des données utilisateur');
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleImageChange = (info) => {
    if (info.file.status === 'done') {
      const file = info.file.originFileObj;
      setSelectedImage(file);
      setUpdatedData({
        ...updatedData,
        profilePicture: URL.createObjectURL(file),
      });
    }
  };

  const handleInputChange = (e) => {
    setUpdatedData({
      ...updatedData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('name', updatedData.name);
      formData.append('firstName', updatedData.firstName);
      formData.append('lastName', updatedData.lastName);
      formData.append('phone', updatedData.phone);
      formData.append('email', updatedData.email);
      formData.append('address', updatedData.address);
      formData.append('cin', updatedData.cin);
      formData.append('dateOfBirth', updatedData.dateOfBirth);
      formData.append('gender', updatedData.gender);
      if (selectedImage) {
        formData.append('profilePicture', selectedImage);
      }

      await axios.put('http://localhost:5000/api/user/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Profil mis à jour avec succès');
      setUserData(updatedData);
      setEditMode(false);
      setSelectedImage(null);
    } catch (err) {
      message.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleCancelEdit = () => {
    setUpdatedData(userData);
    setSelectedImage(null);
    setEditMode(false);
  };

  if (loading) return <Spin tip="Chargement..." />;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '800px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          border: `1px solid ${indigo[900]}`,
          borderRadius: '10px',
        }}
        cover={
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: indigo[900],
              color: 'white',
              borderRadius: '10px 10px 0 0',
            }}
          >
            <Avatar
              size={120}
              src={updatedData.profilePicture || '/default-avatar.png'}
              alt="Profile"
              style={{ border: `3px solid white` }}
            />
            {editMode && (
              <Upload
                name="profilePicture"
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => onSuccess('ok'), 0);
                }}
                onChange={handleImageChange}
                accept="image/*"
              >
                <Button
                  icon={<UploadOutlined />}
                  style={{
                    marginTop: 10,
                    backgroundColor: 'white',
                    color: indigo[900],
                    border: `1px solid ${indigo[900]}`,
                  }}
                >
                  Changer la photo
                </Button>
              </Upload>
            )}
          </div>
        }
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Nom d'utilisateur" style={{ color: editMode ? indigo[900] : grey[500] }}>
                <Input
                  name="name"
                  value={updatedData.name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  style={{
                    borderColor: indigo[900],
                    backgroundColor: editMode ? 'white' : '#f5f5f5', // Fond clair quand non modifiable
                    color: editMode ? 'black' : grey[700], // Couleur du texte
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Prénom" style={{ color: editMode ? indigo[900] : grey[500] }}>
                <Input
                  name="firstName"
                  value={updatedData.firstName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  style={{
                    borderColor: indigo[900],
                    backgroundColor: editMode ? 'white' : '#f5f5f5',
                    color: editMode ? 'black' : grey[700],
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Nom" style={{ color: editMode ? indigo[900] : grey[500] }}>
                <Input
                  name="lastName"
                  value={updatedData.lastName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  style={{
                    borderColor: indigo[900],
                    backgroundColor: editMode ? 'white' : '#f5f5f5',
                    color: editMode ? 'black' : grey[700],
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Téléphone" style={{ color: editMode ? indigo[900] : grey[500] }}>
                <Input
                  name="phone"
                  value={updatedData.phone}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  style={{
                    borderColor: indigo[900],
                    backgroundColor: editMode ? 'white' : '#f5f5f5',
                    color: editMode ? 'black' : grey[700],
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email" style={{ color: editMode ? indigo[900] : grey[500] }}>
                <Input
                  name="email"
                  value={updatedData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  style={{
                    borderColor: indigo[900],
                    backgroundColor: editMode ? 'white' : '#f5f5f5',
                    color: editMode ? 'black' : grey[700],
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Adresse" style={{ color: editMode ? indigo[900] : grey[500] }}>
                <Input
                  name="address"
                  value={updatedData.address}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  style={{
                    borderColor: indigo[900],
                    backgroundColor: editMode ? 'white' : '#f5f5f5',
                    color: editMode ? 'black' : grey[700],
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="CIN" style={{ color: editMode ? indigo[900] : grey[500] }}>
                <Input
                  name="cin"
                  value={updatedData.cin}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  style={{
                    borderColor: indigo[900],
                    backgroundColor: editMode ? 'white' : '#f5f5f5',
                    color: editMode ? 'black' : grey[700],
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Date de Naissance" style={{ color: editMode ? indigo[900] : grey[500] }}>
                <Input
                  name="dateOfBirth"
                  type="date"
                  value={updatedData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  style={{
                    borderColor: indigo[900],
                    backgroundColor: editMode ? 'white' : '#f5f5f5',
                    color: editMode ? 'black' : grey[700],
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Genre" style={{ color: editMode ? indigo[900] : grey[500] }}>
                <select
                  name="gender"
                  value={updatedData.gender}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  style={{
                    borderColor: indigo[900],
                    width: '100%',
                    backgroundColor: editMode ? 'white' : '#f5f5f5',
                    color: editMode ? 'black' : grey[700],
                  }}
                >
                  <option value="">Sélectionnez</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Rôle" style={{ color: indigo[900] }}>
                <Input name="role" value={userData.role} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Date d'inscription" style={{ color: indigo[900] }}>
                <Input name="joinedOn" value={userData.joinedOn} disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          {!editMode ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditMode(true)}
              style={{ backgroundColor: indigo[900], borderColor: indigo[900] }}
            >
              Modifier
            </Button>
          ) : (
            <>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveChanges}
                style={{ backgroundColor: indigo[900], borderColor: indigo[900] }}
              >
                Enregistrer
              </Button>
              <Button
                danger
                type="primary"
                icon={<CloseOutlined />}
                onClick={handleCancelEdit}
                style={{ backgroundColor: red[500], border: `1px solid ${red[900]}` }}
              >
                Annuler
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;