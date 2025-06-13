import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE } from '@ecommerce/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        try {
            const userPayload = await firstValueFrom(
                this.authClient.send({ cmd: 'verify_token' }, { token }),
            );
            request['user'] = userPayload; // Attach user payload to the request
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}