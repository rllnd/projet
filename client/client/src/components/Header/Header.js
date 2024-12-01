import React, { useState, useRef, useEffect } from 'react';
import './Header.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Row } from "react-bootstrap";
import logo from '../../assets/images/Gtoken.webp';
import userIcon from '../../assets/images/user-icon.png';
import { useAuth } from '../../contexts/AuthContext';
import { RiHeartLine, RiShoppingBagLine, RiUserLine, RiLogoutBoxLine, RiMenuLine} from 'react-icons/ri';
import DashboardIcon from '../../assets/images/dashboard.svg';





const nav__links = [
  { path: '/HomePage', display: 'Accueil' },
  { path: '/articles', display: 'Articles' },
  { path: '/About', display: 'A propos' },
];

const Header = () => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const stickyHeaderFunc = () => {
    if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
      headerRef.current.classList.add("sticky__header");
    } else {
      headerRef.current.classList.remove("sticky__header");
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', stickyHeaderFunc);
    return () => window.removeEventListener('scroll', stickyHeaderFunc);
  }, []);

  const menuToggle = () => menuRef.current.classList.toggle('active__menu');
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <Row>
          <div className="nav__wrapper">
            <div className="logo">
              <img src={logo} alt="logo" />
              <h1>Gtoken</h1>
              <h5>Enchères</h5>
            </div>
            <div className="navigation" ref={menuRef}>
              <ul className="menu">
                {nav__links.map((item, index) => (
                  <li className="nav__item" key={index}>
                    <NavLink to={item.path} className={(navClass) => navClass.isActive ? "nav__active" : ""}>
                      {item.display}
                    </NavLink>
                  </li>
                ))}

                {/* Menu spécifique selon le rôle de l'utilisateur */}
                {user && user.role === 'seller' && (
                  <>
                    <li className="nav__item">
                      <NavLink to="/seller-dashboard" className="nav__link dashboard__button">
                         <img src={DashboardIcon} alt="Dashboard Icon" className="dashboard-icon" />
                             Dashboard
                      </NavLink>
                    </li>
                  </>
                )}

                {user && user.role === 'buyer' && (
                  <>
                    <li className="nav__item">
                      <NavLink to="/buyer-dashboard" className="nav__link dashboard__button">
                        <img src={DashboardIcon} alt="Dashboard Icon" className="dashboard-icon" />
                          Dashboard
                      </NavLink>
                    </li>
                   
                  </>
                )}

              </ul>
            </div>

            <div className="nav__icons">
              <span className="fav__icon">
                <RiHeartLine />
                <span className="badge">1</span>
              </span>
              <span className="cart__icon">
                <RiShoppingBagLine />
                <span className="badge">1</span>
              </span>

              {user ? (
                <div className="user-menu-container">
                  <span className="user-icon" onClick={toggleUserMenu}>
                    <img src={userIcon} alt="user icon" />
                  </span>
                  {showUserMenu && (
                    <div className="user-menu">
                      <NavLink to="/profile" className="dropdown-item">
                        <RiUserLine /> Mon Profil
                      </NavLink>
                      <button onClick={handleLogout} className="dropdown-item">
                        <RiLogoutBoxLine /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <NavLink to="/login" className="btn">Login</NavLink>
                  <NavLink to="/signup" className="btn btn-signup">Signup</NavLink>
                </div>
              )}

              <div className="mobile__menu" onClick={menuToggle}>
                <RiMenuLine />
              </div>
            </div>
          </div>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
