import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className,
  textClassName,
  ...props
}) => {
  // Base classes
  const baseClasses = 'rounded-lg items-center justify-center flex-row';

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary active:bg-primary-dark',
    secondary: 'bg-secondary active:bg-secondary-dark',
    'single-primary': 'bg-single-primary active:bg-single-primary-dark',
    'business-primary': 'bg-business-primary active:bg-business-primary-dark',
    outline: 'bg-transparent border-2 border-primary active:bg-primary-50',
    danger: 'bg-danger active:bg-red-600',
    success: 'bg-success active:bg-green-600',
  };

  // Size classes
  const sizeClasses = {
    small: 'py-2 px-4',
    medium: 'py-3 px-6',
    large: 'py-4 px-8',
  };

  // Text variant classes
  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    'single-primary': 'text-white',
    'business-primary': 'text-white',
    outline: 'text-primary',
    danger: 'text-white',
    success: 'text-white',
  };

  // Text size classes
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  // Disabled classes
  const disabledClasses = disabled || loading ? 'opacity-50' : '';

  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className || ''}`;
  const buttonTextClasses = `${textVariantClasses[variant]} ${textSizeClasses[size]} font-semibold ${textClassName || ''}`;

  return (
    <TouchableOpacity
      className={buttonClasses}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={buttonTextClasses}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
