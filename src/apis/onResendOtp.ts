// jea-app/src/apis/onResendOtp.ts
import { apiService } from './apiService';
import { endpoints } from './endpoints';

export const onResendOtp = async ({ payload }: { payload: { phoneNumber: string } }) => {
  try {
    return await apiService({
      endpoint: endpoints.resendOtp,
      method: 'POST',
      data: payload,
      removeToken: true,
    });
  } catch (e) {
    console.error(e);
    return null;
  }
};