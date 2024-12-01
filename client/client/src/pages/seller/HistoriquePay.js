// client/src/pages/PaymentHistory.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  Form,
  Row,
  Col,
  Card,
  Badge
} from 'react-bootstrap';
import '../../styles/PaymentHistory.css';

const PaymentHistory = ({ role }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    // Simuler un appel API pour récupérer les transactions de l'utilisateur
    const fetchTransactions = async () => {
      const response = await fetch(`/api/transactions?role=${role}`); // Remplacer par l'URL de votre API
      const data = await response.json();
      setTransactions(data);
      setFilteredTransactions(data);
    };

    fetchTransactions();
  }, [role]);

  const handleFilter = () => {
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      return (!start || transactionDate >= start) && (!end || transactionDate <= end);
    });
    setFilteredTransactions(filtered);
  };

  return (
    <Container className="payment-history">
      <h1 className="text-center my-4">Historique des Paiements</h1>
      
      <Card className="mb-4 p-3 shadow-sm">
        <Form>
          <Row>
            <Col md={5}>
              <Form.Group controlId="startDate">
                <Form.Label>Date de début</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId="endDate">
                <Form.Label>Date de fin</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={handleFilter}>
                Filtrer
              </button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Table responsive bordered hover className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Date</th>
            <th>Montant</th>
            <th>Type</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.amount} GTC</td>
                <td>
                  <Badge bg={transaction.type === 'achat' ? 'info' : 'success'}>
                    {transaction.type === 'achat' ? 'Achat' : 'Vente'}
                  </Badge>
                </td>
                <td>
                  <Badge bg={transaction.status === 'completed' ? 'success' : 'warning'}>
                    {transaction.status === 'completed' ? 'Complété' : 'En attente'}
                  </Badge>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                Aucun historique de paiement disponible.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default PaymentHistory;
