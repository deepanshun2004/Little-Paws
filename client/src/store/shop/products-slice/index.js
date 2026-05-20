import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { apiUrl } from "@/lib/api";
const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  wishlist: [],
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams, userId }) => {
    const cleanedParams = Object.fromEntries(
      Object.entries({
        ...filterParams,
        sortBy: sortParams,
        userId: userId || "",
      }).filter(([, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }

        return value !== undefined && value !== null && String(value).trim() !== "";
      })
    );
    const query = new URLSearchParams(cleanedParams);

    const result = await axios.get(apiUrl(`/api/shop/products/get?${query}`));
    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async ({ id, userId }) => {
    const query = new URLSearchParams({
      userId: userId || "",
    });
    const result = await axios.get(
      apiUrl(`/api/shop/products/get/${id}?${query}`)
    );

    return result?.data;
  }
);

export const saveProductReview = createAsyncThunk(
  "/products/saveReview",
  async ({ productId, reviewData }) => {
    const result = await axios.post(
      apiUrl(`/api/shop/products/review/${productId}`),
      reviewData,
      { withCredentials: true }
    );
    return result.data;
  }
);

export const toggleWishlistItem = createAsyncThunk(
  "/products/toggleWishlist",
  async ({ userId, productId }) => {
    const result = await axios.post(
      apiUrl("/api/shop/products/wishlist/toggle"),
      { userId, productId },
      { withCredentials: true }
    );
    return { ...result.data, productId };
  }
);

export const fetchWishlist = createAsyncThunk(
  "/products/fetchWishlist",
  async (userId) => {
    const result = await axios.get(
      apiUrl(`/api/shop/products/wishlist/${userId}`),
      { withCredentials: true }
    );
    return result.data;
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.isLoading = false;
        state.productDetails = null;
      })
      .addCase(saveProductReview.fulfilled, (state, action) => {
        state.productDetails = action.payload.data;
        state.productList = state.productList.map((product) =>
          product._id === action.payload.data._id ? action.payload.data : product
        );
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload.data || [];
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        if (action.payload.wishlisted) {
          const product = state.productList.find((item) => item._id === action.payload.productId);
          if (product && !state.wishlist.some((item) => item._id === product._id)) {
            state.wishlist.push({ ...product, wishlisted: true });
          }
        } else {
          state.wishlist = state.wishlist.filter((item) => item._id !== action.payload.productId);
        }
        if (state.productDetails?._id === action.payload.productId) {
          state.productDetails = {
            ...state.productDetails,
            wishlisted: action.payload.wishlisted,
          };
        }
      });
  },
});

export default shoppingProductSlice.reducer;
