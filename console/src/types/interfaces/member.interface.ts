import { RoleMember, Language, Gender } from "@/types/enums/enum";

export interface Member {
  id: number;
  email: string;
  fullName?: string;
  description?: string;
  phoneNumber?: string;
  address?: {
    provinceOrMunicipality?: string;
    districtOrTown?: string;
  };
  cid?: string;
  image?: {
    id: string;
    url: string;
  };
  facebook?: string;
  gender?: Gender;
  birthday?: Date;
  is2FA?: boolean;
  roleMember?: RoleMember;
  isBanned?: boolean;
  isNotification?: boolean;
  language?: Language;
  createdAt?: Date;
  updatedAt?: Date;
}
