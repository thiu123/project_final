import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  InventorySummary,
  Paginated,
  StockAdjustment,
  StockAdjustmentResult,
  StockLevel,
  StockMovement,
  StockMovementQuery,
  StockQuery,
} from "@/types";

const BASE_URL = API_ENDPOINTS.INVENTORY;

export const getInventorySummary = () => {
  return axiosInstance.get<InventorySummary>(`${BASE_URL}/summary`);
};

export const getStockLevels = (query: StockQuery = {}) => {
  return axiosInstance.get<Paginated<StockLevel>>(`${BASE_URL}/stock`, {
    params: query,
  });
};

export const getStockMovements = (query: StockMovementQuery = {}) => {
  return axiosInstance.get<Paginated<StockMovement>>(`${BASE_URL}/movements`, {
    params: query,
  });
};

export const adjustStock = (bookId: string, adjustment: StockAdjustment) => {
  return axiosInstance.post<StockAdjustmentResult>(
    `${BASE_URL}/${bookId}/adjust`,
    adjustment
  );
};
