import {
  StyleSheet,
  TextInputProps,
  TextProps,
} from 'react-native';
import React from 'react';
import { OtpInput, Theme } from 'react-native-otp-entry';
import useThemeColors from '../../hooks/useThemeColors';

interface CustomOtpProps {
  numberOfDigits?: number;
  focusColor?: string;
  autoFocus?: boolean;
  hideStick?: boolean;
  placeholder?: string;
  blurOnFilled?: boolean;
  disabled?: boolean;
  type?: 'numeric' | 'alphanumeric' | 'alpha';
  secureTextEntry?: boolean;
  focusStickBlinkingDuration?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  onTextChange?: (text: string) => void;
  onFilled?: (text: string) => void;
  textInputProps?: TextInputProps;
  textProps?: TextProps;
  theme?: Theme;
}

const CustomOtp = ({
  numberOfDigits = 6,
  focusColor = '#fff',
  autoFocus = true,
  hideStick = true,
  placeholder = '',
  blurOnFilled = true,
  disabled = false,
  type = 'numeric',
  secureTextEntry = false,
  focusStickBlinkingDuration = 500,
  onFocus,
  onBlur,
  onTextChange,
  onFilled,
  textInputProps,
  textProps,
  theme,
}: CustomOtpProps) => {
  const { colors } = useThemeColors();
  return (
    <OtpInput
      numberOfDigits={numberOfDigits}
      focusColor={focusColor}
      autoFocus={autoFocus}
      hideStick={hideStick}
      placeholder={placeholder}
      blurOnFilled={blurOnFilled}
      disabled={disabled}
      type={type}
      secureTextEntry={secureTextEntry}
      focusStickBlinkingDuration={focusStickBlinkingDuration}
      onFocus={onFocus}
      onBlur={onBlur}
      onTextChange={onTextChange}
      onFilled={onFilled}
      textInputProps={textInputProps}
      textProps={textProps}
      theme={{
        containerStyle: styles.container,
        pinCodeContainerStyle: {
          ...styles.pinCodeContainer,
          
        },
        pinCodeTextStyle: {
          ...styles.pinCodeText,
          color: colors.onPrimary,
        },
        focusStickStyle: {
          ...styles.focusStick,
          backgroundColor: colors.onPrimary,
        },
        focusedPinCodeContainerStyle: {
          ...styles.activePinCodeContainer,
          borderColor: colors.onPrimary,
        },
        placeholderTextStyle: {
          ...styles.placeholderText,
          color: colors.onPrimary,
        },
        filledPinCodeContainerStyle: {
          ...styles.filledPinCodeContainer,
          backgroundColor: colors.primary,
        },
        disabledPinCodeContainerStyle: {
          borderColor: colors.primary,
        },
        ...theme, // allow overrides
      }}
    />
  );
};

export default CustomOtp;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  pinCodeContainer: {
    width: 50,
    height: 50,
    borderWidth: 3,
    borderColor: '#9CD49F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCodeText: {
    fontSize: 18,
    textAlign: 'center',
  },
  focusStick: {
    height: 2,
    marginTop: 5,
  },
  activePinCodeContainer: {
    borderWidth: 3,
  },
  placeholderText: {
    fontSize: 18,
    textAlign: 'center',
  },
  filledPinCodeContainer: {
    borderWidth: 0,
  },
});
