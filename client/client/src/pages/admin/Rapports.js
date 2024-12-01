import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import UsersManagement from './UsersManagement';
import AuctionsManagement from './AuctionsManagement';
import ItemsValidation from './ItemsValidation';
import img from '../../../src/assets/images/Gtoken.webp'; // Import du logo Gtoken
import { useNavigate } from 'react-router-dom';

const NAVIGATION = [
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'users',
    title: 'Users',
    icon: <PeopleIcon />,
  },
  {
    segment: 'auctions',
    title: 'Auctions',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'items',
    title: 'Items',
    icon: <AssignmentTurnedInIcon />,
  },
];

// Custom theme with vibrant colors and soft transitions
const demoTheme = createTheme({
  palette: {
    primary: {
      main: '#4a90e2',
    },
    secondary: {
      main: '#e94e77',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#777777',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s ease',
          boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  },
});

function DashboardSummary() {
  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      {[
        { title: 'Total Users', value: '1,234', icon: <PeopleIcon fontSize="large" />, color: '#4a90e2' },
        { title: 'Active Auctions', value: '56', icon: <ShoppingCartIcon fontSize="large" />, color: '#e94e77' },
        { title: 'Validated Items', value: '432', icon: <AssignmentTurnedInIcon fontSize="large" />, color: '#39a275' },
        { title: 'Items Awaiting', value: '15', icon: <TrendingUpIcon fontSize="large" />, color: '#f5a623' },
      ].map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ backgroundColor: item.color, color: '#fff', height: 140 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
              {item.icon}
              <Box>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {item.title}
                </Typography>
                <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {item.value}
                </Typography>
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
    <Box sx={{ mt: 3, display: 'flex', gap: 3, justifyContent: 'center' }}>
      <Button variant="contained" color="primary" startIcon={<PeopleIcon />} sx={{ fontSize: '0.875rem', padding: '10px 24px' }}>
        Manage Users
      </Button>
      <Button variant="contained" color="secondary" startIcon={<ShoppingCartIcon />} sx={{ fontSize: '0.875rem', padding: '10px 24px' }}>
        Manage Auctions
      </Button>
      <Button variant="contained" color="success" startIcon={<AssignmentTurnedInIcon />} sx={{ fontSize: '0.875rem', padding: '10px 24px' }}>
        Validate Items
      </Button>
      <Button variant="contained" color="error" startIcon={<LogoutIcon />} onClick={onLogout} sx={{ fontSize: '0.875rem', padding: '10px 24px' }}>
        Logout
      </Button>
    </Box>
  );
}

function DemoPageContent({ pathname, onLogout }) {
  if (pathname === '/users') {
    return <UsersManagement />;
  }
  if (pathname === '/auctions') {
    return <AuctionsManagement />;
  }
  if (pathname === '/items') {
    return <ItemsValidation />;
  }

  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        minHeight: '70vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        borderRadius: 2,
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)',
        p: 4,
        gap: 4,
      }}
    >
      <Typography variant="h5" color="primary" sx={{ fontSize: '1.8rem', fontWeight: 600 }}>
        Welcome to the Admin Dashboard
      </Typography>
      <Typography variant="body2" sx={{ fontSize: '0.9rem', color: 'text.secondary', maxWidth: '600px' }}>
        Use the sidebar to navigate between Users, Auctions, and Items. Enjoy managing your platform with quick actions and intuitive summaries.
      </Typography>
      
      <DashboardSummary />
      <QuickActions onLogout={onLogout} />
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
};

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
    navigate('/login');
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
    logoElement.alt = 'img';
    logoElement.style.height = '50px';
    logoElement.style.borderRadius = '50%';
    logoElement.style.width = 'auto';
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
        theme={demoTheme}
        window={demoWindow}
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

export default DashboardAdmin;
