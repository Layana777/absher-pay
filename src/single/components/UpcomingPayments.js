import React from "react";
import UpcomingPaymentsSection from "../../common/components/UpcomingPaymentsSection";
import { COLORS } from "../../common/constants/colors";

/**
 * Single (Customer) Upcoming Payments Component
 * Wrapper around the common UpcomingPaymentsSection with Single-specific colors
 * @param {Object} props - All props are passed to UpcomingPaymentsSection
 */
const UpcomingPayments = (props) => {
  return (
    <UpcomingPaymentsSection
      {...props}
      primaryColor={COLORS.singlePrimary}
    />
  );
};

export default UpcomingPayments;
