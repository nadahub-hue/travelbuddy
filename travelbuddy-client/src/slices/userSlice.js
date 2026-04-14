import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const newUserThunk = createAsyncThunk(
  "user/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:7500/userRegister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      return data; 
    } catch (err) {
      return rejectWithValue({ flag: false, msg: "Register failed" });
    }
  }
);

export const loginThunk = createAsyncThunk(
  "user/login",
  async ({ email, pwd }, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:7500/userLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email, userPassword: pwd })
      });

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue({ loginStatus: false, msg: "Login failed" });
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    msg: "",
    user: null,
    loading: false,
    isLoggedIn: false
  },
  reducers: {
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.msg = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(newUserThunk.pending, (state) => {
        state.loading = true;
        state.msg = "";
      })
      .addCase(newUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.msg = action.payload.msg || "";
      })
      .addCase(newUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.msg = action.payload?.msg || "Registration failed";
      });

    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.msg = "";
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.msg = action.payload.serverMsg || "";
        state.isLoggedIn = !!action.payload.loginStatus;
        if (action.payload.loginStatus) {
          state.user = action.payload.user;
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.msg = action.payload?.msg || "Login failed";
        state.isLoggedIn = false;
      });
  }
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
