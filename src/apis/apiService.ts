import axios from 'axios';
import { BACKEND_URL } from './backendUrl';
import { selectToken } from '../redux/slice/authSlice';
import { store } from '../redux/store';

interface ApiServiceParams {
  endpoint: string;
  method?: string;
  data?: any;
  params?: any;
  token?: string;
  headers?: any;
  customUrl?: string;
  removeToken?: boolean;
  signal?: AbortSignal;
}

export const apiService = async ({
  endpoint,
  method = 'GET',
  data,
  params,
  token: _token,
  headers,
  customUrl,
  removeToken = false,
  signal,
}: ApiServiceParams) => {
  try {
    const token = selectToken(store.getState());
    // console.log(token)

    const requestObj = {
      url: `${customUrl ? customUrl : BACKEND_URL}/${endpoint}`,
      params,
      method,
      data,
      signal,
    };

    if (token || _token) {
      requestObj.headers = {
        ...headers,
        'ngrok-skip-browser-warning': 'xyz',
        ...(!removeToken ? { Authorization: `Bearer ${_token || token}` } : {}),
      };
    }

    const { data: res } = await axios(requestObj);

    return { response: res };
  } catch (error: any) {
    console.error('API Error:', error.response || error, endpoint);
    return { success: false, error: true, ...(error || {}) };
  }
};
