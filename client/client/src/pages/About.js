import React from 'react';
import '../styles/AboutUs.css';
import auctionPlatformImage from '../assets/images/about.webp'; // Chemin vers l'image illustrant la plateforme

const AboutUs = () => {
    return (
        <div className="about-us">
            {/* Introduction */}
            <section className="about-us__intro">
                <h1>Bienvenue sur Gtoken Enchères</h1>
                <h5>
                    Gtoken Enchères est votre plateforme en ligne pour participer à des ventes aux enchères de manière simple et sécurisée. Que vous soyez nouveau dans le monde des enchères ou un expert, nous avons conçu cette plateforme pour être intuitive et accessible.
                </h5>
            </section>

            {/* Guide d'utilisation */}
            <section className="about-us__guide">
                <h2>Comment Utiliser la Plateforme</h2>

                <h3>1. Créez un Compte</h3>
                <h5>
                    Inscrivez-vous en quelques étapes simples. Vous aurez besoin d'une adresse e-mail valide pour créer un compte. Une fois inscrit, n'oubliez pas d'activer votre compte via le lien envoyé par e-mail.
                </h5>

                <h3>2. Achetez des Tokens</h3>
                <h5>
                    Les tokens sont la monnaie de la plateforme. Pour participer aux enchères, achetez des tokens en fonction de vos besoins. Vous pouvez également voir le taux de conversion actuel pour les acheter au meilleur prix.
                </h5>

                <h3>3. Explorez les Articles Disponibles</h3>
                <h5>
                    Parcourez les articles disponibles dans les enchères en cours. Chaque article est vérifié pour garantir sa qualité et sa conformité. Cliquez sur un article pour voir les détails et décider de placer une enchère.
                </h5>

                <h3>4. Placez vos Enchères</h3>
                <h5>
                    Une fois que vous avez choisi un article, définissez votre enchère et placez-la. Vous pouvez choisir entre enchères manuelles et automatiques. Les enchères automatiques continueront jusqu'à atteindre la limite de tokens ou jusqu'à ce que vous remportiez l'enchère.
                </h5>

                <h3>5. Suivez votre Tableau de Bord</h3>
                <h5>
                    Consultez votre tableau de bord pour voir votre solde de tokens, votre historique de transactions, et vos enchères en cours. Utilisez cet espace pour gérer vos tokens et vérifier votre progression.
                </h5>

                <h3>6. Recevez vos Gains</h3>
                <h5>
                    Si vous remportez une enchère, vous serez informé par notification et email. Vous pourrez alors finaliser l’achat et organiser la livraison de l’article.
                </h5>
            </section>

            {/* Image d'illustration */}
            <section className="about-us__image">
                <img src={auctionPlatformImage} alt="Illustration de la plateforme d'enchères" className="about-us__platform-image" />
            </section>

            {/* Contact */}
            <section className="about-us__contact">
                <h2>Besoin d'Aide ?</h2>
                <h5>
                    Notre équipe est là pour vous aider à chaque étape. Contactez-nous à <a href="mailto:gtokeninfo@gmail.com">gtokeninfo@gmail.com</a> pour toute question.
                </h5>
            </section>
        </div>
    );
};

export default AboutUs;
