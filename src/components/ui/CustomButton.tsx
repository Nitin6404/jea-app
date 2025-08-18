import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import useThemeColors from '../../hooks/useThemeColors';
import { Button } from 'react-native-paper';

export const START = 'start';
export const END = 'end';

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  isLoading?: boolean;
  loadingPlacement?: 'start' | 'end';
  disabled?: boolean;
}

const CustomButton = ({
  onPress,
  title,
  style,
  textStyle,
  isLoading = false,
  loadingPlacement = END,
  disabled = false,
}: CustomButtonProps) => {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      style={[
        styles.buttonContainer,
        style,
        { backgroundColor: disabled ? colors.onSurface : colors.primary },
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={title}
    >
      {isLoading && loadingPlacement === START && (
        <ActivityIndicator size={16} color="#fff" />
      )}
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      {isLoading && loadingPlacement === END && (
        <ActivityIndicator size={16} color="#fff" />
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
