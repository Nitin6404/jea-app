// jea-app/src/apis/onSendOtp.ts
import { apiService } from './apiService';
import { endpoints } from './endpoints';

export const onSendOtp = async ({ payload }: { payload: { phoneNumber: string } }) => {
  try {
    return await apiService({
      endpoint: endpoints.sendOtp,
      method: 'POST',
      data: payload,
      removeToken: true,
    });
  } catch (e) {
    console.error(e);
    return null;
  }
};