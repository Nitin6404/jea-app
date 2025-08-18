import React, { useState } from "react";



import PhoneNumberForm from "../PhoneNumberForm.tsx";
import NameInput from "../NameInput.tsx";
import PhoneNumberVerification from "../PhoneNumberVerification.tsx";

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({ dialCode: "91", phoneNumber: "", name: "" });
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState(null);

  const goNext = () => setCurrentStep(prev => prev + 1);
  const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  switch (currentStep) {
    case 1: return <PhoneNumberForm goNext={goNext} form={form} setForm={setForm} />;
    case 2: return <PhoneNumberVerification goNext={goNext} goBack={goBack} form={form} otp={otp} setOtp={setOtp} setTempToken={setTempToken} />;
    case 3: return <NameInput goNext={goNext} goBack={goBack} form={form} setForm={setForm} />;
    default: return null;
  }
};

export default Register;
