import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Dummy async thunk for login/register
export const loginThunk = createAsyncThunk(
  "user/login",
  async ({ email, pwd }) => {
    if (!email || !pwd) throw new Error("Missing credentials");
    if (!email.includes("@")) throw new Error("Invalid email");
    return { email };
  }
);

export const registerThunk = createAsyncThunk(
  "user/register",
  async ({ name, email, pwd, confirmPwd }) => {
    if (!name || !email || !pwd || !confirmPwd) throw new Error("Missing fields");
    if (pwd !== confirmPwd) throw new Error("Passwords must match");
    return { name, email };
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    isLoggedIn: false,
    msg: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.fulfilled, (state) => {
        state.isLoggedIn = true;
        state.msg = "Logged in successfully";
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.msg = action.error.message;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.msg = "Registered successfully";
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.msg = action.error.message;
      });
  },
});

export default userSlice.reducer;
