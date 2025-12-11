/**
 * AI Insights Service
 *
 * Generates personalized AI-powered insights for business users once per login session.
 * Insights are cached in AsyncStorage and cleared on logout for cost-effectiveness.
 *
 * Features:
 * - Session-based caching (AsyncStorage)
 * - Once-per-login generation
 * - Four insight types: expense predictions, optimization tips, bill warnings, spending patterns
 * - Fallback system for reliability
 * - Dynamic 1-3 cards based on priority
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import moment from "moment";
import { getUserBills, getDaysUntilDue, isBillOverdue } from "./billsService";
import { getWalletsByUserId } from "./walletService";
import { getWalletTransactions } from "./transactionService";
import { formatAmount } from "../utils/formatting";

// ============================================================================
// CONFIGURATION
// ============================================================================

const OPENAI_API_KEY =
  "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";

const OPENAI_CONFIG = {
  baseURL: "https://api.openai.com/v1",
  model: "gpt-3.5-turbo",
  temperature: 0.3,
  max_tokens: 800,
  timeout: 20000, // 20 second timeout
};

const STORAGE_KEYS = {
  INSIGHTS_USER_ID: "ai_insights_userId",
  INSIGHTS_DATA: "ai_insights_data",
  INSIGHTS_TIMESTAMP: "ai_insights_timestamp",
};

const PRIORITY_ORDER = {
  high: 1, // Urgent (overdue bills, approaching deadlines)
  medium: 2, // Important (optimization opportunities)
  low: 3, // Optional (general patterns)
};

const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Check if cached insights are valid
 * @param {string} cachedUserId - User ID from cache
 * @param {string} cachedTimestamp - Timestamp from cache
 * @param {string} currentUserId - Current user ID
 * @returns {boolean} True if cache is valid
 */
const isCacheValid = (cachedUserId, cachedTimestamp, currentUserId) => {
  if (!cachedUserId || !cachedTimestamp || !currentUserId) return false;

  // Check user match
  if (cachedUserId !== currentUserId) return false;

  // Check freshness (24 hours max)
  const cacheAge = Date.now() - parseInt(cachedTimestamp);
  return cacheAge < MAX_CACHE_AGE;
};

/**
 * Get cached insights from AsyncStorage
 * @param {string} userId - User ID
 * @returns {Promise<Array|null>} Cached insights or null
 */
export const getCachedInsights = async (userId) => {
  try {
    const keys = [
      STORAGE_KEYS.INSIGHTS_USER_ID,
      STORAGE_KEYS.INSIGHTS_DATA,
      STORAGE_KEYS.INSIGHTS_TIMESTAMP,
    ];

    const values = await AsyncStorage.multiGet(keys);
    const cachedUserId = values[0][1];
    const cachedData = values[1][1];
    const cachedTimestamp = values[2][1];

    if (isCacheValid(cachedUserId, cachedTimestamp, userId)) {
      console.log("✅ AI Insights: Using cached insights");
      return JSON.parse(cachedData);
    }

    console.log("❌ AI Insights: Cache invalid or expired");
    return null;
  } catch (error) {
    console.error("Error reading cached insights:", error);
    return null;
  }
};

/**
 * Cache insights to AsyncStorage
 * @param {string} userId - User ID
 * @param {Array} insights - Insights to cache
 */
export const cacheInsights = async (userId, insights) => {
  try {
    const entries = [
      [STORAGE_KEYS.INSIGHTS_USER_ID, userId],
      [STORAGE_KEYS.INSIGHTS_DATA, JSON.stringify(insights)],
      [STORAGE_KEYS.INSIGHTS_TIMESTAMP, Date.now().toString()],
    ];

    await AsyncStorage.multiSet(entries);
    console.log("✅ AI Insights: Cached successfully");
  } catch (error) {
    console.error("Error caching insights:", error);
  }
};

/**
 * Clear insights cache (called on logout)
 */
export const clearInsightsCache = async () => {
  try {
    const keys = [
      STORAGE_KEYS.INSIGHTS_USER_ID,
      STORAGE_KEYS.INSIGHTS_DATA,
      STORAGE_KEYS.INSIGHTS_TIMESTAMP,
    ];

    await AsyncStorage.multiRemove(keys);
    console.log("✅ AI Insights: Cache cleared");
  } catch (error) {
    console.error("Error clearing insights cache:", error);
  }
};

/**
 * Check if insights should be generated (no cache or invalid cache)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if should generate
 */
export const shouldGenerateInsights = async (userId) => {
  const cachedInsights = await getCachedInsights(userId);
  return cachedInsights === null;
};

// ============================================================================
// DATA PREPARATION
// ============================================================================

/**
 * Calculate transaction statistics with comparisons
 * @param {Array} transactions - Transaction array
 * @returns {Object} Statistics with comparisons
 */
const calculateTransactionStats = (transactions) => {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

  // Current month (last 30 days)
  const currentMonth = transactions.filter((txn) => txn.timestamp >= thirtyDaysAgo);

  // Previous month (30-60 days ago)
  const previousMonth = transactions.filter(
    (txn) => txn.timestamp >= sixtyDaysAgo && txn.timestamp < thirtyDaysAgo
  );

  // Last 90 days for trend analysis
  const lastQuarter = transactions.filter((txn) => txn.timestamp >= ninetyDaysAgo);

  const calculatePeriodStats = (txns) => {
    const income = txns
      .filter((txn) => txn.amount > 0)
      .reduce((sum, txn) => sum + txn.amount, 0);

    const expense = txns
      .filter((txn) => txn.amount < 0)
      .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

    return {
      income,
      expense,
      net: income - expense,
      count: txns.length,
    };
  };

  const current = calculatePeriodStats(currentMonth);
  const previous = calculatePeriodStats(previousMonth);

  // Calculate percentage changes
  const expenseChange = previous.expense > 0
    ? ((current.expense - previous.expense) / previous.expense) * 100
    : 0;

  const incomeChange = previous.income > 0
    ? ((current.income - previous.income) / previous.income) * 100
    : 0;

  // Group by ministry for spending analysis
  const spendingByMinistry = {};
  currentMonth.forEach((txn) => {
    if (txn.amount < 0 && txn.ministry) {
      const ministry = txn.ministryName?.ar || txn.ministry;
      if (!spendingByMinistry[ministry]) {
        spendingByMinistry[ministry] = 0;
      }
      spendingByMinistry[ministry] += Math.abs(txn.amount);
    }
  });

  // Find top spending category
  const topSpendingMinistry = Object.entries(spendingByMinistry)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    currentMonth: {
      totalIncome: current.income,
      totalExpense: current.expense,
      netAmount: current.net,
      totalTransactions: current.count,
    },
    previousMonth: {
      totalIncome: previous.income,
      totalExpense: previous.expense,
      netAmount: previous.net,
      totalTransactions: previous.count,
    },
    comparison: {
      expenseChange: Math.round(expenseChange),
      incomeChange: Math.round(incomeChange),
      expenseIncreased: expenseChange > 0,
      incomeIncreased: incomeChange > 0,
    },
    topSpendingMinistry: topSpendingMinistry
      ? { name: topSpendingMinistry[0], amount: topSpendingMinistry[1] }
      : null,
    averageExpensePerTransaction: current.count > 0
      ? current.expense / current.count
      : 0,
  };
};

/**
 * Prepare comprehensive financial context for AI
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Financial context
 */
export const prepareFinancialContext = async (userId) => {
  try {
    console.log("📊 AI Insights: Preparing financial context...");

    // Fetch all financial data with null safety
    const [billsResult, walletsResult] = await Promise.all([
      getUserBills(userId).catch(() => []),
      getWalletsByUserId(userId).catch(() => ({})),
    ]);

    const bills = billsResult || [];
    const wallets = walletsResult || {};
    const wallet = wallets.business || wallets.personal || {};

    // Fetch transactions if wallet exists
    let transactions = [];
    let stats = {
      currentMonth: {
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        totalTransactions: 0,
      },
      previousMonth: {
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        totalTransactions: 0,
      },
      comparison: {
        expenseChange: 0,
        incomeChange: 0,
        expenseIncreased: false,
        incomeIncreased: false,
      },
      topSpendingMinistry: null,
      averageExpensePerTransaction: 0,
    };

    if (wallet.id) {
      const transactionsResult = await getWalletTransactions(wallet.id, {
        limit: 100,
      }).catch(() => ({ data: [] }));
      transactions = transactionsResult?.data || [];
      if (transactions.length > 0) {
        stats = calculateTransactionStats(transactions);
      }
    }

    // Filter bills by status
    const unpaidBills = bills.filter(
      (bill) => bill.status === "unpaid" || bill.status === "upcoming"
    );
    const overdueBills = bills.filter((bill) => isBillOverdue(bill));

    // Calculate totals
    const totalUnpaidAmount = unpaidBills.reduce(
      (sum, bill) => sum + (bill.penaltyInfo?.totalWithPenalty || bill.amount),
      0
    );

    const totalOverdueAmount = overdueBills.reduce(
      (sum, bill) => sum + (bill.penaltyInfo?.totalWithPenalty || bill.amount),
      0
    );

    // Categorize bills by ministry with worker names
    const billsByMinistry = bills.reduce((acc, bill) => {
      const ministry = bill.ministryName?.ar || bill.ministry || "غير محدد";
      if (!acc[ministry]) {
        acc[ministry] = { count: 0, total: 0, services: [], workers: [] };
      }
      acc[ministry].count += 1;
      acc[ministry].total += bill.amount;
      acc[ministry].services.push(bill.serviceName?.ar || bill.serviceType);

      // Extract worker names from additionalInfo
      if (bill.additionalInfo) {
        const workerName = bill.additionalInfo.employeeName || bill.additionalInfo.holderName;
        if (workerName && !acc[ministry].workers.includes(workerName)) {
          acc[ministry].workers.push(workerName);
        }
      }
      return acc;
    }, {});

    const context = {
      userId,
      wallet: {
        balance: wallet.balance || 0,
        currency: wallet.currency || "SAR",
      },
      financialAnalysis: {
        currentMonthSpending: stats.currentMonth.totalExpense,
        previousMonthSpending: stats.previousMonth.totalExpense,
        spendingChangePercentage: stats.comparison.expenseChange,
        spendingTrend: stats.comparison.expenseIncreased ? "زيادة" : "انخفاض",
        topSpendingCategory: stats.topSpendingMinistry?.name || "غير محدد",
        topSpendingAmount: stats.topSpendingMinistry?.amount || 0,
        averageTransactionAmount: stats.averageExpensePerTransaction,
        totalTransactionsThisMonth: stats.currentMonth.totalTransactions,
        totalTransactionsLastMonth: stats.previousMonth.totalTransactions,
      },
      bills: {
        total: bills.length,
        unpaid: unpaidBills.length,
        overdue: overdueBills.length,
        totalUnpaidAmount,
        totalOverdueAmount,
      },
      billsByMinistry,
      upcomingBills: unpaidBills
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 5)
        .map((bill) => ({
          id: bill.id,
          serviceAr: bill.serviceName?.ar || bill.serviceType,
          amount: bill.amount,
          dueDate: moment(bill.dueDate).format("DD MMMM YYYY"),
          daysRemaining: getDaysUntilDue(bill),
          ministryAr: bill.ministryName?.ar || bill.ministry,
          penaltyInfo: bill.penaltyInfo,
          workerName: bill.additionalInfo?.employeeName || bill.additionalInfo?.holderName || null,
          additionalDetails: {
            plateNumber: bill.additionalInfo?.plateNumber,
            violationType: bill.additionalInfo?.violationType,
            nationality: bill.additionalInfo?.nationality,
            occupation: bill.additionalInfo?.occupation,
          },
        })),
      overdueBills: overdueBills.map((bill) => ({
        id: bill.id,
        serviceAr: bill.serviceName?.ar || bill.serviceType,
        amount: bill.amount,
        daysOverdue: Math.abs(getDaysUntilDue(bill)),
        penaltyAmount: bill.penaltyInfo?.lateFee || 0,
        totalWithPenalty: bill.penaltyInfo?.totalWithPenalty || bill.amount,
        ministryAr: bill.ministryName?.ar || bill.ministry,
        workerName: bill.additionalInfo?.employeeName || bill.additionalInfo?.holderName || null,
        additionalDetails: {
          plateNumber: bill.additionalInfo?.plateNumber,
          violationType: bill.additionalInfo?.violationType,
          nationality: bill.additionalInfo?.nationality,
          occupation: bill.additionalInfo?.occupation,
        },
      })),
      recentTransactions: transactions
        .slice(0, 10)
        .map((txn) => ({
          type: txn.descriptionAr || txn.type,
          amount: txn.amount,
          timestamp: moment(txn.timestamp).format("DD MMMM YYYY"),
          serviceType: txn.serviceType,
          ministry: txn.ministryName?.ar || txn.ministry,
        })),
    };

    console.log("✅ AI Insights: Financial context prepared");
    return context;
  } catch (error) {
    console.error("Error preparing financial context:", error);
    throw error;
  }
};

// ============================================================================
// AI GENERATION
// ============================================================================

/**
 * Build system prompt for AI insights generation
 * @param {Object} context - Financial context
 * @returns {string} System prompt
 */
const buildSystemPrompt = (context) => {
  return `أنت مساعد ذكي متخصص في التحليل المالي والاستشارات المالية للأعمال.

مهمتك: تحليل البيانات المالية بعمق وإنشاء 1-3 نصائح مخصصة ومفيدة باللغة العربية تساعد صاحب العمل على تحسين إدارته المالية.

أنواع النصائح المتاحة:
1. expense_prediction - توقع المصاريف القادمة بناءً على الأنماط التاريخية
2. optimization_tip - اقتراحات عملية لتقليل التكاليف أو تحسين التدفق النقدي
3. bill_warning - تنبيهات عاجلة للفواتير المتأخرة أو القادمة (مع ذكر أسماء العمال)
4. spending_pattern - تحليل ذكي لأنماط الصرف والاتجاهات المالية

قواعد مهمة للنصائح المالية:
✅ ركز على التحليل المالي العملي:
   - قارن مصاريف الشهر الحالي مع الشهر السابق (استخدم financialAnalysis)
   - مثال: "ارتفعت مصاريفك بنسبة 32% هذا الشهر مقارنة بالشهر الماضي"
   - مثال: "انخفضت مصاريفك بنسبة 15% - استمر في هذا الأداء الجيد"

✅ حدد الأولوية بذكاء:
   - high (عاجل): فواتير متأخرة، رصيد غير كافٍ، زيادة كبيرة في المصاريف (+40%)
   - medium (مهم): فواتير قادمة قريباً، اتجاهات إنفاق، توصيات للتحسين
   - low (اختياري): ملخصات عامة، إحصائيات

✅ استخدم الأمثلة الواقعية:
   - "أعلى فئة صرف هذا الشهر: وزارة الموارد البشرية بمبلغ 18,400 ريال"
   - "متوسط قيمة كل معاملة: 3,200 ريال"

✅ قدم نصائح قابلة للتنفيذ:
   - مثال جيد: "جدولة دفع الفواتير قبل 3 أيام من الموعد لتجنب الغرامات"
   - مثال سيء: "حاول تقليل المصاريف"

قواعد مهمة جداً للمحتوى:
✅ استخدم أسماء العمال من workerName إذا كانت متاحة
   - صحيح: "تجديد إقامة العامل أحمد محمد بعد 5 أيام"
   - خاطئ: "تجديد إقامة العامل 13 بعد 5 أيام"

✅ استخدم تفاصيل إضافية مفيدة من additionalDetails
   - مثل رقم اللوحة، الجنسية، المهنة، نوع المخالفة

✅ اذكر اسم عامل واحد فقط كمثال إذا كان هناك عدة عمال
   - مثال: "لديك 3 فواتير تجديد إقامات (مثل: أحمد محمد)"

✅ تجنب ذكر IDs أو أرقام تقنية
✅ استخدم معلومات الوزارة والخدمة لتوضيح السياق
✅ لا تستخدم حقل icon - سيتم اختيار الأيقونة تلقائياً

أمثلة على نصائح ممتازة:

مثال 1 - تحليل الاتجاه:
{
  "type": "spending_pattern",
  "priority": "medium",
  "titleAr": "ارتفاع في مصاريف هذا الشهر",
  "messageAr": "ارتفعت مصاريفك بنسبة 32% هذا الشهر (18,400 ريال) مقارنة بالشهر الماضي (13,900 ريال). أعلى فئة صرف: وزارة الموارد البشرية",
  "actionable": false
}

مثال 2 - توقع ذكي:
{
  "type": "expense_prediction",
  "priority": "high",
  "titleAr": "تجديد إقامة العامل أحمد محمد",
  "messageAr": "تجديد إقامة العامل أحمد محمد (مصري - محاسب) بعد 5 أيام بقيمة 6,500 ريال. يُنصح بالدفع قبل 3 أيام لتجنب الغرامات",
  "billId": "bill123",
  "actionable": true
}

مثال 3 - تحذير مع نصيحة:
{
  "type": "bill_warning",
  "priority": "high",
  "titleAr": "فواتير متأخرة - غرامات متراكمة",
  "messageAr": "لديك فاتورتان متأخرتان بغرامات 1,200 ريال. دفعهما اليوم سيوفر غرامات إضافية قد تصل 400 ريال بحلول الأسبوع القادم",
  "actionable": false
}

مثال 4 - تحسين مالي:
{
  "type": "optimization_tip",
  "priority": "medium",
  "titleAr": "فرصة لتحسين التدفق النقدي",
  "messageAr": "لديك 5 فواتير تستحق في نفس الأسبوع بمبلغ 22,000 ريال. يُنصح بتوزيع المدفوعات على فترات أطول لتحسين التدفق النقدي",
  "actionable": false
}

صيغة الإخراج (JSON فقط):
{
  "insights": [
    {
      "type": "spending_pattern أو expense_prediction أو bill_warning أو optimization_tip",
      "priority": "high أو medium أو low",
      "titleAr": "عنوان قصير وواضح",
      "messageAr": "رسالة مفصلة مع أرقام حقيقية ونصائح عملية",
      "billId": "إذا كانت تخص فاتورة محددة",
      "actionable": true أو false
    }
  ]
}

ملاحظات نهائية:
- لا تضف حقل "icon"
- ركز على التحليل والمقارنات المالية
- استخدم الأرقام الحقيقية من financialAnalysis
- قدم نصائح عملية وقابلة للتنفيذ

البيانات المالية:
${JSON.stringify(context, null, 2)}

تذكر: أرجع JSON فقط، بدون أي نص إضافي أو شرح.`;
};

/**
 * Generate insights using OpenAI GPT-3.5-turbo
 * @param {Object} financialContext - Financial context
 * @returns {Promise<Array>} Array of insights
 */
export const generateInsightsFromAI = async (financialContext) => {
  try {
    console.log("🤖 AI Insights: Calling OpenAI API...");

    const systemPrompt = buildSystemPrompt(financialContext);

    const response = await axios.post(
      `${OPENAI_CONFIG.baseURL}/chat/completions`,
      {
        model: OPENAI_CONFIG.model,
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.max_tokens,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              "قم بتحليل البيانات المالية وأنشئ 1-3 نصائح ذكية بناءً على البيانات المتاحة.",
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: OPENAI_CONFIG.timeout,
      }
    );

    const aiResponse = response.data?.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    let insights = [];
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(aiResponse);
      insights = parsed.insights || [];
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from text
      console.warn("Failed to parse JSON, trying text extraction...");
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        insights = parsed.insights || [];
      } else {
        throw new Error("Could not extract JSON from response");
      }
    }

    // Sort by priority
    insights.sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    );

    // Limit to 3 insights
    insights = insights.slice(0, 3);

    console.log(`✅ AI Insights: Generated ${insights.length} insights`);
    return insights;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    throw error;
  }
};

// ============================================================================
// FALLBACK SYSTEM
// ============================================================================

/**
 * Generate fallback insights based on rules (no AI)
 * @param {Object} financialContext - Financial context
 * @returns {Array} Array of fallback insights
 */
export const getFallbackInsights = (financialContext) => {
  const insights = [];
  const { bills, upcomingBills, overdueBills, wallet, financialAnalysis } =
    financialContext;

  // Don't generate insights if there's no meaningful data
  const hasNoBills = !bills || bills.total === 0;
  const hasNoSpending = !financialAnalysis || financialAnalysis.currentMonthSpending === 0;

  if (hasNoBills && hasNoSpending) {
    return [];
  }

  // Priority 1: Overdue bills warning (HIGH priority)
  if (overdueBills.length > 0) {
    const totalOverdue = overdueBills.reduce(
      (sum, bill) => sum + bill.totalWithPenalty,
      0
    );
    const mostOverdue = overdueBills[0];

    // Build meaningful message with worker name if available
    let billDescription = mostOverdue.serviceAr;
    if (mostOverdue.workerName) {
      billDescription = `${mostOverdue.serviceAr} للعامل ${mostOverdue.workerName}`;
    } else if (mostOverdue.additionalDetails?.plateNumber) {
      billDescription = `${mostOverdue.serviceAr} للوحة ${mostOverdue.additionalDetails.plateNumber}`;
    }

    insights.push({
      type: "bill_warning",
      priority: "high",
      titleAr: "فواتير متأخرة",
      messageAr: `لديك ${overdueBills.length} فاتورة متأخرة بمبلغ إجمالي ${formatAmount(totalOverdue)} ريال. أقدم فاتورة: ${billDescription} - متأخرة منذ ${mostOverdue.daysOverdue} يوم بغرامة ${formatAmount(mostOverdue.penaltyAmount)} ريال`,
      billId: mostOverdue.id,
      actionable: true,
    });
  }

  // Priority 2: Upcoming bills in next 7 days (MEDIUM priority)
  if (upcomingBills.length > 0) {
    const urgentBills = upcomingBills.filter(
      (bill) => bill.daysRemaining <= 7 && bill.daysRemaining > 0
    );

    if (urgentBills.length > 0) {
      const nextBill = urgentBills[0];

      // Build meaningful message with worker name or additional details
      let billDescription = nextBill.serviceAr;
      let additionalInfo = "";

      if (nextBill.workerName) {
        billDescription = `${nextBill.serviceAr} للعامل ${nextBill.workerName}`;
        if (nextBill.additionalDetails?.nationality && nextBill.additionalDetails?.occupation) {
          additionalInfo = ` (${nextBill.additionalDetails.nationality} - ${nextBill.additionalDetails.occupation})`;
        }
      } else if (nextBill.additionalDetails?.plateNumber) {
        billDescription = `${nextBill.serviceAr} للوحة ${nextBill.additionalDetails.plateNumber}`;
      }

      insights.push({
        type: "expense_prediction",
        priority: "medium",
        titleAr: billDescription,
        messageAr: `${billDescription}${additionalInfo} تستحق خلال ${nextBill.daysRemaining} يوم بمبلغ ${formatAmount(nextBill.amount)} ريال`,
        billId: nextBill.id,
        actionable: true,
      });
    }
  }

  // Priority 3: Low balance warning (HIGH priority)
  if (bills.totalUnpaidAmount > wallet.balance) {
    const deficit = bills.totalUnpaidAmount - wallet.balance;
    insights.push({
      type: "optimization_tip",
      priority: "high",
      titleAr: "تحذير: رصيد غير كافٍ",
      messageAr: `رصيدك الحالي ${formatAmount(wallet.balance)} ريال أقل من إجمالي الفواتير غير المدفوعة ${formatAmount(bills.totalUnpaidAmount)} ريال. تحتاج لإيداع ${formatAmount(deficit)} ريال`,
      actionable: false,
    });
  }

  // Priority 4: Spending trend analysis (MEDIUM priority)
  // Only show if there's actual spending in both months (avoid 0 to 0 comparisons)
  if (
    financialAnalysis &&
    financialAnalysis.currentMonthSpending > 0 &&
    financialAnalysis.previousMonthSpending > 0 &&
    Math.abs(financialAnalysis.spendingChangePercentage) > 10
  ) {
    const change = financialAnalysis.spendingChangePercentage;
    const isIncrease = change > 0;
    const trend = isIncrease ? "ارتفعت" : "انخفضت";

    let adviceMessage = "";
    if (isIncrease && change > 40) {
      adviceMessage = ". يُنصح بمراجعة المصاريف لتحديد أسباب الزيادة الكبيرة";
    } else if (isIncrease && change > 20) {
      adviceMessage = ". راقب مصاريفك خلال الأيام القادمة";
    } else if (!isIncrease) {
      adviceMessage = ". استمر في هذا الأداء الجيد!";
    }

    insights.push({
      type: isIncrease ? "bill_warning" : "spending_pattern",
      priority: change > 40 ? "high" : "medium",
      titleAr: `${trend} مصاريفك بنسبة ${Math.abs(change)}%`,
      messageAr: `${trend} مصاريفك بنسبة ${Math.abs(change)}% هذا الشهر (${formatAmount(
        financialAnalysis.currentMonthSpending
      )} ريال) مقارنة بالشهر الماضي (${formatAmount(
        financialAnalysis.previousMonthSpending
      )} ريال)${adviceMessage}`,
      actionable: false,
    });
  }

  // Priority 5: Top spending category (LOW priority)
  if (
    financialAnalysis &&
    financialAnalysis.topSpendingCategory !== "غير محدد" &&
    financialAnalysis.topSpendingAmount > 0 &&
    insights.length < 3
  ) {
    const percentage =
      financialAnalysis.currentMonthSpending > 0
        ? Math.round(
            (financialAnalysis.topSpendingAmount /
              financialAnalysis.currentMonthSpending) *
              100
          )
        : 0;

    // Get worker info from billsByMinistry
    const ministryData =
      financialContext.billsByMinistry?.[financialAnalysis.topSpendingCategory];
    let workerInfo = "";
    if (ministryData?.workers && ministryData.workers.length > 0) {
      if (ministryData.workers.length === 1) {
        workerInfo = ` للعامل ${ministryData.workers[0]}`;
      } else {
        workerInfo = ` لـ ${ministryData.workers.length} عمال (مثل: ${ministryData.workers[0]})`;
      }
    }

    insights.push({
      type: "spending_pattern",
      priority: "low",
      titleAr: `أعلى فئة صرف: ${financialAnalysis.topSpendingCategory}`,
      messageAr: `${
        financialAnalysis.topSpendingCategory
      }: ${formatAmount(
        financialAnalysis.topSpendingAmount
      )} ريال (${percentage}% من إجمالي المصاريف)${workerInfo}`,
      actionable: false,
    });
  }

  // Sort by priority and limit to 3
  insights.sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  return insights.slice(0, 3);
};

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

/**
 * Get AI insights for user (main entry point)
 * Orchestrates cache check, generation, and caching
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of insights
 */
export const getAIInsights = async (userId) => {
  try {
    console.log("🚀 AI Insights: Starting for user:", userId);

    // 1. Check cache first
    const cachedInsights = await getCachedInsights(userId);
    if (cachedInsights) {
      return cachedInsights;
    }

    // 2. Prepare financial context
    const financialContext = await prepareFinancialContext(userId);

    // 3. Check if user has any financial data
    const hasNoBills = !financialContext.bills || financialContext.bills.total === 0;
    const hasNoTransactions =
      !financialContext.financialAnalysis ||
      financialContext.financialAnalysis.totalTransactionsThisMonth === 0;

    if (hasNoBills && hasNoTransactions) {
      console.log("ℹ️ AI Insights: No financial data for new user");
      const noDataInsights = [
        {
          type: "optimization_tip",
          priority: "low",
          titleAr: "لا توجد بيانات مالية",
          messageAr:
            "لا توجد بيانات مالية متاحة حالياً. ابدأ بإضافة فواتيرك الحكومية وسنقدم لك نصائح ذكية مخصصة لتحسين إدارتك المالية",
          actionable: false,
        },
      ];
      await cacheInsights(userId, noDataInsights);
      return noDataInsights;
    }

    // 4. Try to generate insights from AI
    let insights = [];
    try {
      insights = await generateInsightsFromAI(financialContext);
    } catch (error) {
      console.warn("⚠️ AI Insights: AI generation failed, using fallback");
      insights = getFallbackInsights(financialContext);
    }

    // 5. If no insights generated, use fallback
    if (!insights || insights.length === 0) {
      console.log("ℹ️ AI Insights: No AI insights, using fallback");
      insights = getFallbackInsights(financialContext);
    }

    // 6. Final check: if still no insights after fallback, return empty
    if (!insights || insights.length === 0) {
      console.log("ℹ️ AI Insights: No insights to show");
      return [];
    }

    // 6. Cache the insights
    await cacheInsights(userId, insights);

    console.log(`✅ AI Insights: Complete (${insights.length} insights)`);
    return insights;
  } catch (error) {
    console.error("❌ AI Insights: Fatal error:", error);

    // Last resort fallback
    const errorInsights = [
      {
        type: "optimization_tip",
        priority: "low",
        titleAr: "خدمة النصائح مؤقتاً غير متاحة",
        messageAr:
          "نعمل على تحسين خدمة النصائح الذكية. يرجى المحاولة مرة أخرى لاحقاً",
        actionable: false,
      },
    ];

    return errorInsights;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getAIInsights,
  getCachedInsights,
  cacheInsights,
  clearInsightsCache,
  shouldGenerateInsights,
  prepareFinancialContext,
  generateInsightsFromAI,
  getFallbackInsights,
};
