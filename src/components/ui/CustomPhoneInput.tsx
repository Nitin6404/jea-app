import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';
import { LightTheme } from '../../theme/light';
import { DarkTheme } from '../../theme/dark';
import { useColorScheme } from 'react-native';
import { TextInput } from 'react-native-paper';

interface CustomPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  defaultCode?: string;
  autoFocus?: boolean;
  maxLength?: number;
  error?: boolean; // added for error state
}

const CustomPhoneInput = forwardRef<PhoneInput, CustomPhoneInputProps>(
  (
    {
      value,
      onChangeText,
      defaultCode = 'IN',
      autoFocus,
      maxLength = 15,
      error = false,
    },
    ref,
  ) => {
    const colorScheme = useColorScheme();
    const { colors } = useTheme(
      colorScheme === 'dark' ? DarkTheme : LightTheme,
    );

    const handleTextChange = (text: string) => {
      const sanitizedText = text.replace(/[^0-9]/g, '');
      onChangeText(sanitizedText);
    };

    return (
      <PhoneInput
        ref={ref}
        value={value}
        defaultValue={value}
        defaultCode={defaultCode}
        layout="second"
        onChangeText={handleTextChange}
        renderDropdownImage={
          <Icon name="chevron-down" size={20} color={colors.primary} />
        }
        textInputProps={{
          placeholderTextColor: colors.onPrimary,
          cursorColor: colors.onPrimary,
          keyboardType: 'phone-pad',
          autoFocus,
          maxLength,
        }}
        countryPickerProps={{ withFlag: true }}
        withDarkTheme
        containerStyle={[
          styles.phoneInputLibContainer,
          {
            backgroundColor: 'transparent',
            borderColor: error ? colors.error : colors.outline,
          },
        ]}
        textContainerStyle={[
          styles.textInputContainer,
          { backgroundColor: 'transparent' },
        ]}
        textInputStyle={[styles.textInputStyle, { color: colors.onPrimary }]}
        codeTextStyle={[styles.codeTextStyle, { color: colors.onPrimary }]}
      />

      // <TextInput
      //   ref={ref}
      //   value={value}
      //   onChangeText={handleTextChange}
      //   placeholder="Enter phone number"
      //   placeholderTextColor={colors.onPrimary}
      //   // cursorColor={colors.onPrimary}
      //   keyboardType="phone-pad"
      //   autoFocus={autoFocus}
      //   maxLength={maxLength}
      //   mode="outlined"
      //   outlineColor={error ? colors.error : colors.outline}
      //   style={[
      //     // styles.phoneInputLibContainer,
      //     {
      //       backgroundColor: 'transparent',
      //       // borderColor: colors.outline,
      //       // borderWidth: 2,
      //       // borderColor: error ? colors.error : colors.outline,
      //     },
      //   ]}
      // />
    );
  },
);

export default CustomPhoneInput;

const styles = StyleSheet.create({
  phoneInputLibContainer: {
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
  },
  textInputContainer: {
    padding: 0,
    margin: 0,
  },
  textInputStyle: {
    margin: 0,
  },
  codeTextStyle: {
    marginLeft: 20,
  },
});
