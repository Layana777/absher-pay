import moment from "moment";

export const formatGregorianDate = (date) => {
  if (!date) return "";

  const arabicMonths = {
    "01": "يناير",
    "02": "فبراير",
    "03": "مارس",
    "04": "أبريل",
    "05": "مايو",
    "06": "يونيو",
    "07": "يوليو",
    "08": "أغسطس",
    "09": "سبتمبر",
    10: "أكتوبر",
    11: "نوفمبر",
    12: "ديسمبر",
  };

  const momentDate = moment(date);

  if (!momentDate.isValid()) {
    return date; // Return original if invalid
  }

  const day = momentDate.format("D");
  const month = arabicMonths[momentDate.format("MM")];
  const year = momentDate.format("YYYY");

  return `${day} ${month} ${year}`;
};
