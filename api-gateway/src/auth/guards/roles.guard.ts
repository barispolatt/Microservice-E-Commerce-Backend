import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload, UserRole } from '@ecommerce/common';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // No roles required, access granted
        }

        const { user }: { user: JwtPayload } = context.switchToHttp().getRequest();

        if (!user || !user.role) {
            return false; // No user or role found on request
        }

        return requiredRoles.some((role) => user.role === role);
    }
}