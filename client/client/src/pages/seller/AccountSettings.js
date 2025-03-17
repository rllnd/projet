import React, { useState, useEffect } from 'react';
import { Layout, Button, Input, message, Typography, Card, Col, Row, Table, Spin, Modal, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, TransactionOutlined, DeleteOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

const apiUrl = '/api'; // Ajustez ce chemin selon votre configuration

const Parametres = () => {
    const [newPassword, setNewPassword] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [notifications, setNotifications] = useState({ email: false, sms: false });
    const [loginHistory, setLoginHistory] = useState([]);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [authCode, setAuthCode] = useState('');

    const [showBalance, setShowBalance] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showTransactions, setShowTransactions] = useState(false);
    const [showLoginHistory, setShowLoginHistory] = useState(false);

    const authToken = localStorage.getItem('authToken');

    // Changer le mot de passe
    const changePassword = async () => {
        if (!newPassword || newPassword.length < 8) {
            message.error('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            message.success(data.message);
        } catch (error) {
            message.error(error.message || 'Erreur lors du changement de mot de passe.');
        } finally {
            setLoading(false);
        }
    };

    // Obtenir les transactions récentes
    const getRecentTransactions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/recent-transactions`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) throw new Error('Erreur lors de la récupération des transactions');

            const data = await response.json();
            const mappedData = data.map(transaction => ({
                ...transaction,
                type: transactionTypeMap[transaction.type] || transaction.type,
                date: new Date(transaction.createdAt).toLocaleDateString('fr-FR'),
            }));
            setTransactions(mappedData);
        } catch (error) {
            message.error(error.message || 'Impossible de récupérer les transactions.');
        } finally {
            setLoading(false);
        }
    };

    // Obtenir le solde
    const getBalance = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/balance`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            const data = await response.json();
            setBalance(data.tokenBalance || 0);
            message.success('Solde récupéré.');
        } catch (error) {
            message.error(error.message || 'Erreur lors de la récupération du solde.');
        } finally {
            setLoading(false);
        }
    };

    // Obtenir le profil
    const getProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/profile`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            const data = await response.json();
            setProfile(data);
            message.success('Profil récupéré.');
        } catch (error) {
            message.error(error.message || 'Erreur lors de la récupération du profil.');
        } finally {
            setLoading(false);
        }
    };

    // Supprimer le compte
    const deleteAccount = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            message.success(data.message);
            setConfirmDelete(false);
        } catch (error) {
            message.error(error.message || 'Erreur lors de la suppression du compte.');
        } finally {
            setLoading(false);
        }
    };

    // Mettre à jour les préférences de notification
    const updateNotificationPreferences = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/notification-preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(notifications),
            });
            const data = await response.json();
            message.success(data.message);
        } catch (error) {
            message.error(error.message || 'Erreur lors de la mise à jour des préférences de notification.');
        } finally {
            setLoading(false);
        }
    };

    // Obtenir l'historique des connexions
    const getLoginHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/login-history`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            const data = await response.json();
            const mappedData = data.map(entry => ({
                id: entry.id,
                date: new Date(entry.loginTime).toLocaleString('fr-FR'),
            }));
            setLoginHistory(mappedData);
        } catch (error) {
            message.error(error.message || 'Erreur lors de la récupération de l\'historique des connexions.');
        } finally {
            setLoading(false);
        }
    };

    // Mettre à jour l'authentification à deux facteurs
    const updateTwoFactorAuth = async (enabled) => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/two-factor-auth`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ enabled }),
            });
            const data = await response.json();
            message.success(data.message);
            setTwoFactorAuth(enabled);
        } catch (error) {
            message.error(error.message || 'Erreur lors de la mise à jour de la vérification en deux étapes.');
        } finally {
            setLoading(false);
        }
    };

    // Vérifier le code 2FA
    const verifyTwoFactorAuth = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/two-factor-auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ token: authCode }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la vérification du code.');
            }

            const data = await response.json();
            message.success(data.message);
            setAuthCode(''); // Réinitialiser le code après vérification réussie
        } catch (error) {
            message.error(error.message || 'Erreur lors de la vérification du code.');
        } finally {
            setLoading(false);
        }
    };

    // Type de transactions
    const transactionTypeMap = {
        "refund": "Remboursement",
        "spend": "Dépense",
        "purchase": "Achat",
        "sale": "Vente",
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Montant', dataIndex: 'amount', key: 'amount' },
        { title: 'Type', dataIndex: 'type', key: 'type' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
    ];

    const loginHistoryColumns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
    ];

    useEffect(() => {
        getLoginHistory();
        getRecentTransactions();
        getBalance();
        getProfile();
    }, []); 

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ backgroundColor: '#00796b', color: 'white' }}> {/* Teal [700] */}
                <Title level={3} style={{ color: 'white', margin: 0 }}>Paramètres Utilisateur</Title>
            </Header>
            <Content style={{ padding: '20px', backgroundColor: '#f0f2f5' }}>
                {loading && <Spin size="large" style={{ display: 'block', margin: 'auto' }} />}

                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                        <Card title="Changer le mot de passe" bordered={false} style={cardStyle}>
                            <Input.Password
                                placeholder="Nouveau mot de passe"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{ marginBottom: '10px' }}
                                prefix={<LockOutlined />}
                            />
                            <Button type="primary" onClick={changePassword} style={{ backgroundColor: '#00796b', borderColor: '#00796b' }}> {/* Teal [700] */}
                                Changer le mot de passe
                            </Button>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Card title="Solde" bordered={false} style={cardStyle}>
                            <Button type="primary" onClick={() => {
                                getBalance();
                                setShowBalance(true);
                            }} style={{ backgroundColor: '#00796b', borderColor: '#00796b' }}> {/* Teal [700] */}
                                Voir le solde
                            </Button>
                            {showBalance && <div style={{ marginTop: '10px', fontWeight: 'bold' }}>Solde: {balance}</div>}
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Card title="Profil Utilisateur" bordered={false} style={cardStyle}>
                            <Button type="primary" onClick={() => {
                                getProfile();
                                setShowProfile(true);
                            }} style={{ backgroundColor: '#00796b', borderColor: '#00796b' }}> {/* Teal [700] */}
                                Voir le profil
                            </Button>
                            {showProfile && (
                                <div style={{ marginTop: '10px' }}>
                                    <p><strong>Nom d'utilisateur :</strong> {profile.name}</p>
                                    <p><strong>Email :</strong> {profile.email}</p>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: '20px' }}>
                    <Col xs={24} md={12}>
                        <Card title="Dernières Transactions" bordered={false} style={cardStyle}>
                            <Button type="primary" onClick={() => {
                                getRecentTransactions();
                                setShowTransactions(true);
                            }} icon={<TransactionOutlined />} style={{ backgroundColor: '#00796b', borderColor: '#00796b' }}> {/* Teal [700] */}
                                Voir les transactions
                            </Button>
                            {showTransactions && <Table dataSource={transactions} columns={columns} rowKey="id" style={{ marginTop: '10px' }} />}
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title="Préférences de Notification" bordered={false} style={cardStyle}>
                            <Checkbox 
                                checked={notifications.email}
                                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                            >
                                Recevoir des notifications par e-mail
                            </Checkbox>
                            <Checkbox 
                                checked={notifications.sms}
                                onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                            >
                                Recevoir des notifications par SMS
                            </Checkbox>
                            <Button type="primary" onClick={updateNotificationPreferences} style={{ marginTop: '10px', backgroundColor: '#00796b', borderColor: '#00796b' }}> {/* Teal [700] */}
                                Mettre à jour les préférences
                            </Button>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: '20px' }}>
                    <Col xs={24} md={12}>
                        <Card title="Historique de Connexions" bordered={false} style={cardStyle}>
                            <Button type="primary" onClick={() => {
                                getLoginHistory();
                                setShowLoginHistory(true);
                            }} style={{ backgroundColor: '#00796b', borderColor: '#00796b' }}> {/* Teal [700] */}
                                Voir l'historique
                            </Button>
                            {showLoginHistory && <Table dataSource={loginHistory} columns={loginHistoryColumns} rowKey="id" style={{ marginTop: '10px' }} />}
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title="Vérification en Deux Étapes" bordered={false} style={cardStyle}>
                            <Checkbox 
                                checked={twoFactorAuth}
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    updateTwoFactorAuth(isChecked);
                                    setTwoFactorAuth(isChecked);
                                }}
                            >
                                Activer la vérification en deux étapes
                            </Checkbox>
                            {twoFactorAuth && (
                                <>
                                    <Input 
                                        placeholder="Entrez le code de vérification"
                                        value={authCode}
                                        onChange={(e) => setAuthCode(e.target.value)}
                                        style={{ marginTop: '10px' }}
                                    />
                                    <Button type="primary" onClick={verifyTwoFactorAuth} style={{ marginTop: '10px', backgroundColor: '#00796b', borderColor: '#00796b' }}> {/* Teal [700] */}
                                        Vérifier le code
                                    </Button>
                                </>
                            )}
                        </Card>
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: '20px' }}>
                    <Col xs={24} md={12}>
                        <Card title="Supprimer le compte" bordered={false} style={cardStyle}>
                            <Button type="danger" onClick={() => setConfirmDelete(true)} icon={<DeleteOutlined />}>
                                Supprimer le compte
                            </Button>
                        </Card>
                    </Col>
                </Row>

                <Modal
                    title="Confirmation de suppression"
                    visible={confirmDelete}
                    onOk={deleteAccount}
                    onCancel={() => setConfirmDelete(false)}
                    okText="Oui, supprimer"
                    cancelText="Annuler"
                >
                    <p>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
                </Modal>
            </Content>
        </Layout>
    );
};

// Style pour les cartes
const cardStyle = {
    marginBottom: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

export default Parametres;