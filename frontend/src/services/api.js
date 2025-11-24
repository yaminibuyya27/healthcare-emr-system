// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user ID
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.user_id) {
      config.headers['X-User-ID'] = user.user_id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication
export const login = (username, password) => {
  return api.post('/login', { username, password });
};

// Patients
export const getPatients = (limit = 100, offset = 0) => {
  return api.get(`/patients?limit=${limit}&offset=${offset}`);
};

export const getAllPatients = () => {
  return api.get('/patients/all');
};

export const getPatientById = (patientId) => {
  return api.get(`/patients/${patientId}`);
};

export const searchPatients = (searchTerm) => {
  return api.get(`/patients/search?q=${searchTerm}`);
};

export const addPatient = (patientData) => {
  return api.post('/patients', patientData);
};

// Doctors
export const getDoctors = () => {
  return api.get('/doctors');
};

// Appointments
export const getAppointments = () => {
  return api.get('/appointments');
};

export const scheduleAppointment = (appointmentData) => {
  return api.post('/appointments', appointmentData);
};

// Medications
export const getMedications = () => {
  return api.get('/medications');
};

// Prescriptions
export const getPrescriptions = () => {
  return api.get(`/prescriptions?t=${Date.now()}`);
};

export const createPrescription = (prescriptionData) => {
  return api.post('/prescriptions', prescriptionData);
};

export const updatePrescription = (prescriptionId, prescriptionData) => {
  return api.put(`/prescriptions/${prescriptionId}`, prescriptionData);
};

export const deletePrescription = (prescriptionId) => {
  return api.delete(`/prescriptions/${prescriptionId}`);
};

// Audit Log
export const getAuditLog = (limit = 50) => {
  return api.get(`/audit-log?limit=${limit}`);
};

// Health Check
export const healthCheck = () => {
  return api.get('/health');
};

export default api;