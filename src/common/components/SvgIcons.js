import React from "react";
import { View } from "react-native";
import Wallet from "../assets/icons/wallet.svg";
import Ai from "../assets/icons/Ai-icon.svg";
import FingerPrint from "../assets/icons/fingerPrint.svg";
import DirectPay from "../assets/icons/directPay.svg";
import FingerPrintWhite from "../assets/icons/fingerPrintWhite.svg";
import AbhserWhite from "../assets/icons/logo-white-abhser.svg";
import Person from "../assets/icons/person.svg";
import Lock from "../assets/icons/lock.svg";import PaymentManagement from "../assets/icons/businessPaymentsManagement.svg";
import BusinessAi from "../assets/icons/businessAI.svg";
import BusinessAnalysis from "../assets/icons/businessAnalysis.svg";
import BusinessShield from "../assets/icons/businessShield.svg";

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
    case "paymentManagement":
      return <PaymentManagement height={size} width={size} />;
    case "businessAi":
      return <BusinessAi height={size} width={size} />;
    case "businessAnalysis":
      return <BusinessAnalysis height={size} width={size} />;
    case "businessShield":
      return <BusinessShield height={size} width={size} />;
    case "FingerPrintWhite":
      return <FingerPrintWhite height={size} width={size} />;
    case "AbsherWhite":
      return <AbhserWhite height={size} width={size} />;
    case "Person":
      return <Person height={size} width={size} />;
    case "Lock":
      return <Lock height={size} width={size} />;

    default:
      return null;
  }
};

export default SvgIcons;
