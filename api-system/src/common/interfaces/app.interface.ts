import { Images } from 'src/images/entities/images.entity';
import { RoleMember } from '../enums/enum';

export interface IMember {
  id: string;
  roleMember: RoleMember;
  deviceId?: string;
  email?: string;
  fullName?: string;
  password?: string;
  salt?: string;
  description?: string;
  is2FA?: boolean;
  isBanned?: boolean;
  isNotification?: boolean;
  secretKey?: string;
  phoneNumber?: string;
  cid?: string;
  gender?: string;
  birthday?: Date;
  dateOfIssue?: Date;
  placeOfIssue?: string;
  facebook?: string;
  address?: {
    provinceOrMunicipality: string;
    districtOrTown: string;
  };
  image?: Images;
  storeId?: string;
  workBranchId?: string;
  exp?: number;
  iat?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
