import React from 'react';
import { Row, Col, Card, Divider } from 'antd'; 
import { Typography } from '@mui/material'; 
import ContactForm from '../components/Contact/ContactForm';
import ContactInfo from '../components/Contact/ContactInfo';
import SocialLinks from '../components/Contact/SocialLinks';
import OpeningHours from '../components/Contact/OpeningHours';
import PrivacyPolicy from '../components/Contact/PrivacyPolicy';
import Feedback from '../components/Contact/FeedBack';
import { teal } from '@mui/material/colors'; 

const ContactPage = () => (
  <div style={{ padding: '20px', backgroundColor: '#f0f4f8' }}> {/* Couleur de fond plus claire */}
    <Typography variant="h4" align="center" style={{ color: '#333', marginBottom: '20px' }}>
      Contactez-nous
    </Typography>

    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Card
          title="Contactez-nous"
          bordered={false}
          style={{
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff', // Couleur de fond claire
            color: '#333', // Couleur du texte sombre
          }}
        >
          <ContactForm />
          <Feedback />
        </Card>
      </Col>

      <Col xs={24} md={12}>
        <Card
          title="Informations"
          bordered={false}
          style={{
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff', // Couleur de fond claire
            color: '#333', // Couleur du texte sombre
          }}
        >
          <ContactInfo />
          <Divider style={{ margin: '20px 0', backgroundColor: teal[700] }} />
          <SocialLinks />
          <Divider style={{ margin: '20px 0', backgroundColor: teal[700] }} />
          <OpeningHours />
          <Divider style={{ margin: '20px 0', backgroundColor: teal[700] }} />
          <PrivacyPolicy />
        </Card>
      </Col>
    </Row>
  </div>
);

export default ContactPage;