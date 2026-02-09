import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Pump, ApiResponse } from '@/types'
import { getPumps as getPumpsApi, getPumpById as getPumpByIdApi } from '@/services/pump'

interface PumpState {
  pumps: Pump[];
  currentPump: Pump | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  filters: any;
}

const initialState: PumpState = {
  pumps: [],
  currentPump: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 20,
  filters: {}
}

// 异步 action - 获取水泵列表
export const getPumps = createAsyncThunk(
  'pump/getPumps',
  async (params: { skip?: number; limit?: number; filters?: any } = {}, { rejectWithValue }) => {
    try {
      const response = await getPumpsApi(params)
      if (response.success && response.data) {
        return response.data
      } else {
        return rejectWithValue(response.error || '获取水泵列表失败')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取水泵列表失败')
    }
  }
)

// 异步 action - 获取水泵详情
export const getPumpById = createAsyncThunk(
  'pump/getPumpById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getPumpByIdApi(id)
      if (response.success && response.data) {
        return response.data
      } else {
        return rejectWithValue(response.error || '获取水泵详情失败')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取水泵详情失败')
    }
  }
)

const pumpSlice = createSlice({
  name: 'pump',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = action.payload
      state.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    }
  },
  extraReducers: (builder) => {
    // 获取水泵列表
    builder
      .addCase(getPumps.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPumps.fulfilled, (state, action) => {
        state.loading = false
        state.pumps = action.payload.pumps
        state.total = action.payload.total
      })
      .addCase(getPumps.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // 获取水泵详情
    builder
      .addCase(getPumpById.pending, (state) => {
        state.loading = true
      })
      .addCase(getPumpById.fulfilled, (state, action) => {
        state.loading = false
        state.currentPump = action.payload
      })
      .addCase(getPumpById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, setFilters, setPage } = pumpSlice.actions

export default pumpSlice.reducer
