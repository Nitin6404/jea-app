import React, { forwardRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import Icon from 'react-native-vector-icons/Ionicons';
import useThemeColors from '../../hooks/useThemeColors';

interface CustomPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  defaultCode?: string;
  autoFocus?: boolean;
  maxLength?: number;
  error?: boolean;
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
    const { colors } = useThemeColors();
    const [isFocused, setIsFocused] = useState(false);

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
          placeholderTextColor: colors.onSurfaceVariant,
          cursorColor: colors.primary,
          keyboardType: 'phone-pad',
          autoFocus,
          maxLength,
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
        }}
        countryPickerProps={{ withFlag: true }}
        containerStyle={[
          styles.phoneInputLibContainer,
          {
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.primary
              : colors.outline,
          },
        ]}
        textContainerStyle={[
          styles.textInputContainer,
          { backgroundColor: 'transparent', paddingVertical: 2 },
        ]}
        textInputStyle={[styles.textInputStyle, { color: colors.onSurface }]}
        codeTextStyle={[styles.codeTextStyle, { color: colors.onSurface }]}
      />
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
    fontSize: 16,
  },
  codeTextStyle: {
    marginLeft: 20,
    fontSize: 16,
  },
});
