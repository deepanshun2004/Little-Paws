import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

import { API_BASE_URL } from "@/lib/api";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
};

function getFirebaseUser() {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function authenticateWithGoogleIdToken(idToken) {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/google`,
    { idToken },
    {
      withCredentials: true,
    }
  );

  return response.data;
}

export const registerUser = createAsyncThunk(
  "/auth/register",

  async (formData) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/register`,
      formData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",

  async (formData) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      formData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const loginWithGoogle = createAsyncThunk(
  "/auth/google",

  async (_, { rejectWithValue }) => {
    try {
      console.log("[Auth] Initiating Google sign-in popup...");
      const credential = await signInWithPopup(auth, googleProvider);
      console.log("[Auth] Google popup closed successfully. User:", credential.user.email);
      
      const idToken = await credential.user.getIdToken();
      console.log(`[Auth] ID Token retrieved (length: ${idToken.length})`);

      console.log("[Auth] Sending ID token to backend for verification...");
      return await authenticateWithGoogleIdToken(idToken);
    } catch (error) {
      console.error("[Auth] Google sign-in failed:", error);
      
      const backendError = error?.response?.data;
      if (backendError && import.meta.env.MODE === "development") {
        console.error("[Auth] Backend rejected token. Details:", backendError);
      }

      return rejectWithValue({
        message: backendError?.message || error?.message || "Google sign-in failed",
        code: backendError?.code || "UNKNOWN_ERROR",
        details: backendError?.details || null,
        isDev: import.meta.env.MODE === "development"
      });
    }
  }
);

export const restoreFirebaseSession = createAsyncThunk(
  "/auth/restore-firebase-session",

  async (_, { rejectWithValue }) => {
    const user = await getFirebaseUser();

    if (!user) {
      console.log("[Auth Restore] Session skipped (no firebase user)");
      return rejectWithValue({ message: "No Firebase session found" });
    }

    try {
      const idToken = await user.getIdToken();
      const response = await authenticateWithGoogleIdToken(idToken);
      console.log("[Auth Restore] Session restored successfully");
      return response;
    } catch (error) {
      console.error("[Auth Restore] Session restore failed:", error);
      return rejectWithValue({
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to restore Google session",
      });
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  "/auth/reset-password",

  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/forgot-password`,
        { email },
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error?.response?.data?.message ||
          "Unable to send reset email right now.",
      });
    }
  }
);

export const resetPassword = createAsyncThunk(
  "/auth/reset-password",

  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/reset-password`,
        { token, password },
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error?.response?.data?.message ||
          "Unable to reset password.",
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",

  async () => {
    let response;

    try {
      await signOut(auth);
      console.log("[Logout] Firebase signOut success");
    } catch (error) {
      console.error("[Logout] Firebase signOut failed", error);
    } finally {
      response = await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    }

    return response.data;
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",

  async () => {
    const response = await axios.get(
      `${API_BASE_URL}/api/auth/check-auth`,
      {
        withCredentials: true,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
    return response.data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.error?.message || "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        state.error = action.payload.success ? null : action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.error?.message || "Login failed";
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        state.error = action.payload.success ? null : action.payload.message;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || action.error?.message || "Google sign-in failed";
      })
      .addCase(restoreFirebaseSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreFirebaseSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        state.error = action.payload.success ? null : action.payload.message;
      })
      .addCase(restoreFirebaseSession.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || null;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        state.error = action.payload.success ? null : action.payload.message;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
