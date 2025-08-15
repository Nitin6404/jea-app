
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// Selectors with proper typing
import { RootState } from '../store';

import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

export interface User {
  // Define user properties as needed
  [key: string]: any;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout(state) {
      state.token = null;
      state.user = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      state.user = { ...state.user, ...action.payload };
    },
  },
});


export const loginUser = (userData: { token: string; user: User }) =>
  (dispatch: ThunkDispatch<AuthState, void, AnyAction>) => {
    dispatch(login(userData));
  };

export const logoutUser = () =>
  (dispatch: ThunkDispatch<AuthState, void, AnyAction>) => {
    dispatch(logout());
  };


export const { login, logout, setUser, updateUser } = authSlice.actions;
export default authSlice.reducer;


export const selectAuth = (state: RootState): AuthState => state.auth;
export const selectToken = (state: RootState): string | null => state.auth.token;
export const selectUser = (state: RootState): User | null => state.auth.user;
