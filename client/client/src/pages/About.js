import React from 'react';
import { Typography, Grid, Card, CardContent, CardMedia, Button, Box } from '@mui/material';
import { MailOutlined } from '@ant-design/icons';
import auctionPlatformImage from '../assets/images/about.webp';

const AboutUs = () => {
    return (
        <Box sx={{ padding: 4 }}>
            {/* Introduction */}
            <Card
                sx={{
                    marginBottom: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: '10px',
                }}
            >
                <CardContent>
                    <Typography variant="h3" color="primary" gutterBottom>
                        Bienvenue sur Gtoken Enchères
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gtoken Enchères est votre plateforme en ligne pour participer à des ventes aux enchères de manière simple et sécurisée. Que vous soyez nouveau dans le monde des enchères ou un expert, nous avons conçu cette plateforme pour être intuitive et accessible.
                    </Typography>
                </CardContent>
            </Card>

            {/* Guide d'utilisation */}
            <Typography variant="h4" color="primary" gutterBottom>
                Comment Utiliser la Plateforme
            </Typography>
            <Grid container spacing={3}>
                {[
                    {
                        title: '1. Créez un Compte',
                        description:
                            "Inscrivez-vous en quelques étapes simples. Vous aurez besoin d'une adresse e-mail valide pour créer un compte. Une fois inscrit, n'oubliez pas d'activer votre compte via le lien envoyé par e-mail.",
                    },
                    {
                        title: '2. Achetez des Tokens',
                        description:
                            'Les tokens sont la monnaie de la plateforme. Pour participer aux enchères, achetez des tokens en fonction de vos besoins. Vous pouvez également voir le taux de conversion actuel pour les acheter au meilleur prix.',
                    },
                    {
                        title: '3. Explorez les Articles Disponibles',
                        description:
                            'Parcourez les articles disponibles dans les enchères en cours. Chaque article est vérifié pour garantir sa qualité et sa conformité. Cliquez sur un article pour voir les détails et décider de placer une enchère.',
                    },
                    {
                        title: '4. Placez vos Enchères',
                        description:
                            'Une fois que vous avez choisi un article, définissez votre enchère et placez-la. Vous pouvez choisir entre enchères manuelles et automatiques. Les enchères automatiques continueront jusqu\'à atteindre la limite de tokens ou jusqu\'à ce que vous remportiez l\'enchère.',
                    },
                    {
                        title: '5. Suivez votre Tableau de Bord',
                        description:
                            'Consultez votre tableau de bord pour voir votre solde de tokens, votre historique de transactions, et vos enchères en cours. Utilisez cet espace pour gérer vos tokens et vérifier votre progression.',
                    },
                    {
                        title: '6. Recevez vos Gains',
                        description:
                            'Si vous remportez une enchère, vous serez informé par notification et email. Vous pourrez alors finaliser l’achat et organiser la livraison de l’article.',
                    },
                ].map((step, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                borderLeft: `4px solid  #1c2b4a`,
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        >
                            <CardContent>
                                <Typography variant="h5" color="primary" gutterBottom>
                                    {step.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {step.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Image d'illustration */}
            <Box
                sx={{
                    marginTop: 6,
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <CardMedia
                    component="img"
                    image={auctionPlatformImage}
                    alt="Illustration de la plateforme d'enchères"
                    sx={{
                        maxWidth: '800px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                />
            </Box>

            {/* Contact */}
            <Box sx={{ marginTop: 6, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" gutterBottom>
                    Besoin d'Aide ?
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Notre équipe est là pour vous aider à chaque étape. Contactez-nous à{' '}
                    <Button
                        href="mailto:gtokeninfo@gmail.com"
                        startIcon={<MailOutlined />}
                        sx={{
                            color: '#1c2b4a',
                            textTransform: 'none',
                        }}
                    >
                        gtokeninfo@gmail.com
                    </Button>
                </Typography>
            </Box>
        </Box>
    );
};

export default AboutUs;
