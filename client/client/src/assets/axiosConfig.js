import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000', // URL de votre API backend
  withCredentials: true, // Active l'envoi des credentials (comme les cookies) avec chaque requête
});

export default instance;
