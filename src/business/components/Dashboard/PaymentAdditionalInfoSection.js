import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { formatDate } from "../../../common/utils";

/**
 * Payment Additional Information Section Component
 * Displays service-specific additional information based on bill type
 *
 * @param {Object} billData - Bill data object with additionalInfo
 * @param {string} serviceType - Service type (passports, traffic, etc.)
 * @param {string} primaryColor - Primary brand color (default: "#0055aa")
 */
const PaymentAdditionalInfoSection = ({
  billData,
  serviceType,
  primaryColor = "#0055aa",
}) => {
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);

  if (!billData?.additionalInfo) {
    return null;
  }

  const additionalInfo = billData.additionalInfo;

  // Check if there's any additional info to display
  const hasAdditionalInfo = Object.keys(additionalInfo).length > 0;
  if (!hasAdditionalInfo) {
    return null;
  }

  // Info Card Component
  const InfoCard = ({ icon, label, value, onPress }) => (
    <TouchableOpacity
      className="bg-gray-50 rounded-2xl p-4 mb-3"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 m-2">
          <Text className="text-gray-500 text-xs mb-2 text-right">{label}</Text>
          <Text
            className="text-gray-800 font-bold text-base text-right"
            numberOfLines={onPress ? 1 : 2}
          >
            {value}
          </Text>
        </View>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Feather name={icon} size={18} color={primaryColor} />
        </View>
      </View>
    </TouchableOpacity>
  );

  // Employee List Modal
  const EmployeeListModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={employeeModalVisible}
      onRequestClose={() => setEmployeeModalVisible(false)}
    >
      <View className="flex-1 bg-black/50" style={{ direction: "ltr" }}>
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800 text-right">
              قائمة العمال ({additionalInfo.employeeCount})
            </Text>
            <TouchableOpacity
              onPress={() => setEmployeeModalVisible(false)}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Feather name="x" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Employee List */}
          <ScrollView className="flex-1 p-4">
            {additionalInfo.employees?.map((employee, index) => (
              <View
                key={index}
                className="bg-gray-50 rounded-2xl p-4 mb-3"
                style={{ direction: "rtl" }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-800 font-bold text-base text-right">
                    {employee.name}
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: primaryColor }}
                    >
                      {employee.amount} ريال
                    </Text>
                  </View>
                </View>

                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-xs flex-1 text-left">
                      رقم الإقامة
                    </Text>
                    <Text className="text-gray-700 text-sm font-medium text-left">
                      {employee.iqamaNumber}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-xs flex-1 text-left">
                      المهنة
                    </Text>
                    <Text className="text-gray-700 text-sm font-medium text-left">
                      {employee.occupation}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Modal Footer */}
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={() => setEmployeeModalVisible(false)}
              className="rounded-2xl p-4 items-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Text className="text-white font-bold text-base">إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View
      className="bg-white rounded-3xl p-6 mx-4 mb-4 shadow-sm"
      style={{ direction: "ltr" }}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between mb-5"
        style={{ direction: "rtl" }}
      >
        <Text className="text-gray-800 text-base font-bold text-right">
          معلومات إضافية
        </Text>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Feather name="file-plus" size={20} color={primaryColor} />
        </View>
      </View>

      {/* Additional Info Cards */}
      <View className="space-y-3">
        {/* PASSPORTS */}
        {serviceType === "passports" && (
          <>
            {additionalInfo.passportNumber && (
              <InfoCard
                icon="book"
                label="رقم الجواز"
                value={additionalInfo.passportNumber}
              />
            )}
            {additionalInfo.holderName && (
              <InfoCard
                icon="user"
                label="اسم حامل الجواز"
                value={additionalInfo.holderName}
              />
            )}
            {additionalInfo.expiryDate && (
              <InfoCard
                icon="calendar"
                label="تاريخ انتهاء الصلاحية"
                value={formatDate(additionalInfo.expiryDate)}
              />
            )}
          </>
        )}

        {/* TRAFFIC */}
        {serviceType === "traffic" && (
          <>
            {additionalInfo.plateNumber && (
              <InfoCard
                icon="truck"
                label="رقم اللوحة"
                value={additionalInfo.plateNumber}
              />
            )}
            {additionalInfo.violationType && (
              <InfoCard
                icon="alert-triangle"
                label="نوع المخالفة"
                value="تجاوز السرعة"
              />
            )}
            {additionalInfo.location && (
              <InfoCard
                icon="map-pin"
                label="الموقع"
                value={additionalInfo.location}
              />
            )}
            {additionalInfo.violationDate && (
              <InfoCard
                icon="calendar"
                label="تاريخ المخالفة"
                value={formatDate(additionalInfo.violationDate)}
              />
            )}
            {additionalInfo.speed && additionalInfo.speedLimit && (
              <View className="bg-red-50 rounded-2xl p-4 mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 m-2">
                    <Text className="text-red-500 text-xs mb-2 text-right">
                      السرعة المسجلة
                    </Text>
                    <Text className="text-red-700 font-bold text-base text-right">
                      {additionalInfo.speed}
                    </Text>
                    <Text className="text-red-400 text-xs mt-1 text-right">
                      الحد المسموح: {additionalInfo.speedLimit}
                    </Text>
                  </View>
                  <View className="w-10 h-10 rounded-full items-center justify-center bg-red-100">
                    <Feather name="activity" size={18} color="#dc2626" />
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* BUSINESS CIVIL AFFAIRS - Employee/Iqama Services */}
        {serviceType === "civil_affairs" &&
         (additionalInfo.employeeName || additionalInfo.employeeCount) && (
          <>
            {/* Single Employee */}
            {additionalInfo.employeeName && !additionalInfo.employeeCount && (
              <>
                <InfoCard
                  icon="user"
                  label="اسم العامل"
                  value={additionalInfo.employeeName}
                />
                {additionalInfo.iqamaNumber && (
                  <InfoCard
                    icon="credit-card"
                    label="رقم الإقامة"
                    value={additionalInfo.iqamaNumber}
                  />
                )}
                {additionalInfo.nationality && (
                  <InfoCard
                    icon="globe"
                    label="الجنسية"
                    value={additionalInfo.nationality}
                  />
                )}
                {additionalInfo.occupation && (
                  <InfoCard
                    icon="briefcase"
                    label="المهنة"
                    value={additionalInfo.occupation}
                  />
                )}
              </>
            )}

            {/* Multiple Employees */}
            {additionalInfo.employeeCount && additionalInfo.employees && (
              <TouchableOpacity
                className="rounded-2xl p-4 flex-row items-center justify-between"
                style={{ backgroundColor: `${primaryColor}08` }}
                onPress={() => setEmployeeModalVisible(true)}
              >
                <View className="flex-1 m-1">
                  <Text
                    className="text-sm font-bold mb-1 text-right"
                    style={{ color: primaryColor }}
                  >
                    {additionalInfo.employeeCount} عامل
                  </Text>
                  <Text
                    className="text-xs text-right"
                    style={{ color: primaryColor }}
                  >
                    اضغط لعرض القائمة الكاملة
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center ml-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Feather name="users" size={18} color="white" />
                  </View>
                  <Feather name="chevron-left" size={20} color={primaryColor} />
                </View>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* PERSONAL CIVIL AFFAIRS - National ID, Birth Certificates, etc. */}
        {serviceType === "civil_affairs" &&
         !additionalInfo.employeeName &&
         !additionalInfo.employeeCount && (
          <>
            {additionalInfo.nationalId && (
              <InfoCard
                icon="credit-card"
                label="رقم الهوية الوطنية"
                value={additionalInfo.nationalId}
              />
            )}
            {additionalInfo.expiryDate && (
              <InfoCard
                icon="calendar"
                label="تاريخ انتهاء الصلاحية"
                value={formatDate(additionalInfo.expiryDate)}
              />
            )}
          </>
        )}

        {/* COMMERCE */}
        {serviceType === "commerce" && (
          <>
            {additionalInfo.registrationNumber && (
              <InfoCard
                icon="hash"
                label="رقم السجل التجاري"
                value={additionalInfo.registrationNumber}
              />
            )}
            {additionalInfo.companyName && (
              <InfoCard
                icon="briefcase"
                label="اسم الشركة"
                value={additionalInfo.companyName}
              />
            )}
          </>
        )}
      </View>

      {/* Employee Modal */}
      <EmployeeListModal />
    </View>
  );
};

export default PaymentAdditionalInfoSection;
