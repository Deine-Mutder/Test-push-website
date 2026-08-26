import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.service.getProfile(user.userId);
  }

  @Patch()
  updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() user: CurrentUserPayload) {
    return this.service.updateProfile(user.userId, dto);
  }

  @Patch('password')
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: CurrentUserPayload) {
    return this.service.changePassword(user.userId, dto);
  }
}
