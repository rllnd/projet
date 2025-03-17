import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/categories';

export const getCategories = async () => {
  const response = await axios.get(`${API_BASE_URL}/list`);
  return response.data;
};

export const createCategory = async (category) => {
  const response = await axios.post(`${API_BASE_URL}/create`, category);
  return response.data;
};

export const updateCategory = async (id, category) => {
  const response = await axios.put(`${API_BASE_URL}/update/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/view/${id}`);
  return response.data;
};
