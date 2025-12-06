import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import SvgIcons from './SvgIcons';

/**
 * مكون حوار طلب تفعيل البصمة بعد تسجيل الدخول الناجح
 */
const BiometricPromptDialog = ({
  visible,
  biometricType = 'بصمة',
  onAccept,
  onReject,
  variant = 'single', // 'single' or 'business'
}) => {
  const primaryColor = variant === 'business' ? '#0055aa' : '#028550';
  const bgColor = variant === 'business' ? 'bg-[#0055aa]' : 'bg-[#028550]';
  const bgLightColor = variant === 'business' ? 'bg-[#0055aa]/10' : 'bg-[#028550]/10';
  const textColor = variant === 'business' ? 'text-[#0055aa]' : 'text-[#028550]';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onReject}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-5">
        <View className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
          {/* Icon */}
          <View className={`${bgLightColor} w-20 h-20 rounded-full items-center justify-center self-center mb-4`}>
            <SvgIcons
              name="FingerPrint"
              size={48}
              color={primaryColor}
            />
          </View>

          {/* Title */}
          <Text className="text-gray-900 text-xl font-bold text-center mb-2">
            تفعيل {biometricType}
          </Text>

          {/* Description */}
          <Text className="text-gray-600 text-sm text-center leading-6 mb-6">
            هل تريد تفعيل {biometricType} لتسجيل الدخول السريع والآمن في المرات القادمة؟
            {'\n\n'}
            سيمكنك هذا من الدخول بسرعة دون الحاجة لإدخال كلمة المرور
          </Text>

          {/* Benefits List */}
          <View className={`${bgLightColor} rounded-2xl p-4 mb-6`}>
            <View className="flex-row-reverse items-start mb-2">
              <Text className={`${textColor} text-xl mx-2`}>✓</Text>
              <Text className="text-gray-700 text-sm flex-1 text-right">
                تسجيل دخول سريع وآمن
              </Text>
            </View>
            <View className="flex-row-reverse items-start mb-2">
              <Text className={`${textColor} text-xl mx-2`}>✓</Text>
              <Text className="text-gray-700 text-sm flex-1 text-right">
                عدم الحاجة لتذكر كلمة المرور
              </Text>
            </View>
            <View className="flex-row-reverse items-start">
              <Text className={`${textColor} text-xl mx-2`}>✓</Text>
              <Text className="text-gray-700 text-sm flex-1 text-right">
                حماية إضافية لحسابك
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="space-y-3">
            {/* Accept Button */}
            <TouchableOpacity
              onPress={onAccept}
              className={`${bgColor} rounded-xl py-4 items-center shadow-sm`}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-bold">
                تفعيل {biometricType}
              </Text>
            </TouchableOpacity>

            {/* Reject Button */}
            <TouchableOpacity
              onPress={onReject}
              className="bg-gray-100 rounded-xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 text-base font-semibold">
                ربما لاحقاً
              </Text>
            </TouchableOpacity>
          </View>

          {/* Note */}
          <Text className="text-gray-400 text-xs text-center mt-4">
            يمكنك تفعيل أو إلغاء هذه الميزة من الإعدادات في أي وقت
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default BiometricPromptDialog;
