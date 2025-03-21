import React, { useEffect } from 'react';

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GavelIcon from '@mui/icons-material/Gavel';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationBadge from './NotificationBadge';
import NotificationsList from './NotificationsList';
import CancelledAuctionsList from './CancelledAuctionsList';
import CustomHouseIcon from '../../../src/assets/images/House.png';
import LogoutIcon from '../../../src/assets/images/deconnexion.png';
import { useAuth } from '../../contexts/AuthContext';

import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';

import TauxConversion from './TauxConversion';
import SellerDeliveries from "./SellerDeliveries";
import Overview from './Overview';
import SellerArticles from './SellerArticles';
import CreerArticle from './CreerArticle';
import StoppedAuctions from './StoppedAuctions';
import ActiveAuction from './ActiveAuction';
import AuctionHistory from './AuctionHistory';
import SalesHistory from './SalesHistory';
import Wallet from './Wallet'; // Ajout du formulaire de retrait
import Notifications from './Notifications';
import AccountSettings from './AccountSettings';
import SellerAuction from './SellerAuction';
import img from '../../../src/assets/images/Gtoken.webp';
import { blue, teal } from '@mui/material/colors';


function SellerDashboard(props) {
  const { window } = props;
  const router = useDemoRouter('/dashboard');
  const navigate = useNavigate();
  const demoWindow = window !== undefined ? window() : undefined;

const NAVIGATION = [
  { kind: 'header', title: 'Tableau de Bord Vendeur' },
  { segment: 'overview', title: 'Vue d’ensemble', icon: <DashboardIcon sx={{ color: teal[700], fontWeight: 'bold' }} /> },
  { kind: 'header', title: 'Gestion des Articles' },
  { segment: 'articles', title: 'Mes Articles', icon: <GavelIcon />},
  { segment: 'creer-article', title: 'Créer articles', icon: <GavelIcon /> },
  { kind: 'header', title: 'Gestion des enchères' },
  { segment: 'encheres-stop', title: 'Mes enchères arrêtées', icon: <GavelIcon /> },
  { segment: 'mes-encheres', title: 'Mes enchères actives', icon: <GavelIcon /> },
  { segment: 'encheres-annulees', title: 'Enchères annulées', icon: <GavelIcon /> },
  { segment: 'encheres-seller', title: 'Toute les enchères', icon: <GavelIcon /> },
  { segment: 'historique-enchere', title: 'Historique des enchères', icon: <GavelIcon /> },
  { kind: 'header', title: 'Transactions' },
  { segment: 'sales-history', title: 'Historique des transactions', icon: <AssignmentTurnedInIcon /> },
  { kind: 'header', title: 'Portefeuille' },
  { segment: 'wallet', title: 'Portefeuille', icon: <MonetizationOnIcon /> }, // Nouvelle section pour le portefeuille
  { segment: 'taux-conversion', title: 'Taux de Conversion GTC', icon: <MonetizationOnIcon sx={{ color: teal[700] }} /> },
  { kind: 'header', title: 'Notifications' },
    {
      segment: 'notifications',
      title: 'Notifications',
      icon: <NotificationBadge onClick={() => navigate('/notifications')} />, // Navigation corrigée
    },
    { kind: 'header', title: 'Gestion des Livraisons' },
{ segment: 'seller-deliveries', title: 'Mes Livraisons', icon: <AssignmentTurnedInIcon /> },

  { kind: 'header', title: 'Paramètres' },
  { segment: 'settings', title: 'Paramètres du Compte', icon: <SettingsIcon /> },
];

const demoTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
  breakpoints: { values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 } },
});

function DemoPageContent({ pathname }) {
  switch (pathname) {
    case '/overview': return <Overview />;
    case '/articles': return <SellerArticles />;
    case '/creer-article': return <CreerArticle />;
    case '/encheres-stop': return <StoppedAuctions />;
    case '/mes-encheres': return <ActiveAuction />;
    case '/encheres-seller': return <SellerAuction />;
    case '/historique-enchere': return <AuctionHistory  />;
    case '/sales-history': return <SalesHistory />;
    case '/seller-deliveries': return <SellerDeliveries userId={1} />; 

    case '/encheres-annulees': return <CancelledAuctionsList />;
    case '/wallet': return <Wallet />; // Affiche le formulaire de retrait
    case '/taux-conversion':
      return <TauxConversion />;
    case '/notifications': return <NotificationsList />;
    case '/settings': return <AccountSettings />;

    default: return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Bienvenue dans le Tableau de Bord vendeur</Typography>
        <Overview />
      </Box>
    );
  }
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

const handleGoToMenu = () => {
  navigate('/HomePage'); // Rediriger vers la page du menu principal
};

const { logout } = useAuth(); // Déconnexion depuis le contexte


const handleLogout = async () => {
  try {
    // Appeler une API pour invalider le token (facultatif)
    const token = localStorage.getItem('authToken');
    await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    // Supprimer le token localement
    localStorage.removeItem('authToken');
    sessionStorage.clear();

    // Appeler la fonction logout du contexte
    logout();

    // Rediriger immédiatement vers la page de connexion
    navigate('/login', { replace: true });
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error);
  }
};

  useEffect(() => {
    const titleElement = document.querySelector('.MuiTypography-h6');
    if (titleElement) {
      titleElement.style.color = 'teal';
      titleElement.textContent = 'Vendeur';
    }
  }, []);

  useEffect(() => {
    const logoElement = document.createElement('img');
    logoElement.src = img;
    logoElement.alt = 'logo';
    logoElement.style.height = '50px';
    logoElement.style.borderRadius = '50%';
    const titleElement = document.querySelector('.css-yzjoij');
    if (titleElement) {
      titleElement.innerHTML = '';
      titleElement.appendChild(logoElement);
    }
  }, []);

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={demoTheme} window={demoWindow}>
      <DashboardLayout>
        <Box
          sx={{
            backgroundColor: blue[50],
            minHeight: '100vh',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 16px' }}>
          
          <IconButton color="inherit" onClick={handleGoToMenu}>
          <img
            src={CustomHouseIcon} // Utilisation de votre icône
            alt="House Icon"
            style={{ width: 30, height: 30 }} // Ajuster la taille
          />
        </IconButton>

           <IconButton color="inherit" onClick={handleLogout}>
            <img
            src={ LogoutIcon} // Utilisation de votre icône
            alt="House Icon"
            style={{ width: 30, height: 30 }} // Ajuster la taille
          />
            </IconButton>
          </Box>
          <DemoPageContent pathname={router.pathname} />
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}

SellerDashboard.propTypes = {
  window: PropTypes.func,
};

export default SellerDashboard;
