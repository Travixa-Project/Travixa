import axios from 'axios';

// Base URLs for each microservice
const AUTH_URL = 'http://localhost:8081/api';
const USER_URL = 'http://localhost:8082/api';
const PACKAGE_URL = 'http://localhost:8083/api';
const BOOKING_URL = 'http://localhost:8084/api';
const PAYMENT_URL = 'http://localhost:8085/api';
const ENQUIRY_URL = 'http://localhost:8086/api';
const REVIEW_URL = 'http://localhost:5000/api';
const AI_URL = 'http://localhost:8000/api';

// Create Axios instances per service
function createApi(baseURL) {
  const api = axios.create({ baseURL });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return api;
}

export const authApi = createApi(AUTH_URL);
export const userApi = createApi(USER_URL);
export const packageApi = createApi(PACKAGE_URL);
export const bookingApi = createApi(BOOKING_URL);
export const paymentApi = createApi(PAYMENT_URL);
export const enquiryApi = createApi(ENQUIRY_URL);
export const reviewApi = createApi(REVIEW_URL);
export const aiApi = createApi(AI_URL);
