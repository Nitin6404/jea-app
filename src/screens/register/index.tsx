import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontStyles } from '../../styles/fontStyle';
import CustomOtp from '../../components/auth/CustomOtp';
import UserAgreement from '../../components/footer/UserAgreement';
import { useNavigation } from '@react-navigation/native';
import CustomTextInput from '../../components/ui/CustomTextField';
import CustomButton from '../../components/ui/CustomButton';
import { DatePicker } from 'react-native-wheel-pick';
import { onRegister } from '../../apis/onRegister';
import { Paths } from '../../navigation/path';
import { onUpdateDetails } from '../../apis/onUpdateDetails';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/slice/authSlice';
import CustomPhoneInput from '../../components/ui/CustomPhoneInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN } from '../../constant/AUTH';
import { showSnackbar } from '../../redux/slice/snackbarSlice';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import useThemeColors from '../../hooks/useThemeColors';
import { Button } from 'react-native-paper';
interface Form {
  phoneNumber: string;
  dialCode: string;
}

interface RegisterProps {
  goNext: () => void;
  goBack: () => void;
  form: Form;
  otp: string;
  setOtp: (otp: string) => void;
  setTempToken: (token: string) => void;
}

interface PhoneNumberFormProps {
  goNext: () => void;
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
}

const PhoneNumberForm: React.FC<PhoneNumberFormProps> = ({
  goNext,
  form,
  setForm,
}) => {
  const phoneInput = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { colors } = useThemeColors();

  const onUserRegister = async () => {
    const phoneNumberLength = form.phoneNumber.length;

    if (phoneNumberLength === 10) {
      goNext();
    } else {
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Please enter a valid 10-digit phone number',
          placement: 'top',
        }),
      );
    }
  };

  const onStartScreen = () => {
    navigation.navigate('Start');
  };

  const onChangeNumber = (number: string) => {
    const dialCode = (phoneInput.current as any)?.getCallingCode() || '';
    const sanitizedText = number.replace(/[^0-9]/g, '');
    setForm((prev: Form) => ({
      ...prev,
      dialCode: dialCode,
      phoneNumber: sanitizedText,
    }));
  };

  return (
    <>
      <LinearGradient
        colors={['#CEFFCF', '#F7FBF2', '#F7FBF2', '#F7FBF2']}
        style={styles.phoneNumberFormContainer}
      >
        <View style={styles.phoneNumberTopContainer}>
          <View style={styles.phoneInputContainer}>
            {/* Header Section */}
            <View style={styles.phoneInputHeaderContainer}>
              <Text
                style={[
                  styles.phoneInputHeaderWelcomeText,
                  { color: colors.primary },
                ]}
              >
                Welcome!
              </Text>
              <Text style={styles.phoneInputHeaderToText}>
                to Jamia Entrance Adda
              </Text>
            </View>

            {/* Image Section */}
            <View style={styles.phoneInputImageContainer}>
              <Image
                source={require('../../assets/images/education-students.png')}
                style={styles.phoneInputImage}
              />
            </View>

            <View style={styles.phoneFormContainer}>
              <CustomPhoneInput
                ref={phoneInput}
                value={form.phoneNumber}
                onChangeText={onChangeNumber}
                autoFocus={true}
              />
            </View>

            <CustomButton title="Continue" onClick={onUserRegister} />
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 5,
              }}
            >
              <Text>--- OR ---</Text>
            </View>
            <Button
              icon={require('../../assets/icons/google.png')}
              mode="outlined"
              buttonColor="#fff"
              textColor="#181D18"
              onPress={onStartScreen}
              style={{
                width: '100%',
                borderRadius: 8,
              }}
            >
              Sign In WIth Google
            </Button>
          </View>
        </View>

        <UserAgreement />
      </LinearGradient>
    </>
  );
};

interface PhoneNumberVerificationProps {
  goNext: () => void;
  goBack: () => void;
  form: Form;
  otp: string;
  setOtp: (otp: string) => void;
  setTempToken: (token: string) => void;
}

const PhoneNumberVerification: React.FC<PhoneNumberVerificationProps> = ({
  goNext,
  goBack,
  form,
  otp,
  setOtp,
  setTempToken,
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [time, setTime] = useState(30);
  const [isValidating, setIsValidating] = useState(false);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const onChangeOtp = (currentOtp: string) => {
    setOtp(currentOtp);
  };

  const getToken = async () => {
    try {
      // Register for remote messages before getting the token (required on iOS, safe on Android)
      await messaging().registerDeviceForRemoteMessages();
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        return fcmToken;
      }
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };

  const onVerifyOtp = async () => {
    if (isValidating) {
      return;
    }

    try {
      setIsValidating(true);

      const fcmToken = await getToken();

      if (!fcmToken) {
        throw new Error('FCM token not found');
      }

      const payload = {
        phoneNumber: form.phoneNumber,
        otp: otp,
        FCMToken: fcmToken,
      };

      const apiResponse = await onRegister({ payload });

      if (apiResponse?.response?.success) {
        const statusCode = apiResponse?.response?.statusCode;

        const data = apiResponse?.response?.data;
        const token = data?.token;
        const userData = data?.user;

        setTempToken(token);

        // dispatch(
        //   login({
        //     token: token,
        //     user: {
        //       id: userData?._id,
        //       name: userData?.name,
        //       username: userData?.username,
        //       phoneNumber: userData?.phoneNumber,
        //       email: userData?.email,
        //     },
        //   }),
        // );
        // await AsyncStorage.setItem(TOKEN, token);

        dispatch(
          showSnackbar({
            type: 'success',
            title: 'OTP verified successfully',
            placement: 'top',
          }),
        );

        stopTimer();

        if (statusCode === 200) {
          dispatch(
            loginUser({
              token: token,
              user: {
                id: userData?._id,
                name: userData?.name,
                username: userData?.username,
                phoneNumber: userData?.phoneNumber,
                email: userData?.email,
                fcmToken: fcmToken,
              },
            }),
          );
          await AsyncStorage.setItem(TOKEN, token);
          navigation.navigate(Paths.MAIN_SCREEN);
        } else {
          setTimeout(() => {
            goNext();
          }, 500);
        }
      } else {
        const error =
          apiResponse?.response?.error || 'Invalid OTP, please try again';
        dispatch(
          showSnackbar({
            type: 'error',
            title: error || 'Please enter a valid 10-digit phone number',
            placement: 'top',
          }),
        );
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Error verifying OTP:',
          placement: 'top',
        }),
      );
    } finally {
      setIsValidating(false);
    }
  };

  const onResendOtp = () => {
    setTime(30);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <>
      <View style={styles.phoneOtpContainer}>
        <View style={styles.otpNumberContainer}>
          <Text style={styles.otpNumberTextHeader}>
            Verification code has been sent to{' '}
          </Text>
          <Text style={[FontStyles.heading, styles.otpNumberTextSubHeader]}>
            +{form.dialCode} {form.phoneNumber}
          </Text>
          <View style={styles.otpContainer}>
            <CustomOtp onTextChange={onChangeOtp} />
            {time <= 0 ? (
              <TouchableOpacity onPress={onResendOtp}>
                <Text style={styles.resendText}>Resend</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTextTimer}>Resend in {time}s</Text>
            )}
          </View>

          <View style={styles.verifyCodeContainer}>
            <CustomButton
              title="Verify code"
              onClick={onVerifyOtp}
              style={styles.verfiyCodeButton}
              isLoading={isValidating}
              disabled={otp.length < 6 || isValidating}
            />
          </View>
        </View>
      </View>
    </>
  );
};

interface NameInputProps {
  goNext: () => void;
  goBack: () => void;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  tempToken?: string | null;
}

const NameInput: React.FC<NameInputProps> = ({
  goNext,
  goBack,
  form,
  setForm,
}) => {
  const onChangeName = (name: string) => {
    setForm((prev: any) => ({
      ...prev,
      name: name,
    }));
  };
  return (
    <View style={styles.nameInputContainer}>
      {/* <TouchableOpacity onPress={goBack}>
        <View style={styles.iconBox}>
          <Icon name="chevron-back" size={30} color="#fff" />
        </View>
      </TouchableOpacity> */}

      <View style={styles.nameInputInnerContainer}>
        <Text style={[FontStyles.heading, styles.otpNumberTextSubHeader]}>
          What's your name?
        </Text>
        <CustomTextInput
          placeholder="Enter Full Name..."
          onChangeText={onChangeName}
          value={form.name}
          autoFocus={true}
        />
        <View style={styles.nameInputIconContainer}>
          <TouchableOpacity onPress={goNext}>
            <View style={styles.nameInputIconBox}>
              <Icon name="chevron-forward" size={30} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const Register: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [tempToken, setTempToken] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    dialCode: '91',
    phoneNumber: '',
    name: '',
    dob: null,
    gender: 'Male',
    username: '',
    password: '',
    confirmPassword: '',
    profilePicture: null,
  });

  const [otp, setOtp] = useState<string>('');

  const goNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PhoneNumberForm goNext={goNext} form={form} setForm={setForm} />
        );
      case 2:
        return (
          <PhoneNumberVerification
            goNext={goNext}
            goBack={goBack}
            form={form}
            otp={otp}
            setOtp={setOtp}
            setTempToken={setTempToken}
          />
        );
      case 3:
        return (
          <NameInput
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
            tempToken={tempToken}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
};

export default Register;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '60%',
  },

  headingText: {
    color: '#fff',
  },
  iconBox: {
    paddingHorizontal: 10,
    paddingVertical: 30,
  },

  // Phone Number Form Styles
  phoneNumberFormContainer: {
    flex: 1,
    // background: linear-gradient(180deg, #CEFFCF 0%, #F7FBF2 25%, #F7FBF2 50%, #F7FBF2 100%);
    justifyContent: 'space-between',
  },
  phoneNumberTopContainer: {
    display: 'flex',
    gap: 64,
  },
  phoneInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    paddingHorizontal: 40,
  },
  phoneFormContainer: {
    display: 'flex',
    width: '100%',
    gap: 20,
  },

  // Phone OTP Verification Styles
  phoneOtpContainer: {
    flex: 1,
    backgroundColor: '#181818',
  },
  phoneInputHeaderContainer: {
    display: 'flex',
    gap: 8,
    // paddingTop: 80,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneInputHeaderWelcomeText: {
    fontSize: 26,
    fontWeight: 'semibold',
  },
  phoneInputHeaderToText: {
    fontSize: 22,
    fontWeight: 'medium',
  },
  phoneInputImageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  phoneInputImage: {
    width: 250,
    height: 250,
  },

  otpNumberContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  otpNumberTextHeader: {
    color: '#fff',
    fontSize: 16,
  },
  otpNumberTextSubHeader: {
    color: '#fff',
  },
  otpContainer: {
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  resendText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    textDecorationColor: '#fff',
    textDecorationLine: 'underline',
  },
  resendTextTimer: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  verifyCodeContainer: {
    display: 'flex',
    width: '80%',
  },

  // Name Input Styles
  nameInputContainer: {
    flex: 1,
    backgroundColor: '#181818',
    gap: 24,
  },
  nameInputInnerContainer: {
    display: 'flex',
    gap: 28,
    paddingHorizontal: 40,
    marginTop: 100,
  },
  nameInputIconContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  nameInputIconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 50,
    borderRadius: '50%',
    padding: 10,
    backgroundColor: '#D28A8C',
  },

  // Birth Date Input Styles
  birthDateFormContainer: {
    flex: 1,
    backgroundColor: '#181818',
    gap: 24,
    width: '100%',
  },
  birthDateTopContainer: {
    display: 'flex',
  },
  birthDateHeaderText: {
    fontFamily: 'Kumbh-Sans',
    color: '#fff',
    letterSpacing: 1.125,
  },
  birthDateTextContainer: {
    display: 'flex',
    width: '80%',
    alignItems: 'center',
  },
  dateSelectContainer: {
    display: 'flex',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  datePickerStyles: {
    backgroundColor: 'transparent',
    color: '#fff',
    width: 370,
    height: 240,
  },
  birthDateMainContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 10,
    width: '90%',
  },

  // Gender Select Styles
  genderFormContainer: {
    flex: 1,
    backgroundColor: '#181818',
    gap: 24,
    width: '100%',
  },
  genderTopContainer: {
    display: 'flex',
  },
  genderTextContainer: {
    display: 'flex',
    marginLeft: 50,
  },
  genderHeaderText: {
    color: '#fff',
    letterSpacing: 1.5,
    lineHeight: 34,
  },
  genderSelectContainer: {
    display: 'flex',
    gap: 20,
    marginHorizontal: 20,
    marginTop: 10,
  },

  // Gender Option Styles
  genderOptionContainer: {
    gap: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  genderOptionBox: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#2C2C2C',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  genderImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    overflow: 'hidden',
  },
  genderOptionText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  divider: {
    borderBottomWidth: 1,
    borderBlockColor: '#fff',
    paddingBottom: 18,
  },
  selectedGender: {
    color: '#D28A8C',
  },
  genderForwardContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '90%',
  },

  // Username  Input Styles
  usernameFormContainer: {
    flex: 1,
    backgroundColor: '#181818',
    gap: 24,
    width: '100%',
  },
  userNameInnerContainer: {
    display: 'flex',
    gap: 28,
    paddingHorizontal: 40,
  },
  usernameInputIconContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#A8D28C',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#D28A8C',
    fontSize: 14,
    textAlign: 'center',
  },

  createAccountButtonContainer: {
    paddingHorizontal: 40,
  },

  // Image Upload Styles
  imageUploadContainer: {
    flex: 1,
    backgroundColor: '#181818',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  avatar: {
    backgroundColor: '#333',
    marginBottom: 16,
  },
  uploadButton: {
    marginTop: 8,
    backgroundColor: '#D28A8C',
  },
  imageIconContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: 40,
    marginRight: 20,
  },

  // Password Input Styles
  passwordFormContainer: {
    flex: 1,
    backgroundColor: '#181818',
    gap: 42,
    width: '100%',
  },
  passwordInnerContainer: {
    display: 'flex',
    gap: 20,
    paddingHorizontal: 40,
  },
  passwordInputIconContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginRight: 40,
  },
});
