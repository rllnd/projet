{/*import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppProvider } from '@toolpad/core/AppProvider';
//import { DashboardLayout } from '@toolpad/core/DashboardLayout';
//import UsersManagement from './UsersManagement';
//import AuctionsManagement from './AuctionsManagement';
//import ItemsValidation from './ItemsValidation';
//import TransactionsManagement from './TransactionsManagement';
//import NotificationsManagement from './NotificationsManagement';
//import ReportsManagement from './ReportsManagement';
//import PlatformSettings from './PlatformSettings';
//import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart'; // Gestion des rapports
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GavelIcon from '@mui/icons-material/Gavel';
import img from '../../../src/assets/images/Gtoken.webp';
import { useNavigate } from 'react-router-dom';

const NAVIGATION = [
  { segment: 'dashboard', title: 'Tableau de bord', icon: <DashboardIcon /> },
  { segment: 'users', title: 'Gerer utilisateurs', icon: <PeopleIcon /> },
  { segment: 'auctions', title: 'Gerer les enchères', icon: <GavelIcon /> },
  { segment: 'items', title: 'Valider des artcles', icon: <AssignmentTurnedInIcon /> },
  { segment: 'transactions', title: 'Transactions', icon: <MonetizationOnIcon /> },
  { segment: 'notifications', title: 'Notifications', icon: },
  { segment: 'reports', title: 'Rapports', icon: <BarChartIcon /> },
  { segment: 'settings', title: 'Paramètres', icon: <SettingsIcon /> },
];

const demoTheme = createTheme({
  palette: {
    primary: { main: '#4a90e2' },
    secondary: { main: '#e94e77' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#333333', secondary: '#777777' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function DashboardSummary() {
  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {[
        { title: 'Total Users', value: '1,234', icon: <PeopleIcon fontSize="large" />, color: '#4a90e2' },
        { title: 'Active Auctions', value: '56', icon: <GavelIcon fontSize="large" />, color: '#e94e77' },
        { title: 'Validated Items', value: '432', icon: <AssignmentTurnedInIcon fontSize="large" />, color: '#39a275' },
        { title: 'Transactions', value: '123', icon: <MonetizationOnIcon fontSize="large" />, color: '#f5a623' },
      ].map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ backgroundColor: item.color, color: '#fff', height: 120 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
              {item.icon}
              <Box>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{item.title}</Typography>
                <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>{item.value}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function QuickActions({ onLogout }) {
  return (
    <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
      <Button variant="contained" color="primary" startIcon={<PeopleIcon />} sx={{ fontSize: '0.875rem' }}>
        Gérer utilisateurs
      </Button>
      <Button variant="contained" color="secondary" startIcon={ <GavelIcon />} sx={{ fontSize: '0.875rem' }}>
       Gérer enchères
      </Button>
      <Button variant="contained" color="success" startIcon={<AssignmentTurnedInIcon />} sx={{ fontSize: '0.875rem' }}>
        Valider articles
      </Button>
      <Button variant="contained" color="error" startIcon={<LogoutIcon />} onClick={onLogout} sx={{ fontSize: '0.875rem' }}>
        Deconnexion
      </Button>
    </Box>
  );
}

function DemoPageContent({ pathname, onLogout }) {
  //if (pathname === '/users') return <UsersManagement />;
  //if (pathname === '/auctions') return <AuctionsManagement />;
  //if (pathname === '/items') return <ItemsValidation />;
  //if (pathname === '/transactions') return <TransactionsManagement />;
  //if (pathname === '/notifications') return <NotificationsManagement />;
  //if (pathname === '/reports') return <ReportsManagement />;
  //if (pathname === '/settings') return <PlatformSettings />;

  return (
    <Box
      sx={{
        py: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        minHeight: '70vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        borderRadius: 2,
        boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
        p: 3,
        gap: 3,
      }}
    >
      <Typography variant="h5" color="primary" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
        Bienvue sur le tableau de bord Administrateur
      </Typography>
     
      <DashboardSummary />
      <QuickActions onLogout={onLogout} />
    </Box>
  );
}

function DashboardAdmin(props) {
  const { window } = props;
  const [pathname, setPathname] = React.useState('/dashboard');
  const navigate = useNavigate();

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/HomePage');
  };

  const demoWindow = window !== undefined ? window() : undefined;
  useEffect(() => {
    const titleElement = document.querySelector('.MuiTypography-h6');
    if (titleElement) {
      titleElement.textContent = 'Administrateur';
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
    <ThemeProvider theme={demoTheme}>
      <AppProvider
        navigation={NAVIGATION}
        router={router}
        >
        <DashboardLayout disableCollapsibleSidebar>
          <DemoPageContent pathname={pathname} onLogout={handleLogout} />
        </DashboardLayout>
      </AppProvider>
    </ThemeProvider>
  );
}

DashboardAdmin.propTypes = {
  window: PropTypes.func,
};

export default DashboardAdmin;*/}
