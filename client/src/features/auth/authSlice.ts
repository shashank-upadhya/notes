// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import authService from '../../services/authService';

// // Get user from localStorage
// const user = JSON.parse(localStorage.getItem('user') || 'null');

// const initialState = {
//   user: user ? user : null,
//   isError: false,
//   isSuccess: false,
//   isLoading: false,
//   message: '',
// };

// interface LoginData {
//   email: string;
//   otp: string;
// }

// interface UserData {
//   name: string;
//   dateOfBirth: string;
//   email: string;
//   password: string;
// }

// interface VerifyOtpData {
//   email: string;
//   otp: string;
// }

// // Async Thunks
// export const signup = createAsyncThunk<any, UserData>(
//   'auth/signup', 
//   async (userData, thunkAPI) => {
//     try {
//         return await authService.signup(userData);
//     } catch (error: any) {
//         const message = error.response?.data?.message || error.message || error.toString();
//         return thunkAPI.rejectWithValue(message);
//     }
// });

// export const verifyOtp = createAsyncThunk<any, VerifyOtpData>(
//   'auth/verifyOtp', 
//   async (otpData, thunkAPI) => {
//     try {
//         return await authService.verifyOtp(otpData);
//     } catch (error: any) {
//         const message = error.response?.data?.message || error.message || error.toString();
//         return thunkAPI.rejectWithValue(message);
//     }
// });

// export const generateLoginOtp = createAsyncThunk('auth/generateLoginOtp', async (email: string, thunkAPI) => {
//     try {
//         return await authService.generateLoginOtp(email);
//     } catch (error: any) {
//         const message = error.response?.data?.message || error.message || error.toString();
//         return thunkAPI.rejectWithValue(message);
//     }
// });

// export const loginWithOtp = createAsyncThunk<any, LoginData>(
//   'auth/loginWithOtp', 
//   async (loginData, thunkAPI) => {
//     try {
//         return await authService.loginWithOtp(loginData);
//     } catch (error: any) {
//         const message = error.response?.data?.message || error.message || error.toString();
//         return thunkAPI.rejectWithValue(message);
//     }
// });

// export const logout = createAsyncThunk('auth/logout', async () => {
//     authService.logout();
// });


// export const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     reset: (state) => {
//       state.isLoading = false;
//       state.isSuccess = false;
//       state.isError = false;
//       state.message = '';
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Handle pending, fulfilled, and rejected states for all thunks
//       .addCase(signup.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(signup.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isSuccess = true;
//         state.message = action.payload.message;
//       })
//       .addCase(signup.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isError = true;
//         state.message = action.payload as string;
//       })
//       .addCase(verifyOtp.fulfilled, (state, action) => {
//         state.isSuccess = true;
//         state.user = action.payload;
//       })
//       .addCase(loginWithOtp.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isSuccess = true;
//         state.user = action.payload;
//       })
//       .addCase(logout.fulfilled, (state) => {
//         state.user = null;
//       })
//       // You can add more cases for other thunks similarly
//       ;
//   },
// });

// export const { reset } = authSlice.actions;
// export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user') || 'null');

const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  loadingAction: 'idle', // Can be 'idle', 'signup', 'verify', 'getOtp', 'login'
  message: '',
};

// --- Type Definitions ---
interface LoginData { email: string; otp: string; }
interface UserData { name: string; dateOfBirth: string; email: string; password: string; }
interface VerifyOtpData { email: string; otp: string; }

// --- Async Thunks ---
export const signup = createAsyncThunk<any, UserData>('auth/signup', async (userData, thunkAPI) => {
    try {
        return await authService.signup(userData);
    } catch (error: any) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const verifyOtp = createAsyncThunk<any, VerifyOtpData>('auth/verifyOtp', async (otpData, thunkAPI) => {
    try {
        return await authService.verifyOtp(otpData);
    } catch (error: any) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const generateLoginOtp = createAsyncThunk('auth/generateLoginOtp', async (email: string, thunkAPI) => {
    try {
        return await authService.generateLoginOtp(email);
    } catch (error: any) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const loginWithOtp = createAsyncThunk<any, LoginData>('auth/loginWithOtp', async (loginData, thunkAPI) => {
    try {
        return await authService.loginWithOtp(loginData);
    } catch (error: any) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const logout = createAsyncThunk('auth/logout', async () => {
    authService.logout();
});


export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      // ✅ CORRECTED THIS FUNCTION
      state.loadingAction = 'idle';
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.loadingAction = 'signup';
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loadingAction = 'idle';
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loadingAction = 'idle';
        state.isError = true;
        state.message = action.payload as string;
      })
      // ✅ UPDATED THIS SECTION
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loadingAction = 'verify';
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loadingAction = 'idle';
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loadingAction = 'idle';
        state.isError = true;
        state.message = action.payload as string;
      })
      // Generate Login OTP
      .addCase(generateLoginOtp.pending, (state) => {
        state.loadingAction = 'getOtp';
      })
      .addCase(generateLoginOtp.fulfilled, (state, action) => {
        state.loadingAction = 'idle';
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(generateLoginOtp.rejected, (state, action) => {
        state.loadingAction = 'idle';
        state.isError = true;
        state.message = action.payload as string;
      })
      // Login with OTP
      .addCase(loginWithOtp.pending, (state) => {
        state.loadingAction = 'login';
      })
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.loadingAction = 'idle';
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(loginWithOtp.rejected, (state, action) => {
        state.loadingAction = 'idle';
        state.isError = true;
        state.message = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;