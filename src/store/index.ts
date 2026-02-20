import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import feedReducer from './slices/feedSlice';
import requestsReducer from './slices/requestsSlice';
import matrimonialReducer from './slices/matrimonialSlice';
import appearanceReducer from './slices/appearanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    requests: requestsReducer,
    matrimonial: matrimonialReducer,
    appearance: appearanceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

