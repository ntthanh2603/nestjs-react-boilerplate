import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
  UseGuards,
  applyDecorators,
  Injectable,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleMember } from '../enums/enum';
import { JwtService } from '@nestjs/jwt';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Owner = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const owner = request.owner;
    if (!owner) throw new ForbiddenException('You are not owner');
    return owner;
  },
);

export const Employee = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const employee = request.employee;
    if (!employee) throw new ForbiddenException('You are not employee');
    return employee;
  },
);

export const Admin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const admin = request.admin;
    if (!admin) throw new ForbiddenException('You are not admin');
    return admin;
  },
);

export const Member = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const member = request.member;
    if (!member) throw new ForbiddenException('You are not member');
    return member;
  },
);

export const ROLES_KEY = 'roles';
export const Role = (...roles: RoleMember[]) => {
  return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(RoleGuard));
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleMember[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify the token and get the user
      const payload = await this.jwtService.decode(token);
      // const payload = await this.jwtService.verify(token);

      if (!payload || !payload.roleMember) {
        throw new ForbiddenException('You are not authorized');
      }

      // Check if user has required role
      return requiredRoles.some((role) => payload.roleMember === role);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
