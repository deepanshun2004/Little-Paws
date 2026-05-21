import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { apiUrl } from "@/lib/api";
const initialState = {
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        apiUrl("/api/shop/order/create"),
        orderData,
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId) => {
    const response = await axios.get(
      apiUrl(`/api/shop/order/list/${userId}`),
      { withCredentials: true }
    );

    return response.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(
      apiUrl(`/api/shop/order/details/${id}`),
      { withCredentials: true }
    );

    return response.data;
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
    upsertOrderInList: (state, action) => {
      const updatedOrder = action.payload;
      if (!updatedOrder?._id) {
        return;
      }

      const existingIndex = state.orderList.findIndex(
        (order) => String(order._id) === String(updatedOrder._id)
      );

      if (existingIndex >= 0) {
        state.orderList[existingIndex] = {
          ...state.orderList[existingIndex],
          ...updatedOrder,
        };
      } else {
        state.orderList.unshift(updatedOrder);
      }

      if (String(state.orderDetails?._id) === String(updatedOrder._id)) {
        state.orderDetails = {
          ...state.orderDetails,
          ...updatedOrder,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.orderId;
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.orderId = null;
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data || [];
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const { resetOrderDetails, upsertOrderInList } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
