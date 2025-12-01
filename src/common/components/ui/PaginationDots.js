import React, { useRef, useEffect } from "react";
import { View, Animated } from "react-native";

// Animated Dot Component
const AnimatedDot = React.memo(({ isActive, color = "#028550" }) => {
  const animatedWidth = useRef(new Animated.Value(isActive ? 32 : 8)).current;
  const animatedOpacity = useRef(
    new Animated.Value(isActive ? 1 : 0.3)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animatedWidth, {
        toValue: isActive ? 32 : 8,
        useNativeDriver: false,
        friction: 8,
        tension: 50,
      }),
      Animated.timing(animatedOpacity, {
        toValue: isActive ? 1 : 0.3,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isActive, animatedWidth, animatedOpacity]);

  return (
    <Animated.View
      style={{
        width: animatedWidth,
        opacity: animatedOpacity,
        height: 8,
        borderRadius: 999,
        marginHorizontal: 4,
        backgroundColor: color,
      }}
    />
  );
});

// Pagination Dots Component
const PaginationDots = ({ count, currentIndex, color = "#028550" }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {Array.from({ length: count }).map((_, index) => (
        <AnimatedDot
          key={index}
          isActive={index === currentIndex}
          color={color}
        />
      ))}
    </View>
  );
};

export default PaginationDots;
