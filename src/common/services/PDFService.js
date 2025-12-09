import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

// Import Logo
const LOGO_IMAGE = require("../assets/icons/logo-blue1.png");

/**
 * Load logo as base64 string
 */
const loadLogoBase64 = async () => {
  try {
    const asset = Asset.fromModule(LOGO_IMAGE);
    await asset.downloadAsync();
    
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: "base64",
    });
    
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Error loading logo:", error);
    return null;
  }
};

/**
 * Generate and share a PDF for a bill
 * @param {Object} bill - The bill object to generate PDF for
 */
export const generateBillPDF = async (bill) => {
  try {
    const logoBase64 = await loadLogoBase64();
    const html = createBillHTML(bill, logoBase64);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (Platform.OS === "ios" || Platform.OS === "android") {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: `فاتورة - ${bill.serviceName?.ar || "Bill"}`,
      });
    } else {
      Alert.alert("PDF Generated", `PDF saved to: ${uri}`);
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    Alert.alert("خطأ", "حدث خطأ أثناء إنشاء ملف PDF");
  }
};

/**
 * Generate and share a PDF for a transaction
 * @param {Object} transaction - The transaction object
 */
export const generateTransactionPDF = async (transaction) => {
  try {
    const logoBase64 = await loadLogoBase64();
    const html = createTransactionHTML(transaction, logoBase64);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (Platform.OS === "ios" || Platform.OS === "android") {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: `إيصال - ${transaction.id}`,
      });
    } else {
      Alert.alert("PDF Generated", `PDF saved to: ${uri}`);
    }
  } catch (error) {
    console.error("Error generating Transaction PDF:", error);
    Alert.alert("خطأ", "حدث خطأ أثناء إنشاء ملف PDF");
  }
};

/**
 * Create HTML template for the bill
 * @param {Object} bill
 * @param {string} logoBase64
 * @returns {string} HTML string
 */
const createBillHTML = (bill, logoBase64) => {
  const {
    referenceNumber,
    amount,
    ministryName,
    serviceName,
    dueDate,
    status,
    description,
  } = bill;

  const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const formattedAmount = amount ? amount.toLocaleString("en-US") : "0";
  const logoImg = logoBase64 ? `<img src="${logoBase64}" class="logo-img" />` : '<div class="logo">Absher Pay</div>';

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bill PDF</title>
      <style>
        body {
          font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
          padding: 40px;
          color: #000;
          direction: rtl;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
        }
        .logo-img {
          height: 60px;
          margin-bottom: 10px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #0055aa;
          margin-bottom: 10px;
        }
        .title {
          font-size: 20px;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .subtitle {
          color: #000;
          font-size: 14px;
        }
        .details-box {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          border: 1px solid #e5e7eb;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #000;
        }
        .value {
          color: #000;
          font-weight: 500;
        }
        .amount-box {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          background-color: #0055aa;
          color: white;
          border-radius: 8px;
        }
        .amount-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 5px;
        }
        .amount-value {
          font-size: 32px;
          font-weight: bold;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #000;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${logoImg}
        <div class="title">تفاصيل الفاتورة</div>
        <div class="subtitle">نسخة إلكترونية</div>
      </div>

      <div class="details-box">
        <div class="row">
          <span class="label">الجهة:</span>
          <span class="value">${ministryName?.ar || "غير محدد"}</span>
        </div>
        <div class="row">
          <span class="label">الخدمة:</span>
          <span class="value">${serviceName?.ar || "غير محدد"}</span>
        </div>
        <div class="row">
          <span class="label">رقم المرجع:</span>
          <span class="value">${referenceNumber || "N/A"}</span>
        </div>
        <div class="row">
          <span class="label">تاريخ الاستحقاق:</span>
          <span class="value">${formattedDate}</span>
        </div>
        <div class="row">
          <span class="label">الوصف:</span>
          <span class="value">${description?.ar || description || "-"}</span>
        </div>
        <div class="row">
          <span class="label">الحالة:</span>
          <span class="value">${status === "paid" ? "مدفوعة" : "غير مدفوعة"}</span>
        </div>
      </div>

      <div class="amount-box">
        <div class="amount-label">المبلغ الإجمالي</div>
        <div class="amount-value">${formattedAmount} ر.س</div>
      </div>

      <div class="footer">
        <p>تم إنشاء هذا المستند تلقائياً عبر تطبيق Absher Pay</p>
        <p>${new Date().toLocaleString("en-US")}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Create HTML template for transaction
 * @param {Object} transaction
 * @param {string} logoBase64
 * @returns {string} HTML string
 */
const createTransactionHTML = (transaction, logoBase64) => {
  const {
    id,
    type,
    amount,
    timestamp,
    status,
    referenceNumber,
    descriptionAr,
    descriptionEn,
    balanceBefore,
    balanceAfter,
    fromUserName,
    toUserName,
    transferNote,
    withdrawalDetails,
    paymentDetails
  } = transaction;

  const formattedDate = new Date(timestamp).toLocaleString("en-US", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  const formattedAmount = Math.abs(amount).toFixed(2);
  const isPositive = amount > 0;
  const logoImg = logoBase64 ? `<img src="${logoBase64}" class="logo-img" />` : '<div class="logo">Absher Pay</div>';
  
  // Helper to get type label (duplicated logic for PDF)
  const getTypeLabel = (t) => {
    const labels = {
      top_up: "إيداع رصيد",
      payment: "دفع للخدمات",
      refund: "استرجاع مبلغ",
      transfer_in: "تحويل وارد",
      transfer_out: "تحويل صادر",
      withdrawal: "سحب رصيد",
      adjustment: "تعديل إداري",
      cashback: "استرجاع نقدي",
      bonus: "مكافأة",
      penalty: "غرامة",
      reversal: "عكس معاملة",
      fee: "رسوم",
    };
    return labels[t] || t;
  };

  // Helper to get status label
  const getStatusLabel = (s) => {
    const labels = {
      completed: "مكتملة",
      pending: "قيد الانتظار",
      failed: "فاشلة",
      cancelled: "ملغاة",
    };
    return labels[s] || s;
  };

  let extraRows = '';

  if (type === 'transfer_out' && toUserName) {
    extraRows += `
      <div class="row">
        <span class="label">المستلم:</span>
        <span class="value">${toUserName}</span>
      </div>
    `;
  }
  
  if (type === 'transfer_in' && fromUserName) {
    extraRows += `
      <div class="row">
        <span class="label">المرسل:</span>
        <span class="value">${fromUserName}</span>
      </div>
    `;
  }

  if (type === 'withdrawal' && withdrawalDetails) {
    if (withdrawalDetails.bankName) {
      extraRows += `
        <div class="row">
          <span class="label">البنك:</span>
          <span class="value">${withdrawalDetails.bankName}</span>
        </div>
      `;
    }
    if (withdrawalDetails.accountNumber) {
      extraRows += `
        <div class="row">
          <span class="label">رقم الحساب:</span>
          <span class="value">${withdrawalDetails.accountNumber}</span>
        </div>
      `;
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transaction Receipt</title>
      <style>
        body {
          font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
          padding: 40px;
          color: #000;
          direction: rtl;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
        }
        .logo-img {
          height: 60px;
          margin-bottom: 10px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #0055aa;
          margin-bottom: 10px;
        }
        .title {
          font-size: 20px;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .subtitle {
          color: #000;
          font-size: 14px;
        }
        .details-box {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          border: 1px solid #e5e7eb;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #000;
        }
        .value {
          color: #000;
          font-weight: 500;
        }
        .amount-box {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          background-color: ${isPositive ? '#10B981' : '#EF4444'};
          color: white;
          border-radius: 8px;
        }
        .amount-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 5px;
        }
        .amount-value {
          font-size: 32px;
          font-weight: bold;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #000;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${logoImg}
        <div class="title">إيصال معاملة</div>
        <div class="subtitle">نسخة إلكترونية</div>
      </div>

      <div class="amount-box">
        <div class="amount-label">مبلغ المعاملة</div>
        <div class="amount-value">${isPositive ? '+' : '-'} ${formattedAmount} ر.س</div>
      </div>

      <br />

      <div class="details-box">
        <div class="row">
          <span class="label">الوصف:</span>
          <span class="value">${descriptionAr || "معاملة"}</span>
        </div>
        <div class="row">
          <span class="label">نوع المعاملة:</span>
          <span class="value">${getTypeLabel(type)}</span>
        </div>
        <div class="row">
          <span class="label">التاريخ:</span>
          <span class="value">${formattedDate}</span>
        </div>
        <div class="row">
          <span class="label">رقم المعاملة:</span>
          <span class="value">${id}</span>
        </div>
        <div class="row">
          <span class="label">الرقم المرجعي:</span>
          <span class="value">${referenceNumber || "N/A"}</span>
        </div>
        <div class="row">
          <span class="label">الحالة:</span>
          <span class="value">${getStatusLabel(status)}</span>
        </div>
        ${extraRows}
      </div>

      <div class="footer">
        <p>تم إنشاء هذا المستند تلقائياً عبر تطبيق Absher Pay</p>
        <p>${new Date().toLocaleString("en-US")}</p>
      </div>
    </body>
    </html>
  `;
};
