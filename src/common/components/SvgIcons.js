import React from "react";
import { View } from "react-native";
import Wallet from "../assets/icons/wallet.svg";
import Ai from "../assets/icons/Ai-icon.svg";
import FingerPrint from "../assets/icons/fingerPrint.svg";
import DirectPay from "../assets/icons/directPay.svg";

const SvgIcons = ({ name, size, color, style }) => {
  switch (name) {
    case "wallet":
      return <Wallet height={size} width={size} />;
    case "Ai":
      return <Ai height={size} width={size} />;
    case "fingerPrint":
      return <FingerPrint height={size} width={size} />;
    case "directPay":
      return <DirectPay height={size} width={size} />;

    default:
      return null;
  }
};

export default SvgIcons;
