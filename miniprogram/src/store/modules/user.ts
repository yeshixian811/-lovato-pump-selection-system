import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import Taro from '@tarojs/taro'
import { User, LoginRequest, RegisterRequest, ApiResponse } from '@/types'
import { login as loginApi, register as registerApi, getUserInfo as getUserInfoApi } from '@/services/user'

interface UserState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isLogged: boolean;
}

const initialState: UserState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isLogged: false
}

// 异步 action - 登录
export const login = createAsyncThunk(
  'user/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials)
      if (response.success && response.data) {
        // 保存 token
        Taro.setStorageSync('token', response.data.token)
        Taro.setStorageSync('user', response.data.user)
        return response.data
      } else {
        return rejectWithValue(response.error || '登录失败')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '登录失败')
    }
  }
)

// 异步 action - 注册
export const register = createAsyncThunk(
  'user/register',
  async (credentials: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await registerApi(credentials)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || '注册失败')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '注册失败')
    }
  }
)

// 异步 action - 获取用户信息
export const getUserInfo = createAsyncThunk(
  'user/getUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const token = Taro.getStorageSync('token')
      if (!token) {
        return rejectWithValue('未登录')
      }

      const response = await getUserInfoApi()
      if (response.success && response.data) {
        Taro.setStorageSync('user', response.data)
        return response.data
      } else {
        return rejectWithValue(response.error || '获取用户信息失败')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取用户信息失败')
    }
  }
)

// 异步 action - 登出
export const logout = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('user')
      return true
    } catch (error: any) {
      return rejectWithValue(error.message || '登出失败')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      state.isLogged = !!action.payload
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    }
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isLogged = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isLogged = false
      })

    // 注册
    builder
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // 获取用户信息
    builder
      .addCase(getUserInfo.pending, (state) => {
        state.loading = true
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(getUserInfo.rejected, (state) => {
        state.loading = false
      })

    // 登出
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isLogged = false
      })
  }
})

export const { clearError, setToken, setUser } = userSlice.actions

export default userSlice.reducer
