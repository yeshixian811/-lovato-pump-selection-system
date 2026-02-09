import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage/storage'

import userReducer from './modules/user'
import pumpReducer from './modules/pump'
import selectionReducer from './modules/selection'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'] // 只持久化用户数据
}

const rootReducer = combineReducers({
  user: userReducer,
  pump: pumpReducer,
  selection: selectionReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
