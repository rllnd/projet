// client/src/routes/Routes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ActivateAccount  from '../pages/ActivateAccount';
import SignupPage from '../pages/SignupPage';
import ProfilePage from '../pages/ProfilePage';
import Sellerboard from '../pages/seller/Sellerboard';
import BuyerDashboard from '../pages/buyer/BuyerDashboard';
import BrowseAuctions from '../pages/buyer/BrowseAuctions';
import CreerEnchere from '../pages/seller/CreerEnchere';
import MesEnchere from '../pages/seller/MesEnchere';
import { useAuth } from '../contexts/AuthContext';
 import Layout from '../components/Layout/Layout';
import ArticleList from '../pages/ArticleList';
import ArticleDetail from '../pages/ArticleDetail'; // Importer la page de détail d'article
import Layout1 from '../components/Layout/Layout1';
import { BidProvider } from '../pages/buyer/BidContext'; // chemin vers votre fichier BidContext  
import HistoriquePay from '../pages/seller/HistoriquePay';
import Dashboard from '../pages/admin/Dashboard';
import SuperDashboard from '../pages/superadmin/SuperDashboard';
import SuperAdminLogin from '../pages/superadmin/SuperAdminLogin';
import AdminProtectedRoute from './AdminProtectedRoute';
import About from '../pages/About';
import Wallet from '../pages/seller/Wallet';
import CreerArticle from '../pages/seller/CreerArticle';
import SellerArticles from '../pages/seller/SellerArticles';
import EncheresEnCours from '../pages/buyer/EncheresEnCours';
import Overview from '../pages/buyer/Overview';
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>

    {/* Routes publiques */}
    <Route path="/HomePage" element={ <Layout><HomePage /></Layout>} />
    <Route path="/login" element={<Layout1><LoginPage/></Layout1>} />
    <Route path="/signup" element={<Layout1><SignupPage /></Layout1>} />
   {/*} {<Route path="/profile" element={<Layout><ProfilePage/></Layout>} />}{*/}
    <Route path="/articles" element={<Layout><ArticleList /></Layout>} />
    <Route path="/articles/:id" element={<Layout> <ArticleDetail/></Layout>}/>
    <Route path="/buyer-dashboard" element={   <BidProvider><BuyerDashboard/></BidProvider> } />
    <Route path="/browseauctions" element={<Layout><BrowseAuctions/></Layout> }/>
    {/* Routes protégées accessibles à tous les utilisateurs connectés */}
    <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
    <Route path="/dashboard/encheres-encours" element={<Layout><EncheresEnCours /></Layout>}/>
    <Route path="/historyPaie" element={<Layout><HistoriquePay/></Layout>}/>
    <Route path="/creer-enchere" element={<Layout><CreerEnchere/></Layout>}/>
    <Route path="/mes-enchere" element={<Layout><MesEnchere/></Layout>}/>
    <Route path="/seller-dashboard" element={<BidProvider><Sellerboard/></BidProvider> } />
    <Route path="/admin-dashboard" element={<BidProvider><Dashboard/></BidProvider> } />
    <Route path="/about" element={<Layout><About/></Layout> } />
    <Route path="/Wallet" element={<Layout><Wallet/></Layout> } />
    <Route path="/creer-article" element={<Layout><CreerArticle/></Layout> } />  
    <Route path="/dashboard/seller/articles" element={<SellerArticles />} />
    <Route path="/activate-account" element={<Layout1><ActivateAccount /></Layout1>} />
    <Route path="/overview" element={<Layout1><Overview /></Layout1>} />
    {/* Routes spécifiques aux vendeurs */}
    {/*}<Route path="/seller-dashboard" element={<ProtectedRoute role="seller"><SellerDashboard/></ProtectedRoute>} />
    {/*<Route path="/creer-enchere" element={<ProtectedRoute role="seller"><CreerEnchere /></ProtectedRoute>} />
    <Route path="/mes-enchere" element={<ProtectedRoute role="seller"><MesEnchere /></ProtectedRoute>} />

    {/* Routes spécifiques aux acheteurs */}
    {/*<Route path="/buyer-dashboard" element={<ProtectedRoute role="buyer"><DashboardAc /></ProtectedRoute>} /> */}
    <Route path="/superadmin-login" element={<SuperAdminLogin />} />

    {/* Route protégée pour le tableau de bord du Super Admin */}
    <Route
      path="/superadmin-dashboard"
      element={
        <AdminProtectedRoute>
          <SuperDashboard />
        </AdminProtectedRoute>
      }
    />
    {/* Redirection par défaut pour les pages non trouvées */}
    <Route path="*" element={<Navigate to="/" />} />
  
  </Routes>
);

export default AppRoutes;
