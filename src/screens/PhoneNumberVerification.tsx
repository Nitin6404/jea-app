// src/screens/auth/steps/PhoneNumberVerification.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { useDispatch } from "react-redux";



import CustomOtp from "../components/auth/CustomOtp";
import CustomButton from "../components/ui/CustomButton";
import { commonStyles } from "../styles/CommonStyles";
import { showSnackbar } from "../redux/slice/snackbarSlice";
import { login } from "../redux/slice/authSlice";
import { onRegister } from "../apis/onRegister";
import { onResendOtp } from "../apis/onResendOtp";
import { TOKEN } from "../constant/AUTH";
import { Paths } from "../navigation/path";
import useThemeColors from "../hooks/useThemeColors";

type Props = {
  goNext: () => void;
  goBack: () => void;
  form: { phoneNumber: string; dialCode: string };
  otp: string;
  setOtp: (otp: string) => void;
  setTempToken: (token: string | null) => void;
};

const PhoneNumberVerification: React.FC<Props> = ({
  goNext,
  form,
  otp,
  setOtp,
  setTempToken,
}) => {
  const { colors } = useThemeColors();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [time, setTime] = useState(30);
  const [isValidating, setIsValidating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          stopTimer();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getFCMToken = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      // Ask nicely; ignore if user denies.
      await messaging().requestPermission().catch(() => {});
      const token = await messaging().getToken();
      messaging().onTokenRefresh(() => {});
      return token || null;
    } catch (e) {
      console.error("Error getting FCM token:", e);
      return null;
    }
  };

  const onVerifyOtp = async () => {
    if (isValidating) return;
    try {
      setIsValidating(true);

      const fcmToken = await getFCMToken();
      if (!fcmToken) {
        throw new Error("FCM token not found");
      }

      const payload = {
        phoneNumber: form.phoneNumber,
        otp,
        FCMToken: fcmToken,
      };

      const apiResponse = await onRegister({ payload });

      if (apiResponse?.response?.success) {
        const statusCode = apiResponse.response.statusCode;
        const data = apiResponse.response.data;
        const token = data?.token;
        const userData = data?.user;

        setTempToken(token);

        dispatch(
          showSnackbar({
            type: "success",
            title: "OTP verified successfully",
            placement: "top",
          })
        );

        stopTimer();

        if (statusCode === 200) {
          // Complete login
          dispatch(
            login({
              token,
              user: {
                id: userData?._id,
                name: userData?.name,
                username: userData?.username,
                phoneNumber: userData?.phoneNumber,
                email: userData?.email,
                fcmToken,
              },
            })
          );
          await AsyncStorage.setItem(TOKEN, token);
          navigation.navigate(Paths.MAIN_SCREEN as never);
        } else {
          // Continue onboarding
          setTimeout(() => goNext(), 300);
        }
      } else {
        const error =
          apiResponse?.response?.error || "Invalid OTP, please try again";
        dispatch(
          showSnackbar({
            type: "error",
            title: error,
            placement: "top",
          })
        );
      }
    } catch (e) {
      console.error("Error verifying OTP:", e);
      dispatch(
        showSnackbar({
          type: "error",
          title: "Error verifying OTP",
          placement: "top",
        })
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleResendOtp = async () => {
    setTime(30);
    startTimer();
    const res = await onResendOtp({
      payload: { phoneNumber: form.phoneNumber },
    });
    if (res?.response?.success) {
      dispatch(
        showSnackbar({
          type: "success",
          title: "OTP sent successfully",
          placement: "top",
        })
      );
    } else {
      dispatch(
        showSnackbar({
          type: "error",
          title: res?.response?.error || "Error sending OTP",
          placement: "top",
        })
      );
    }
  };

  useEffect(() => {
    startTimer();
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      style={[
        commonStyles.container,
        { backgroundColor: colors.surface, paddingHorizontal: 24 },
      ]}
    >
      <Text style={[commonStyles.heading, { color: colors.primary }]}>
        Enter verification code
      </Text>

      <Text style={styles.subtleText}>
        Code sent to +{form.dialCode} {form.phoneNumber}
      </Text>

      <View style={{ marginTop: 20, marginBottom: 8 }}>
        <CustomOtp onTextChange={setOtp} />
      </View>

      {time <= 0 ? (
        <TouchableOpacity onPress={handleResendOtp}>
          <Text style={[styles.resend, { color: colors.primary }]}>Resend</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.timerText}>Resend in {time}s</Text>
      )}

      <View style={{ marginTop: 24 }}>
        <CustomButton
          title="Verify code"
          onPress={onVerifyOtp}
          isLoading={isValidating}
          disabled={otp.length < 6 || isValidating}
          style={commonStyles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subtleText: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.8,
  },
  timerText: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.6,
  },
  resend: {
    textAlign: "center",
    marginTop: 8,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});

export default PhoneNumberVerification;
