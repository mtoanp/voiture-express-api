import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class IsOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user; // from JwtStrategy
    const targetId = req.params.id; // ID from route (e.g. /users/:id)

    // ✅ Allow if the user owns the resource OR has admin role
    if (user.userId === targetId || user.role === 'admin') {
      return true;
    }

    throw new ForbiddenException('You are not allowed to access this resource');
  }
}
