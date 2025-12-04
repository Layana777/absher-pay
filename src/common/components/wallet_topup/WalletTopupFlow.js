import React, { useState } from "react";
import { View } from "react-native";
import PaymentMethodSheet from "./PaymentMethodSheet";
import AddCardScreen from "./AddCardScreen";
import TopupAmountScreen from "./TopupAmountScreen";
import TopupSuccessScreen from "./TopupSuccessScreen";

// Flow States
const FLOW_STATES = {
  PAYMENT_METHOD_SELECTION: "PAYMENT_METHOD_SELECTION",
  ADD_CARD: "ADD_CARD",
  ENTER_AMOUNT: "ENTER_AMOUNT",
  SUCCESS: "SUCCESS",
  CLOSED: "CLOSED",
};

const WalletTopupFlow = ({
  visible,
  onClose,
  hasSavedCard = false,
  primaryColor = "#0055aa" // أزرق للـ Business، أخضر للـ Customer
}) => {
  const [flowState, setFlowState] = useState(
    FLOW_STATES.PAYMENT_METHOD_SELECTION
  );
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [amount, setAmount] = useState(0);
  const [savedCard, setSavedCard] = useState(null);

  // Reset flow when visible changes
  React.useEffect(() => {
    if (visible) {
      setFlowState(FLOW_STATES.PAYMENT_METHOD_SELECTION);
      setPaymentMethod(null);
      setAmount(0);
    } else {
      setFlowState(FLOW_STATES.CLOSED);
    }
  }, [visible]);

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);

    if (method === "APPLE_PAY") {
      // Go directly to amount screen for Apple Pay
      setFlowState(FLOW_STATES.ENTER_AMOUNT);
    } else if (method === "CARD") {
      // Check if user has saved card
      if (hasSavedCard || savedCard) {
        setFlowState(FLOW_STATES.ENTER_AMOUNT);
      } else {
        setFlowState(FLOW_STATES.ADD_CARD);
      }
    }
  };

  const handleCardSaved = (cardData) => {
    setSavedCard(cardData);
    setFlowState(FLOW_STATES.ENTER_AMOUNT);
  };

  const handleAmountConfirm = async (confirmedAmount) => {
    setAmount(confirmedAmount);

    // Simulate payment processing
    // In real app, you would call payment API here
    setTimeout(() => {
      setFlowState(FLOW_STATES.SUCCESS);
    }, 1500);
  };

  const handleComplete = () => {
    setFlowState(FLOW_STATES.CLOSED);
    onClose();
  };

  const handleBackFromAddCard = () => {
    setFlowState(FLOW_STATES.PAYMENT_METHOD_SELECTION);
  };

  const handleBackFromAmount = () => {
    if (paymentMethod === "CARD" && !hasSavedCard && !savedCard) {
      setFlowState(FLOW_STATES.ADD_CARD);
    } else {
      setFlowState(FLOW_STATES.PAYMENT_METHOD_SELECTION);
    }
  };

  // Render appropriate screen based on flow state
  const renderContent = () => {
    switch (flowState) {
      case FLOW_STATES.PAYMENT_METHOD_SELECTION:
        return (
          <PaymentMethodSheet
            visible={visible}
            onClose={onClose}
            onSelectMethod={handlePaymentMethodSelect}
            primaryColor={primaryColor}
          />
        );

      case FLOW_STATES.ADD_CARD:
        return (
          <View className="flex-1">
            <AddCardScreen
              onSaveCard={handleCardSaved}
              onBack={handleBackFromAddCard}
              primaryColor={primaryColor}
            />
          </View>
        );

      case FLOW_STATES.ENTER_AMOUNT:
        return (
          <View className="flex-1">
            <TopupAmountScreen
              paymentMethod={paymentMethod}
              onConfirm={handleAmountConfirm}
              onBack={handleBackFromAmount}
              primaryColor={primaryColor}
            />
          </View>
        );

      case FLOW_STATES.SUCCESS:
        return (
          <View className="flex-1">
            <TopupSuccessScreen
              amount={amount}
              onDone={handleComplete}
              primaryColor={primaryColor}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};

export default WalletTopupFlow;
