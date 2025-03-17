import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HistoryIcon from '@mui/icons-material/History';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CustomHouseIcon from '../../../src/assets/images/House.png';
import LogoutIcon from '../../../src/assets/images/deconnexion.png';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '@mui/material'; // Importer Badge
import { Link } from 'react-router-dom';

import BuyerDeliveries from './BuyerDeliveries';
import NotificationBadge from './NotificationBadge';
import EncheresEnCours from './EncheresEnCours';
import EncheresGagnees from './EncheresGagnees';
import EncheresPerdues from './EncheresPerdues';
import Encheresannulees from './Encheresannulees';
import HistoriqueEncheres from './HistoriqueEncheres';
import HistoriqueTransactions from './HistoriqueTransactions';
import SoldeCompte from './SoldeCompte';
import AchatTokens from './AchatTokens';
import ParametresCompte from './ParametresCompte';
import NotificationsPage from './NotificationPage';
import TauxConversion from './TauxConversion';
import Overview from './Overview';


import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import img from '../../../src/assets/images/Gtoken.webp';
import { blue, teal } from '@mui/material/colors';

const demoTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
});

const NAVIGATION = [
  { kind: 'header', title: 'Tableau de Bord Acheteur' },
  { segment: 'overview', title: 'Vue d’ensemble', icon: <DashboardIcon sx={{ color: teal[700] }} /> },

  { kind: 'header', title: 'Enchères' },
  { segment: 'encheres-encours', title: 'Enchères en Cours', icon: <GavelIcon sx={{ color: teal[700] }} /> },
  { segment: 'encheres-gagnees', title: 'Enchères Gagnées', icon: <AssignmentTurnedInIcon sx={{ color: teal[700] }} /> },
  { segment: 'encheres-perdues', title: 'Enchères Perdues', icon: <GavelIcon sx={{ color: teal[700] }} /> },
  { segment: 'encheres-annulees', title: 'Enchères Annulées', icon: <GavelIcon sx={{ color: teal[700] }} /> },
  
  { segment: 'historique-encheres', title: 'Historique des Enchères', icon: <HistoryIcon sx={{ color: teal[700] }} /> },
  
  { kind: 'header', title: 'Mes Achats' },
  { segment: 'mes-achats', title: 'Mes Achats', icon: <ShoppingCartIcon sx={{ color: teal[700] }} /> },


  { kind: 'header', title: 'Transactions' },
  { segment: 'historique-transactions', title: 'Historique des Transactions', icon: <HistoryIcon sx={{ color: teal[700] }} /> },

  { kind: 'header', title: 'Portefeuille' },
  { segment: 'solde-compte', title: 'Solde du Compte', icon: <MonetizationOnIcon sx={{ color: teal[700] }} /> },
  { segment: 'taux-conversion', title: 'Taux de Conversion Tokens / Ariary', icon: <MonetizationOnIcon sx={{ color: teal[700] }} /> },
  { segment: 'achat-tokens', title: 'Achat de Tokens', icon: <ShoppingCartIcon sx={{ color: teal[700] }} /> },

  { kind: 'header', title: 'Paramètres' },
  { segment: 'parametres-compte', title: 'Paramètres du Compte', icon: <SettingsIcon sx={{ color: teal[700] }} /> },

  { kind: 'header', title: 'Notifications' },
  { segment: 'notifications', title: 'Notifications', icon: <NotificationBadge sx={{ color: teal[700] }} /> },
];

function DemoPageContent({ pathname }) {
  switch (pathname) {
    case '/overview':
      return <Overview />;
    case '/encheres-encours':
      return <EncheresEnCours />;
    case '/encheres-gagnees':
      return <EncheresGagnees />;
    case '/encheres-perdues':
      return <EncheresPerdues />;
      case '/encheres-annulees':
      return <Encheresannulees />;
    case '/historique-encheres':
      return <HistoriqueEncheres />;
    case '/mes-achats':
      return <BuyerDeliveries />;
    case '/historique-transactions':
      return <HistoriqueTransactions />;
    case '/solde-compte':
      return <SoldeCompte />;
    case '/taux-conversion':
      return <TauxConversion />;
    case '/achat-tokens':
      return <AchatTokens />;
    case '/parametres-compte':
      return <ParametresCompte />;
    case '/notifications':
      return <NotificationsPage />;
    default:
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h5">Bienvenue dans le Tableau de Bord Acheteur</Typography>
        
          <Overview />
        </Box>
      );
  }
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function BuyerDashboard(props) {
  const { window } = props;
  const router = useDemoRouter('/dashboard');
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0); // Déclarer l'état unreadCount

  const demoWindow = window !== undefined ? window() : undefined;

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
      titleElement.textContent = 'Acheteur';
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
        <Box sx={{ backgroundColor: blue[50], minHeight: '100vh' }}>
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
                src={LogoutIcon} // Utilisation de votre icône
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

BuyerDashboard.propTypes = {
  window: PropTypes.func,
};

export default BuyerDashboard;
