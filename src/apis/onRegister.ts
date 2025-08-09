import { apiService } from './apiService';
import { endpoints } from './endpoints';

interface OnRegisterParams {
  payload: {
    phoneNumber: string;
    otp: string;
    FCMToken: string;
  };
}

export const onRegister = async ({ payload }: OnRegisterParams) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.signup,
      method: 'POST',
      data: payload,
      removeToken: true,
    });
    return apiResponse;
  } catch (error: any) {
    console.error(error);
  }
};
