import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const BASE_URL = API_ENDPOINTS.VOUCHER;

// Validate voucher code
export const validateVoucher = async (code, orderAmount) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/validate`, {
      code,
      orderAmount,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Apply voucher (increment usage count)
export const applyVoucher = async (code) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/apply`, { code });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get vouchers. Pass activeOnly=true to only get vouchers a customer could
// actually redeem right now (used by checkout); omit it for the admin panel,
// which needs to see and manage inactive/expired vouchers too.
export const getAllVouchers = async (activeOnly = false) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/all`, {
      params: activeOnly ? { activeOnly: true } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new voucher (admin only)
export const createVoucher = async (voucherData) => {
  try {
    const response = await axiosInstance.post(BASE_URL, voucherData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update voucher (admin only)
export const updateVoucher = async (id, voucherData) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, voucherData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete voucher (admin only)
export const deleteVoucher = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
