export const RoleMember = {
  ADMIN: "admin",
  OWNER: "owner",
  EMPLOYEE: "employee",
};

export type RoleMember = (typeof RoleMember)[keyof typeof RoleMember];

export const Gender = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

export type Gender = (typeof Gender)[keyof typeof Gender];

export const Language = {
  ENGLISH: "english",
  VIETNAM: "vietnam",
};

export type Language = (typeof Language)[keyof typeof Language];

export const AccountType = {
  PERSONAL: "personal",
  BUSINESS: "business",
  ENTERPRISE: "enterprise",
};

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const StoreStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export type StoreStatus = (typeof StoreStatus)[keyof typeof StoreStatus];

export const ServicePackage = {
  TRIAL: "trial",
  SUPPORT: "support",
  PROFESSIONAL: "professional",
  PREMIUM: "premium",
};

export type ServicePackage =
  (typeof ServicePackage)[keyof typeof ServicePackage];

export const WeightType = {
  KG: "kg",
  G: "g",
};

export type WeightType = (typeof WeightType)[keyof typeof WeightType];

export const CustomerType = {
  INDIVIDUAL: "individual",
  COMPANY: "company",
};

export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType];

export const ObjectTransaction = {
  CUSTOMER: "customer",
  SUPPLIER: "supplier",
  EMPLOYEE: "employee",
  DELIVERY_PARTNER: "delivery_partner",
  OTHER: "other",
};

export type ObjectTransaction =
  (typeof ObjectTransaction)[keyof typeof ObjectTransaction];

export const TransactionType = {
  INCOME: "income",
  EXPENSE: "expense",
};

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const OrderStatus = {
  PROVISIONAL_BALLOT: "provisional_ballot",
  CONFIRMED: "confirmed",
};

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const Industry = {
  RETAIL: "retail",
  CLOTHING: "clothing",
  FURNITURE: "furniture",
  JEWELRY: "jewelry",
  BEAUTY: "beauty",
  GROCERY: "grocery",
  FASHION: "fashion",
  SPORTS: "sports",
  OTHER: "other",
};

export type Industry = (typeof Industry)[keyof typeof Industry];

export const ServiceType = {
  PRODUCT: "product",
  SERVICE: "service",
};

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];
