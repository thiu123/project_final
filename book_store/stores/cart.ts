import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  fetchCart as fetchCartApi,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
} from "@/api/cartApi";
import type { Cart, CartItem, ProductType } from "@/types";

export const useCartStore = defineStore("cart", () => {
  const cart = ref<Partial<Cart>>({});

  const items = computed<CartItem[]>(() => cart.value.items ?? []);

  async function fetchCart() {
    try {
      // Check if user is logged in
      const token = import.meta.client
        ? localStorage.getItem("accessToken")
        : null;
      if (!token) {
        clearCart();
        return;
      }

      const response = await fetchCartApi();
      cart.value = response.data || {};
    } catch (error) {
      console.error("Failed to fetch cart", error);
      // Clear cart on error (e.g., invalid token)
      clearCart();
    }
  }

  async function addToCart({
    bookId,
    quantity,
    productType,
  }: {
    bookId: string;
    quantity: number;
    productType: ProductType;
  }) {
    try {
      await addToCartApi(bookId, quantity, productType);
      await fetchCart();
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  }

  /**
   * Persists a quantity change. The cart screen used to mutate `item.quantity`
   * in the store only, so the server kept the original count and the order was
   * placed for the wrong number of copies.
   */
  async function updateCartItem(bookId: string, quantity: number) {
    try {
      await updateCartItemApi(bookId, quantity);
      await fetchCart();
    } catch (error) {
      console.error("Failed to update cart item", error);
      // Re-read so the row snaps back to whatever the server actually holds.
      await fetchCart();
    }
  }

  async function removeCartItem(bookId: string) {
    try {
      await removeCartItemApi(bookId);
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove cart item", error);
    }
  }

  function clearCart() {
    cart.value = { items: [] };
  }

  return {
    cart,
    items,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  };
});
