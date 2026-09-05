import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { Voucher } from "@/types";

const BASE_URL = API_ENDPOINTS.VOUCHER;

export interface VoucherValidationResponse {
  success: boolean;
  data: {
    voucher: Voucher;
    discountAmount: number;
  };
  message?: string;
}

export interface VoucherListResponse {
  success: boolean;
  data: Voucher[];
}

// Validate voucher code
export const validateVoucher = async (
  code: string,
  orderAmount: number
): Promise<VoucherValidationResponse> => {
  try {
    const response = await axiosInstance.post<VoucherValidationResponse>(
      `${BASE_URL}/validate`,
      {
        code,
        orderAmount,
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Apply voucher (increment usage count)
export const applyVoucher = async (code: string) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/apply`, { code });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Get vouchers. Pass activeOnly=true to only get vouchers a customer could
// actually redeem right now (used by checkout); omit it for the admin panel,
// which needs to see and manage inactive/expired vouchers too.
export const getAllVouchers = async (
  activeOnly = false
): Promise<VoucherListResponse> => {
  try {
    const response = await axiosInstance.get<VoucherListResponse>(
      `${BASE_URL}/all`,
      {
        params: activeOnly ? { activeOnly: true } : {},
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Create new voucher (admin only)
export const createVoucher = async (voucherData: Partial<Voucher>) => {
  try {
    const response = await axiosInstance.post(BASE_URL, voucherData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Update voucher (admin only)
export const updateVoucher = async (
  id: string,
  voucherData: Partial<Voucher>
) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, voucherData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Delete voucher (admin only)
export const deleteVoucher = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
