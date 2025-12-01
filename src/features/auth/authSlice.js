import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {apiClient1} from "../../api/apiClient";
import { setToken as setCookieToken, getToken as getCookieToken, removeToken as removeCookieToken } from "../../utils/auth";

const parseJwtPayload = token => {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (raw) return JSON.parse(raw);
    const token = getCookieToken();
    if (!token) return null;
    const payload = parseJwtPayload(token);
    if (!payload) return null;
    return {
      email: payload.sub || payload.email || null,
      username: payload.username || null,
      roleName: payload.role || payload.roleName || null
    };
  } catch {
    return null;
  }
};

export const loginUser = createAsyncThunk("auth/loginUser", async (payload, { rejectWithValue }) => {
  try {
    const resp = await apiClient1.post("/auth/login", { email: payload.username, password: payload.password });
    return resp.data;
  } catch (err) {
    if (err.response && err.response.data) return rejectWithValue(err.response.data);
    return rejectWithValue({ success: false, message: err.message });
  }
});

const initialState = {
  token: getCookieToken() || null,
  user: getStoredUser(),
  loading: false,
  error: null,
  isAuthenticated: !!getCookieToken()
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      removeCookieToken();
      localStorage.removeItem("auth_user");
    },
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      setCookieToken(action.payload.token);
      try {
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      } catch {}
    }
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const token = payload.data?.token || null;
        const user = payload.data?.userData || null;
        state.token = token;
        state.user = user || getStoredUser();
        state.isAuthenticated = !!token;
        state.error = null;
        if (token) setCookieToken(token);
        try {
          if (user) localStorage.setItem("auth_user", JSON.stringify(user));
        } catch {}
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || "Login failed";
      });
  }
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
