export const RoleMember = {
  ADMIN: "admin",
  USER: "user",
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
