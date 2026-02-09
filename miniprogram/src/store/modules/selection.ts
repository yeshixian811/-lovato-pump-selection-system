import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { SelectionParams, SelectionResult, SelectionHistory, ApiResponse } from '@/types'
import { matchPump as matchPumpApi } from '@/services/pump'

interface SelectionState {
  results: SelectionResult[];
  loading: boolean;
  error: string | null;
  params: SelectionParams | null;
  selectedPump: SelectionResult | null;
  history: SelectionHistory[];
}

const initialState: SelectionState = {
  results: [],
  loading: false,
  error: null,
  params: null,
  selectedPump: null,
  history: []
}

// 异步 action - 水泵选型
export const matchPump = createAsyncThunk(
  'selection/matchPump',
  async (params: SelectionParams, { rejectWithValue }) => {
    try {
      const response = await matchPumpApi(params)
      if (response.success && response.data) {
        return { params, results: response.data }
      } else {
        return rejectWithValue(response.error || '选型失败')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '选型失败')
    }
  }
)

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearResults: (state) => {
      state.results = []
      state.params = null
      state.selectedPump = null
    },
    setSelectedPump: (state, action: PayloadAction<SelectionResult>) => {
      state.selectedPump = action.payload
    },
    clearHistory: (state) => {
      state.history = []
    },
    removeHistoryItem: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter((item) => item.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(matchPump.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(matchPump.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload.results
        state.params = action.payload.params

        // 保存到历史记录
        if (action.payload.results && action.payload.results.length > 0) {
          const historyItem: SelectionHistory = {
            id: `${Date.now()}`,
            params: action.payload.params,
            results: action.payload.results,
            timestamp: Date.now(),
          }
          state.history.unshift(historyItem)
          // 限制最多保存 50 条历史记录
          if (state.history.length > 50) {
            state.history = state.history.slice(0, 50)
          }
        }
      })
      .addCase(matchPump.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, clearResults, setSelectedPump, clearHistory, removeHistoryItem } = selectionSlice.actions

export default selectionSlice.reducer
