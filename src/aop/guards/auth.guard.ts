// src/modules/auth/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';


interface JwtPayload {
  sub: string;
  role?: string;
  email?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const rawAuth = request.headers.authorization;
    if (typeof rawAuth !== 'string') {
      throw new UnauthorizedException('Missing authorization header');
    }

    const parts = rawAuth.split(' ');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Malformed authorization header');
    }

    const token = parts[1];

    try {
      request.user = this.safeVerify(token);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');

      console.error('AuthGuard verify error:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private safeVerify(token: string): JwtPayload {
    const verifyFn = this.jwtService.verify as unknown as (
      t: string,
    ) => unknown;

    const decoded = verifyFn(token);

    if (typeof decoded !== 'object' || decoded === null) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const maybe = decoded as Partial<JwtPayload>;

    if (typeof maybe.sub !== 'string' || maybe.sub.length === 0) {
      throw new UnauthorizedException('Invalid token payload (missing sub)');
    }

    return {
      sub: maybe.sub,
      role: maybe.role,
      email: maybe.email,
    };
  }
}
