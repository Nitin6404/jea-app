import { apiService } from './apiService';
import { endpoints } from './endpoints';

interface OnUpdateDetailsParams {
  payload: {
    name: string;
    username: string;
    phoneNumber: string;
    email: string;
    profileImage?: string;
  };
  token: string;
}

export const onUpdateDetails = async ({
  payload,
  token,
}: OnUpdateDetailsParams) => {
  try {
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    const apiResponse = await apiService({
      endpoint: endpoints.userProfile,
      method: 'PATCH',
      data: payload,
      token: token,
      headers: headers,
    });

    return apiResponse;
  } catch (error: any) {
    console.error(error);
  }
};
