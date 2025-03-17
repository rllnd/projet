import React, { useEffect,  useState } from 'react';

import { Badge, Menu, Dropdown } from 'antd';

import axios from '../../assets/axiosConfig';

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import MessageIcon from '@mui/icons-material/Message';
import LogoutIcon from '../../../src/assets/images/deconnexion.png';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';


import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';

// Import du composant Admin Overview
import AdminOverview from './AdminOverview';
import UsersManagement from './UsersManagement';
import TokenManagement from './Auction/TokenManagement';
import AuctionsManagement from './Auction/AuctionsManagement';
import AuctionSettings from './Auction/AuctionSettings';
import ActiveAuctions from './Auction/ActiveAuctions';
import AuctionHistory from './Auction/AuctionHistory';
import StopAuctions from './Auction/StopAuctions';
import AutomaticBidding from './Auction/AutomaticBidding';
import AuctionCategories from './Auction/AuctionCategories';
import BidValidation from './Auction/BidValidation';
import ItemsValidation from './ItemsValidation';
import ValidateArticle from './ValidateArticle';
import TransactionsManagement from './TransactionsManagement';
import NotificationsManagement from './NotificationsManagement';
import ReportsManagement from './ReportsManagement';
import PlatformSettings from './PlatformSettings';
import PlatformBalance from './PlatformBalance';
import AdminList from './AdminList';
import AdminForm from './AdminForm';
import img from '../../../src/assets/images/Gtoken.webp';
import CustomHouseIcon from '../../../src/assets/images/House.png';
import FAQForm from './FAQForm';
import ContactMessages from './ContactMessages';
import AdminDeliveryList from './AdminDeliveryList';
import AdminRevenueList from './AdminRevenueList';

import { blue, green, red, grey, teal, purple } from '@mui/material/colors';

const demoTheme = createTheme({
  palette: {
    primary: {
      main: teal[700],
    },
    secondary: {
      main: blue[700],
    },
    error: {
      main: red[700],
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
const NAVIGATION = [
  { kind: 'header', title: 'Tableau de Bord' },
  { segment: 'dashboard', title: 'Dashboard', icon: <DashboardIcon sx={{ color: teal[700], fontWeight: 'bold' }} /> },
  { kind: 'header', title: 'Gestion des Administrateurs' },
  { segment: 'admins', title: 'Liste des Administrateurs', icon: <PeopleIcon /> },
  { segment: 'admins/add', title: 'Ajouter un Administrateur', icon: <AssignmentTurnedInIcon /> },
  { kind: 'header', title: 'Gestion des Messages' },
  { segment: 'contact-messages', title: 'Messages de Contact', icon: <MessageIcon />},
  { kind: 'header', title: 'Gestion des FAQ' },
  { segment: 'faqs/add', title: 'Ajouter une FAQ', icon: <AssignmentTurnedInIcon /> },

  
  { kind: 'header', title: 'Gestion des Utilisateurs' },
  { segment: 'users', title: 'Gérer les Utilisateurs', icon: <PeopleIcon /> },
  
  { kind: 'header', title: 'Gestion des Tokens' },
  { segment: 'tokens', title: 'Gérer les Tokens', icon: <MonetizationOnIcon /> },
  { segment: 'tokens/conversion-history', title: 'Historique des Taux de Conversion', icon: <TrendingDownOutlinedIcon /> },

  { kind: 'header', title: 'Gestion des Enchères' },
  { segment: 'auctions/active', title: 'Enchères Actives', icon: <GavelIcon /> },
  { segment: 'auctions/history', title: 'Historique des Enchères', icon: <TimelineOutlinedIcon /> },
  { segment: 'auctions/stop', title: 'Arrêt des Enchères', icon: <PanToolOutlinedIcon /> },
  { segment: 'auctions/automatic-bidding', title: 'Enchères Automatiques', icon: <GavelIcon /> },
  { segment: 'auctions/categories', title: 'Catégories d’Enchères', icon: <TrendingDownOutlinedIcon /> },
 
  { segment: 'auctions/settings', title: 'Paramètres des Enchères', icon: <SettingsIcon /> },
  
  { kind: 'header', title: 'Gestion des Articles' },
  
  { segment: 'validateitems', title: 'Valider les articles', icon: <AssignmentTurnedInIcon /> },



  { kind: 'header', title: 'Gestion des Transactions' },
  { segment: 'transactions', title: 'Transactions', icon: <MonetizationOnIcon /> },

  { kind: 'header', title: 'Gestion des Livraisons' },
  { segment: 'deliveries', title: 'Livraisons', icon: <LocalShippingIcon sx={{ color: teal[700] }} /> },

  
  { kind: 'header', title: 'Analytics' },
  { segment: 'reports', title: 'Rapports', icon: <BarChartIcon /> },


  { kind: 'header', title: 'Revenus de la Plateforme' },
  { segment: 'revenues', title: 'Revenus', icon: <AccountBalanceOutlinedIcon sx={{ color: teal[700] }} /> },
  { segment: 'platform-balance', title: 'Solde de la Plateforme', icon: <AttachMoneyIcon  /> },

  { kind: 'header', title: 'Notifications' },
  { segment: 'notifications', title: 'Notifications', icon: <NotificationsIcon /> },


  { kind: 'header', title: 'Paramètres de la Plateforme' },
  { segment: 'settings', title: 'Paramètres', icon: <SettingsIcon /> },
];

function DemoPageContent({ pathname }) {
  switch (pathname) {
    case '/admins': return <AdminList />;
    case '/dashboard': 
      return <AdminOverview />;
    case '/admins/add': return <AdminForm />;
    case '/users': return <UsersManagement    />;
    case '/contact-messages': return <ContactMessages />;
    case '/faqs/add': return <FAQForm />;
    case '/faqs/edit/:id': return <FAQForm />;
    case '/tokens': return <TokenManagement />;
    case '/tokens/conversion-history': return <BidValidation />;
    case '/auctions': return <AuctionsManagement />;
    case '/auctions/settings': return <AuctionSettings />;
    case '/auctions/active': return <ActiveAuctions />;
    case '/auctions/history': return <AuctionHistory />;
    case '/auctions/stop': return <StopAuctions />;
    case '/auctions/automatic-bidding': return <AutomaticBidding />;
    case '/auctions/categories': return <AuctionCategories />;
  
    case '/items': return <ItemsValidation />;
    case '/validateitems': return <ValidateArticle />;
    case '/deliveries': return <AdminDeliveryList />;
    case '/transactions': return <TransactionsManagement />;
    case '/notifications': return <NotificationsManagement />;
    case '/reports': return <ReportsManagement />;
    case '/platform-balance': return <PlatformBalance />;
    case '/revenues': return <AdminRevenueList />;
    case '/settings': return <PlatformSettings />;
    default: return (
      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h5">Contenu du tableau de bord pour {pathname}</Typography>
      </Box>
    );
  }
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/notifications/admin/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(response.data);

        const unreadResponse = await axios.get('/api/notifications/admin/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(unreadResponse.data.count);
      } catch (error) {
        console.error('Erreur lors de la récupération des notifications :', error);
      }
    };

    fetchNotifications();
  }, []);

  const markNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/notifications/admin/mark-as-read', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUnreadCount(0);
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications :', error);
    }
  };

  const notificationMenu = (
    <Menu>
      {notifications.length > 0 ? (
        notifications.map((notif) => (
          <Menu.Item key={notif.id} style={{ backgroundColor: notif.isRead ? 'white' : '#f6f6f6' }}>
            {notif.message}
          </Menu.Item>
        ))
      ) : (
        <Menu.Item>Aucune notification</Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item onClick={markNotificationsAsRead} style={{ textAlign: 'center', fontWeight: 'bold', cursor: 'pointer' }}>
        Marquer comme lues
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={notificationMenu} trigger={['click']}>
      <Badge count={unreadCount} color="error">
        <NotificationsIcon style={{ fontSize: '24px', cursor: 'pointer', marginRight: '20px' }} />
      </Badge>
    </Dropdown>
  );
};

const iconStyle = {
  width: 30,
  height: 30,
  cursor: "pointer",
  marginRight: "10px",
};

function SuperDashboard(props) {
  const { window } = props;
  const router = useDemoRouter('/dashboard');
  const navigate = useNavigate();
  const demoWindow = window !== undefined ? window() : undefined;

  
  const handleLogout = () => {
    localStorage.removeItem('token'); // Supprime le token
    navigate('/superadmin-login'); // Redirige vers la page de connexion
  };

  const handleGoToMenu = () => {
    navigate('/homePage'); // Rediriger vers la page d'accueil
  };

  
  
  useEffect(() => {
    const titleElement = document.querySelector('.MuiTypography-h6');
    titleElement.style.color= 'teal';
   
    if (titleElement) titleElement.textContent = 'Administrateur';
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
            backgroundColor: blue[50], // couleur de fond gris foncé
            minHeight: '100vh', // hauteur complète pour couvrir tout l'écran
          }}
        >
         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 16px' }}>
         
         <IconButton color="inherit" onClick={handleGoToMenu}>
          <img src={CustomHouseIcon} alt="House Icon" style={iconStyle} />
        </IconButton>
        <IconButton color="inherit" onClick={handleLogout}>
          <img src={LogoutIcon} alt="Logout Icon" style={iconStyle} />
        </IconButton>
        <NotificationsDropdown />

        </Box>
 <DemoPageContent pathname={router.pathname} />
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
  
}

SuperDashboard.propTypes = {
  window: PropTypes.func,
};

export default SuperDashboard;
