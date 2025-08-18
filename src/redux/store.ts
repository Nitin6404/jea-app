// store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authSlice from './slice/authSlice';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// persist configuration
const persistConfig = {
  key: 'root',
  keyPrefix: '',
  storage: AsyncStorage,
  whitelist: ['auth'], // only auth slice will persist
};

// root reducer
const rootReducer = combineReducers({
  auth: authSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // ignore non-serializable warnings from redux-persist
    }),
});

export const persistor = persistStore(store);

// ✅ Types for use across the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
