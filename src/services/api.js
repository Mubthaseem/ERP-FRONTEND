import axios from 'axios';

/**
 * Dynamically resolves the API Base URL:
 * 1. Uses VITE_API_BASE_URL / VITE_API_URL from .env if defined.
 * 2. In browser, automatically connects to the server IP/Domain hosting the app on port 5000.
 *    (e.g., when loaded on http://178.18.254.224:6578, it routes to http://178.18.254.224:5000/api)
 * 3. Falls back to http://localhost:5000/api for local dev.
 */
export const getApiBaseUrl = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:5000/api`;
    }
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// System & Health
export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

// Products & Inventory
export const getProducts = async (params) => {
  const res = await api.get('/products', { params });
  return res.data;
};

export const createProduct = async (data) => {
  const res = await api.post('/products', data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

// Customers
export const getCustomers = async (params) => {
  const res = await api.get('/customers', { params });
  return res.data;
};

export const createCustomer = async (data) => {
  const res = await api.post('/customers', data);
  return res.data;
};

// Suppliers
export const getSuppliers = async (params) => {
  const res = await api.get('/suppliers', { params });
  return res.data;
};

export const createSupplier = async (data) => {
  const res = await api.post('/suppliers', data);
  return res.data;
};

// Purchases & Procurement
export const getPurchases = async (params) => {
  const res = await api.get('/purchases', { params });
  return res.data;
};

export const createPurchase = async (data) => {
  const res = await api.post('/purchases', data);
  return res.data;
};

export const receivePurchaseGoods = async (id) => {
  const res = await api.post(`/purchases/${id}/receive`);
  return res.data;
};

// Sales & POS Invoices
export const getSales = async (params) => {
  const res = await api.get('/sales', { params });
  return res.data;
};

export const createSaleInvoice = async (data) => {
  const res = await api.post('/sales', data);
  return res.data;
};

// Accounting & Financials
export const getAccounts = async () => {
  const res = await api.get('/accounting/accounts');
  return res.data;
};

export const getExpenses = async (params) => {
  const res = await api.get('/accounting/expenses', { params });
  return res.data;
};

export const createExpense = async (data) => {
  const res = await api.post('/accounting/expenses', data);
  return res.data;
};

export const getFinancialSummary = async () => {
  const res = await api.get('/accounting/financial-summary');
  return res.data;
};

// HRM & Employees
export const getEmployees = async (params) => {
  const res = await api.get('/hrm/employees', { params });
  return res.data;
};

export const createEmployee = async (data) => {
  const res = await api.post('/hrm/employees', data);
  return res.data;
};

// HRM Payroll & Wage Protection System (WPS)
export const getPayrolls = async () => {
  const res = await api.get('/hrm/payroll');
  return res.data;
};

export const calculateMonthlyPayroll = async (salaryMonth) => {
  const res = await api.post('/hrm/payroll/calculate', { salaryMonth });
  return res.data;
};

/**
 * Downloads the Saudi/UAE WPS SIF (Salary Information File)
 * Directly uses Axios to fetch from the active hosted server and trigger browser download.
 */
export const downloadWpsSif = async (payrollId, payrollNumber = 'PAYROLL') => {
  const res = await api.get(`/hrm/payroll/${payrollId}/wps`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `WPS_SIF_${payrollNumber}.sif`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;
