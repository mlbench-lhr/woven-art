import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function PhoneNumberInput({
  phoneNumber,
  setPhoneNumber,
}: {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}) {
  return (
    <PhoneInput
      country={"tr"}
      value={phoneNumber}
      placeholder="Enter phone number"
      onChange={setPhoneNumber}
      inputClass="input-style-phone-number"
      buttonClass="!border-r !border-gray-300"
    />
  );
}
