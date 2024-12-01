import React from 'react';
import Header from '../Header/Header';

const Layout = ({ children }) => {
  return (
    <>
      <Header />  {/* Header visible sur toutes les pages */}
      <main>{children}</main>  {/* Le contenu de chaque page change ici */}
       {/* Footer visible sur toutes les pages */}
    </>
  );
};

export default Layout;
