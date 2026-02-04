import React from 'react';
import logo from '../imagens/images.png';
import '../styles/header.css';

const Header: React.FC = () => (
  <header>
    <h2>IVSS DEL HOSPITAL IVSS DR. JUVENAL BRACHO</h2>
    <div className="header-user">
      <img
        src={logo}
        alt="Hospital logo displayed to the Sistema Hospitalaria,"
        className="user-avatar"
      />
    </div>
  </header>
);
export default Header;