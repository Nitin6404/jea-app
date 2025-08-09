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

const PhoneNumberForm = ({
  goNext,
  form,
  setForm,
}: {
  goNext: () => void;
  form: Form;
  setForm: (form: Form) => void;
}) => {
  const phoneInput = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

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
    const dialCode = phoneInput.current?.getCallingCode() || '';

    const sanitizedText = number.replace(/[^0-9]/g, '');

    setForm(prev => ({
      ...prev,
      dialCode: dialCode,
      phoneNumber: sanitizedText,
    }));
  };

  return (
    <>
      <View style={styles.phoneNumberFormContainer}>
        <View style={styles.phoneNumberTopContainer}>
          <TouchableOpacity onPress={onStartScreen}>
            <View style={styles.iconBox}>
              <Icon name="chevron-back" size={30} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.phoneInputContainer}>
            <Text style={[styles.headingText, FontStyles.heading]}>
              Phone number
            </Text>

            <View style={styles.phoneFormContainer}>
              <CustomPhoneInput
                ref={phoneInput}
                value={form.phoneNumber}
                onChangeText={onChangeNumber}
                autoFocus={true}
              />
            </View>
            <CustomButton
              title="Send Verification Code"
              onClick={onUserRegister}
            />
          </View>
        </View>

        <UserAgreement />
      </View>
    </>
  );
};

const PhoneNumberVerification = ({
  goNext,
  goBack,
  form,
  otp,
  setOtp,
  setTempToken,
}: {
  goNext: () => void;
  goBack: () => void;
  form: Form;
  otp: string;
  setOtp: (otp: string) => void;
  setTempToken: (token: string) => void;
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const intervalRef = useRef(null);

  const [time, setTime] = useState(30);
  const [isValidating, setIsValidating] = useState(false);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
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
        <View style={styles.iconBox}>
          <TouchableOpacity onPress={goBack}>
            <Icon name="chevron-back" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

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

const NameInput = ({ goNext, goBack, form, setForm }) => {
  const onChangeName = name => {
    setForm(prev => ({
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

const BirthDateInput = ({ goNext, goBack, form, setForm }) => {
  const onChangeDate = selectedDate => {
    setForm(prev => ({
      ...prev,
      dob: selectedDate,
    }));
  };

  const selectedDate = form.dob ? form.dob : new Date();

  return (
    <View style={styles.birthDateFormContainer}>
      <View style={styles.birthDateTopContainer}>
        <TouchableOpacity onPress={goBack}>
          <View style={styles.iconBox}>
            <Icon name="chevron-back" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.birthDateTextContainer}>
        <Text style={[FontStyles.heading, styles.birthDateHeaderText]}>
          What's your date of {'\n'}Birth?
        </Text>
      </View>
      <View style={styles.dateSelectContainer}>
        <DatePicker
          date={selectedDate}
          style={styles.datePickerStyles}
          maximumDate={new Date()}
          onDateChange={onChangeDate}
          minimumDate={new Date(1990, 0, 1)}
          textColor="#fff"
          dividerColor="#fff"
        />
        {/* <DatePicker mode="date" textColor="green" /> */}
        {/* <DatePicker
          date={date}
          onDateChange={setDate}
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          dividerColor="#fff"
          theme="dark"
          locale="en-US"
        /> */}
      </View>

      <View style={styles.birthDateMainContainer}>
        <TouchableOpacity onPress={goNext}>
          <View style={styles.nameInputIconBox}>
            <Icon name="chevron-forward" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PasswordInput = ({ goNext, goBack, form, setForm, tempToken }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const onSubmit = async () => {
    if (isCreatingAccount) {
      return;
    }

    try {
      setIsCreatingAccount(true);

      if (form.password !== form.confirmPassword) {
        dispatch(
          showSnackbar({
            type: 'error',
            title: 'Passwords do not match',
            placement: 'top',
          }),
        );
        return;
      }

      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('username', form.username);
      formData.append('password', form.password);

      if (form.dob) {
        formData.append('dob', form.dob.toISOString());
      }

      if (form.profilePicture) {
        formData.append('profilePicture', {
          uri: form.profilePicture.uri,
          type: form.profilePicture.type || 'image/jpeg',
          name: form.profilePicture.fileName || 'profile.jpg',
        });
      }

      const apiResponse = await onUpdateDetails({
        payload: formData,
        token: tempToken,
      });

      if (apiResponse?.response?.success) {
        dispatch(
          showSnackbar({
            type: 'success',
            title: 'Account created successfully',
            placement: 'top',
          }),
        );
        const data = apiResponse?.response?.data;

        dispatch(
          loginUser({
            token: tempToken,
            user: {
              id: data?._id,
              name: data?.name,
              username: data?.username,
              phoneNumber: data?.phoneNumber,
              email: data?.email,
            },
          }),
        );
        await AsyncStorage.setItem(TOKEN, tempToken);

        // navigation.navigate(Paths.MAIN_SCREEN);
      } else {
        const errrorMessage = apiResponse?.response?.message;
        dispatch(
          showSnackbar({
            type: 'error',
            title: errrorMessage || 'Error creating account, please try again',
            placement: 'top',
          }),
        );
      }
    } catch (error) {
      console.error(error);
      dispatch(
        showSnackbar({
          type: 'error',
          title: 'Error creating account, please try again',
          placement: 'top',
        }),
      );
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const onChangePassword = password => {
    setForm(prev => ({
      ...prev,
      password: password,
    }));
  };

  const onChangeConfirmPassword = confirmPassword => {
    setForm(prev => ({
      ...prev,
      confirmPassword: confirmPassword,
    }));
  };

  const password = form.password;
  const confirmPassword = form.confirmPassword;

  // const onCloseSnackbar = () => {
  //   setSnackbarState(prev => ({
  //     ...prev,
  //     visible: false,
  //   }));
  // };

  return (
    <>
      <View style={styles.passwordFormContainer}>
        <TouchableOpacity onPress={goBack}>
          <View style={styles.iconBox}>
            <Icon name="chevron-back" size={30} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.passwordInnerContainer}>
          <Text style={[FontStyles.heading, styles.otpNumberTextSubHeader]}>
            Set Password
          </Text>

          <CustomTextInput
            placeholder="Enter password"
            value={password}
            onChangeText={onChangePassword}
            autoFocus={true}
          />
        </View>

        <View style={styles.passwordInnerContainer}>
          <Text style={[FontStyles.heading, styles.otpNumberTextSubHeader]}>
            Confirm Password
          </Text>

          <CustomTextInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
          />
        </View>

        <View style={styles.createAccountButtonContainer}>
          <CustomButton
            title="Create Account"
            onClick={onSubmit}
            isLoading={isCreatingAccount}
          />
        </View>
      </View>
    </>
  );
};

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tempToken, setTempToken] = useState(null);

  const [form, setForm] = useState({
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

  const [otp, setOtp] = useState('');

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
            setForm={setForm}
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
      case 4:
        return (
          <BirthDateInput
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
          />
        );
      case 5:
        return (
          <GenderSelect
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
          />
        );
      case 6:
        return (
          <UsernameInput
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
          />
        );
      case 7:
        return (
          <ImageUploadScreen
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
          />
        );
      case 8:
        return (
          <PasswordInput
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
    backgroundColor: '#181818',
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
