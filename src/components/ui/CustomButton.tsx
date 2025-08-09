import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

export const START = 'start';
export const END = 'end';

interface CustomButtonProps {
  onClick: () => void;
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  isLoading?: boolean;
  loadingPlacement?: 'start' | 'end';
  disabled?: boolean;
}

const CustomButton = ({
  onClick,
  title,
  style,
  textStyle,
  isLoading = false,
  loadingPlacement = END,
  disabled = false,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.buttonContainer, style]}
      onPress={onClick}
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
    backgroundColor: '#D28A8C',
    borderRadius: 60,
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
