import React, { useRef } from "react";
import { View, Text, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Button } from "react-native-paper";
import { useDispatch } from "react-redux";
import PhoneInput from 'react-native-phone-number-input';
import { showSnackbar } from "../redux/slice/snackbarSlice";
import CustomPhoneInput from "../components/ui/CustomPhoneInput";
import CustomButton from "../components/ui/CustomButton";
import { onSendOtp } from "../apis/onSendOtp";
import { commonStyles } from "../styles/CommonStyles";
import UserAgreementFooter from "../components/footer/UserAgreement";
import { useAppTheme } from "react-native-paper/lib/typescript/core/theming";
import useThemeColors from "../hooks/useThemeColors";




type Form = { dialCode: string; phoneNumber: string; name: string };
type PhoneNumberFormProps = {
  goNext: () => void;
  goBack?: () => void;
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
};


const PhoneNumberForm : React.FC<PhoneNumberFormProps>= ({ goNext,goBack, form, setForm }) => {
  const phoneInput = useRef<PhoneInput | null>(null);
  const { colors } = useThemeColors();
  const dispatch = useDispatch();

  const onUserRegister = async () => {
    if (form.phoneNumber.length === 10) {
      const res = await onSendOtp({ payload: { phoneNumber: form.phoneNumber } });
      if (res?.response?.success) {
        dispatch(showSnackbar({ type: "success", title: "OTP sent", placement: "top" }));
        goNext();
      } else {
        dispatch(showSnackbar({ type: "error", title: res?.response?.error || "Failed to send OTP", placement: "top" }));
      }
    } else {
      dispatch(showSnackbar({ type: "error", title: "Enter a valid 10-digit phone number", placement: "top" }));
    }
  };

  const onChangeNumber = (number: string) => {
    const dialCode = phoneInput.current?.getCallingCode?.() || "";
    setForm(prev => ({ ...prev, dialCode, phoneNumber: number.replace(/[^0-9]/g, "") }));
  };

  return (
    <LinearGradient colors={["#CEFFCF", "#F7FBF2"]} style={commonStyles.container}>
      <Text style={[commonStyles.heading, { color: colors.primary }]}>Welcome!</Text>
      <Text style={commonStyles.subHeading}>to Jamia Entrance Adda</Text>

      <Image source={require("../assets/images/education-students.png")} style={{ width: 200, height: 200, alignSelf: "center" }} />

      <View style={commonStyles.inputWrapper}>
        <CustomPhoneInput ref={phoneInput} value={form.phoneNumber} onChangeText={onChangeNumber} autoFocus={true} />
      </View>

      <CustomButton title="Continue" onPress={onUserRegister} />

      <Text style={{ textAlign: "center", marginVertical: 10 }}>--- OR ---</Text>

      <Button
        icon={require("../assets/icons/google.png")}
        mode="outlined"
        buttonColor="#fff"
        textColor="#181D18"
        onPress={() => {}}
        style={{ borderRadius: 8 }}
      >
        Sign In With Google
      </Button>

      <UserAgreementFooter />
    </LinearGradient>
  );
};

export default PhoneNumberForm;
