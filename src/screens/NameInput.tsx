import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import PhoneInput from 'react-native-phone-number-input';

import CustomTextInput from "../components/ui/CustomTextField";
import { commonStyles } from "../styles/CommonStyles";


type Form = { dialCode: string; phoneNumber: string; name: string };
type PhoneNumberFormProps = {
  goNext: () => void;
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
};
const NameInput:React.FC<PhoneNumberFormProps>= ({ goNext, form, setForm }) => {
  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.heading}>What's your name?</Text>
      <CustomTextInput
        placeholder="Enter Full Name..."
        onChangeText={(name:string) => setForm(prev => ({ ...prev, name }))}
        value={form.name}
        autoFocus
      />

      <TouchableOpacity onPress={goNext} style={{ alignSelf: "flex-end", marginTop: 20 }}>
        <View style={commonStyles.forwardIconBox}>
          <Icon name="chevron-forward" size={30} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NameInput;
