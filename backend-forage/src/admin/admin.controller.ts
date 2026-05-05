import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type AuthUser = {
  userId: number;
  username: string;
  role: string;
};

@Controller('admin')
export class AdminController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getAdminData(@Req() req: { user: AuthUser }) {
    return {
      message: 'Accès autorisé',
      user: req.user,
    };
  }
}
