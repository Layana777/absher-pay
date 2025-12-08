/**
 * Ministry Icon Mapper Utility
 * Maps government service types to their corresponding ministry icon components
 */

// Constant map linking service types to ministry icon names
export const MINISTRY_ICON_MAP = {
  passports: "MOI",
  civil_affairs: "MOI",
  traffic: "Traffic",
  human_resources: "MinistryOfHumanResources",
  commerce: "Commerce",
  justice: "Justice",
};

/**
 * Get the ministry icon name for a given service type
 * @param {string} serviceType - The service type key (e.g., "passports", "traffic")
 * @returns {string} The corresponding ministry icon name (fallback: "MOI")
 */
export const getMinistryIconName = (serviceType) => {
  return MINISTRY_ICON_MAP[serviceType] || "MOI";
};
