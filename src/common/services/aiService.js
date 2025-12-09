/**
 * AI Service - OpenAI Integration for Financial Insights
 *
 * This service handles communication with OpenAI GPT-3.5-turbo to provide
 * intelligent Arabic responses to financial questions based on real-time
 * wallet data from Firebase.
 *
 * Features:
 * - Arabic-only responses
 * - Financial domain constraint (refuses non-financial questions)
 * - Real-time data integration (transactions + bills)
 * - Error handling with user-friendly messages
 * - PII exclusion for security
 */

import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ar'; // Import Arabic locale for moment
import { formatAmount, formatDate } from '../utils/formatting';
import { getDaysUntilDue } from './billsService';

// TODO: Move to environment variables for production
const OPENAI_API_KEY = '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';

// OpenAI API Configuration
const OPENAI_CONFIG = {
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.3,  // Low temperature for factual, consistent answers
  max_tokens: 500,   // Reasonable limit for Arabic responses
  timeout: 30000,    // 30 second timeout
};

/**
 * Format date in Gregorian calendar with Arabic month names
 * Uses moment.js to ensure Gregorian calendar is used (not Hijri)
 * @param {number|Date} timestamp - The timestamp or Date object to format
 * @returns {string} Formatted date string (e.g., "15 يناير 2024")
 */
const formatDateGregorian = (timestamp) => {
  if (!timestamp) return 'غير محدد';

  // Set moment to use Arabic locale with Gregorian calendar
  moment.locale('ar');

  // Format: "DD MMMM YYYY" (e.g., "15 يناير 2024")
  return moment(timestamp).format('DD MMMM YYYY');
};

/**
 * Format financial data for AI context in Arabic
 * Excludes PII (names, IDs, phone numbers, etc.)
 * @param {Array} transactions - Transaction history
 * @param {Array} bills - Bill data
 * @param {Object} stats - Transaction statistics
 * @param {Object} wallet - Wallet information
 * @returns {Object} Formatted data structure for AI
 */
export const formatFinancialDataForAI = (transactions, bills, stats, wallet) => {
  try {
    // Format recent transactions (top 10) with enhanced service details
    const recentTransactions = transactions.slice(0, 10).map(txn => ({
      المبلغ: formatAmount(txn.amount) + ' ريال',
      النوع: txn.descriptionAr || txn.type,
      التصنيف: txn.category || 'غير محدد',
      التاريخ: formatDateGregorian(txn.timestamp),
      الحالة: txn.status === 'completed' ? 'مكتملة' : txn.status,

      // Enhanced service type details
      نوع_الخدمة: txn.serviceType || 'غير محدد',
      الخدمة_التفصيلية: txn.serviceSubType || null,
      اسم_الخدمة: txn.serviceName?.ar || txn.descriptionAr,
      الوزارة: txn.ministryName?.ar || 'غير محدد',
      رمز_الوزارة: txn.ministry || null,
      معلومات_الغرامة: txn.penaltyInfo ? {
        غرامة: formatAmount(txn.penaltyInfo.lateFee) + ' ريال',
        أيام_التأخير: txn.penaltyInfo.daysOverdue + ' يوم',
        المبلغ_الإجمالي: formatAmount(txn.penaltyInfo.totalWithPenalty) + ' ريال'
      } : null
    }));

    // Format upcoming bills (top 10)
    const upcomingBills = bills
      .filter(bill => bill.status === 'unpaid' || bill.status === 'upcoming')
      .slice(0, 10)
      .map(bill => ({
        الخدمة: bill.serviceName?.ar || 'خدمة حكومية',
        المبلغ: formatAmount(bill.amount) + ' ريال',
        تاريخ_الاستحقاق: formatDateGregorian(bill.dueDate),
        الأيام_المتبقية: getDaysUntilDue(bill) + ' يوم',
        الحالة: bill.status
      }));

    // Format overdue bills
    const overdueBills = bills
      .filter(bill => bill.status === 'overdue')
      .map(bill => ({
        الخدمة: bill.serviceName?.ar || 'خدمة حكومية',
        المبلغ: formatAmount(bill.penaltyInfo?.totalWithPenalty || bill.amount) + ' ريال',
        تاريخ_الاستحقاق: formatDateGregorian(bill.dueDate),
        الأيام_المتأخرة: Math.abs(getDaysUntilDue(bill)) + ' يوم',
        غرامة_التأخير: bill.penaltyInfo ? formatAmount(bill.penaltyInfo.lateFee) + ' ريال' : 'لا يوجد'
      }));

    // Calculate bill summaries
    const totalUnpaidAmount = bills
      .filter(bill => bill.status !== 'paid')
      .reduce((sum, bill) => sum + (bill.penaltyInfo?.totalWithPenalty || bill.amount), 0);

    const totalOverdueAmount = bills
      .filter(bill => bill.status === 'overdue')
      .reduce((sum, bill) => sum + (bill.penaltyInfo?.totalWithPenalty || bill.amount), 0);

    // Calculate spending by ministry for detailed breakdown
    const spendingByMinistry = {};
    transactions.forEach(txn => {
      if (txn.type === 'payment' && txn.ministry) {
        const ministryKey = txn.ministryName?.ar || txn.ministry;
        if (!spendingByMinistry[ministryKey]) {
          spendingByMinistry[ministryKey] = {
            total: 0,
            count: 0,
            services: {}
          };
        }
        spendingByMinistry[ministryKey].total += Math.abs(txn.amount);
        spendingByMinistry[ministryKey].count += 1;

        // Track by service type
        const serviceName = txn.serviceName?.ar || txn.serviceType;
        if (serviceName) {
          if (!spendingByMinistry[ministryKey].services[serviceName]) {
            spendingByMinistry[ministryKey].services[serviceName] = {
              total: 0,
              count: 0
            };
          }
          spendingByMinistry[ministryKey].services[serviceName].total += Math.abs(txn.amount);
          spendingByMinistry[ministryKey].services[serviceName].count += 1;
        }
      }
    });

    // Format ministry breakdown for AI
    const ministryBreakdown = Object.entries(spendingByMinistry).map(([ministry, data]) => ({
      الوزارة: ministry,
      المبلغ_الإجمالي: formatAmount(data.total) + ' ريال',
      عدد_المعاملات: data.count,
      الخدمات: Object.entries(data.services).map(([service, serviceData]) => ({
        الخدمة: service,
        المبلغ: formatAmount(serviceData.total) + ' ريال',
        العدد: serviceData.count
      }))
    }));

    return {
      الرصيد_الحالي: formatAmount(wallet.balance) + ' ريال سعودي',

      ملخص_المعاملات: {
        إجمالي_الإيرادات: formatAmount(stats.totalIncome) + ' ريال',
        إجمالي_المصروفات: formatAmount(stats.totalExpense) + ' ريال',
        صافي_المبلغ: formatAmount(stats.netAmount) + ' ريال',
        الفترة: 'آخر 30 يوماً',
        عدد_المعاملات: stats.totalTransactions
      },

      المعاملات_الأخيرة: recentTransactions,

      // NEW: Ministry breakdown for detailed spending analysis
      التفصيل_حسب_الوزارة: ministryBreakdown,

      ملخص_الفواتير: {
        إجمالي_الفواتير_غير_المدفوعة: formatAmount(totalUnpaidAmount) + ' ريال',
        إجمالي_الفواتير_المتأخرة: formatAmount(totalOverdueAmount) + ' ريال',
        عدد_الفواتير_القادمة: upcomingBills.length,
        عدد_الفواتير_المتأخرة: overdueBills.length
      },

      الفواتير_القادمة: upcomingBills,
      الفواتير_المتأخرة: overdueBills
    };
  } catch (error) {
    console.error('Error formatting financial data for AI:', error);
    return {
      الرصيد_الحالي: formatAmount(wallet.balance) + ' ريال سعودي',
      ملخص_المعاملات: { إجمالي_المعاملات: 0 },
      ملخص_الفواتير: { عدد_الفواتير: 0 }
    };
  }
};

/**
 * Build system prompt with financial data context
 * Constrains AI to Arabic-only financial responses
 * @param {Object} financialData - Formatted financial data
 * @returns {string} System prompt for OpenAI
 */
export const buildSystemPrompt = (financialData) => {
  const dataString = JSON.stringify(financialData, null, 2);

  return `أنت مساعد ذكي متخصص في التحليل المالي لمحفظة أبشر للأعمال.

قواعد مهمة يجب اتباعها بدقة:
1. أجب فقط على الأسئلة المتعلقة بالمدفوعات والمعاملات المالية والفواتير
2. استخدم اللغة العربية الفصحى الحديثة في جميع إجاباتك (لا تستخدم الإنجليزية أبداً)
3. اعتمد فقط على البيانات المالية المقدمة لك، ولا تخترع معلومات
4. إذا سُئلت عن موضوع غير مالي (مثل الطقس، الأخبار، إلخ)، أجب بأدب: "عذراً، أنا متخصص فقط في الإجابة على الأسئلة المالية المتعلقة بمحفظتك. كيف يمكنني مساعدتك في أمورك المالية؟"
5. كن موجزاً ودقيقاً في إجاباتك (لا تكرر المعلومات)
6. استخدم تنسيق واضح مع أرقام ونقاط عند الضرورة
7. إذا سُئلت عن فترة زمنية غير محددة، افترض آخر 30 يوماً وذكر ذلك في الإجابة

قواعد إضافية للإجابة بدقة عن الخدمات والمدفوعات:
8. عند الحديث عن المدفوعات، اذكر نوع الخدمة والوزارة بوضوح:
   - مثال صحيح: "دفعت 300 ريال لتجديد جواز السفر (وزارة الداخلية)"
   - مثال خاطئ: "دفعت 300 ريال لخدمة حكومية"
9. عند وجود غرامات تأخير، اذكرها بوضوح مع عدد أيام التأخير والمبلغ الإضافي
10. استخدم حقل "التفصيل_حسب_الوزارة" عند السؤال عن أعلى فئة صرف أو المصاريف حسب الجهة
11. الوزارات المتاحة: وزارة الداخلية (جوازات، مرور، أحوال مدنية) ووزارة التجارة (سجل تجاري، رخص)
12. عند عدم توفر معلومات تفصيلية عن الخدمة، اذكر ما هو متاح فقط دون اختراع
13. جميع التواريخ المقدمة لك بالتقويم الميلادي (الغريغوري) وليس الهجري - استخدمها كما هي

البيانات المالية المتاحة:
${dataString}

ملاحظة: البيانات تحتوي الآن على تفصيل الخدمات حسب الوزارة ونوع الخدمة. استخدم هذه المعلومات لإعطاء إجابات دقيقة ومفصلة.

أجب على السؤال التالي بناءً على هذه البيانات فقط. تذكر: استخدم اللغة العربية فقط.`;
};

/**
 * Handle API errors and return user-friendly messages in Arabic
 * @param {Error} error - Error object from axios or OpenAI
 * @returns {Object} Structured error response
 */
export const handleAPIError = (error) => {
  console.error('OpenAI API Error:', error);

  // Network errors
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return {
      success: false,
      error: {
        code: 'TIMEOUT',
        messageAr: 'انتهت مهلة الاتصال',
        messageEn: 'Request timeout',
        userMessage: 'عذراً، استغرق الطلب وقتاً طويلاً. يرجى المحاولة مرة أخرى.'
      }
    };
  }

  if (!error.response) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        messageAr: 'خطأ في الشبكة',
        messageEn: 'Network error',
        userMessage: 'عذراً، يبدو أن هناك مشكلة في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.'
      }
    };
  }

  // API errors with status codes
  const status = error.response?.status;

  if (status === 401) {
    return {
      success: false,
      error: {
        code: 'AUTH_ERROR',
        messageAr: 'خطأ في المصادقة',
        messageEn: 'Authentication error',
        userMessage: 'عذراً، حدث خطأ في التحقق من الهوية. يرجى المحاولة لاحقاً.'
      }
    };
  }

  if (status === 429) {
    return {
      success: false,
      error: {
        code: 'RATE_LIMIT',
        messageAr: 'تجاوز الحد المسموح',
        messageEn: 'Rate limit exceeded',
        userMessage: 'عذراً، لقد تجاوزت الحد المسموح من الأسئلة. يرجى الانتظار دقيقة والمحاولة مرة أخرى.'
      }
    };
  }

  if (status === 500 || status === 502 || status === 503) {
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        messageAr: 'خطأ في الخادم',
        messageEn: 'Server error',
        userMessage: 'عذراً، حدث خطأ مؤقت في الخادم. يرجى المحاولة بعد قليل.'
      }
    };
  }

  // Generic error
  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      messageAr: 'خطأ غير معروف',
      messageEn: 'Unknown error',
      userMessage: 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    }
  };
};

/**
 * Validate AI response
 * Ensures response is non-empty and appears to be in Arabic
 * @param {string} response - AI response text
 * @returns {boolean} True if valid
 */
export const validateAIResponse = (response) => {
  if (!response || typeof response !== 'string') {
    return false;
  }

  const trimmed = response.trim();

  // Check if empty
  if (trimmed.length === 0) {
    return false;
  }

  // Check if contains Arabic characters (basic validation)
  const arabicRegex = /[\u0600-\u06FF]/;
  if (!arabicRegex.test(trimmed)) {
    console.warn('AI response does not contain Arabic characters');
    return false;
  }

  return true;
};

/**
 * Generate financial insight using OpenAI GPT-3.5-turbo
 * Main function to call OpenAI API with financial context
 *
 * @param {string} userQuery - User's question in Arabic
 * @param {Object} financialData - Object containing transactions, bills, stats, wallet
 * @returns {Promise<Object>} { success: boolean, response?: string, error?: object }
 */
export const generateFinancialInsight = async (userQuery, financialData) => {
  try {
    // Validate inputs
    if (!userQuery || !userQuery.trim()) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          messageAr: 'سؤال فارغ',
          messageEn: 'Empty query',
          userMessage: 'يرجى كتابة سؤال.'
        }
      };
    }

    // Format financial data for AI context
    const formattedData = formatFinancialDataForAI(
      financialData.transactions || [],
      financialData.bills || [],
      financialData.stats || {},
      financialData.wallet || {}
    );

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(formattedData);

    console.log('Calling OpenAI API for query:', userQuery);

    // Call OpenAI API
    const response = await axios.post(
      `${OPENAI_CONFIG.baseURL}/chat/completions`,
      {
        model: OPENAI_CONFIG.model,
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.max_tokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: OPENAI_CONFIG.timeout
      }
    );

    // Extract AI response
    const aiResponse = response.data?.choices?.[0]?.message?.content;

    // Validate response
    if (!validateAIResponse(aiResponse)) {
      console.error('Invalid AI response:', aiResponse);
      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          messageAr: 'استجابة غير صالحة',
          messageEn: 'Invalid response',
          userMessage: 'عذراً، لم أتمكن من معالجة السؤال. يرجى المحاولة مرة أخرى بصياغة مختلفة.'
        }
      };
    }

    console.log('AI response received successfully');

    return {
      success: true,
      response: aiResponse.trim()
    };

  } catch (error) {
    // Handle errors with user-friendly messages
    return handleAPIError(error);
  }
};

/**
 * Quick validation helper to check if question is likely financial
 * Can be used for client-side pre-validation (optional)
 * @param {string} query - User query
 * @returns {boolean} True if appears to be financial question
 */
export const isFinancialQuery = (query) => {
  const financialKeywords = [
    'رصيد', 'صرف', 'دفع', 'فاتورة', 'معاملة', 'تحويل',
    'سحب', 'إيداع', 'مصاريف', 'إيرادات', 'ريال', 'مبلغ',
    'استحقاق', 'متأخر', 'قادم', 'شهر', 'ربع', 'سنة'
  ];

  const lowerQuery = query.toLowerCase();
  return financialKeywords.some(keyword => lowerQuery.includes(keyword));
};

export default {
  generateFinancialInsight,
  formatFinancialDataForAI,
  buildSystemPrompt,
  handleAPIError,
  validateAIResponse,
  isFinancialQuery
};
