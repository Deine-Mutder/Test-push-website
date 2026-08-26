import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'max.mustermann@example.com' })
  @IsEmail({}, { message: 'Bitte eine gültige E-Mail-Adresse angeben.' })
  email: string;

  @ApiProperty({ example: 'SicheresPasswort123!' })
  @IsString()
  @MinLength(8, { message: 'Das Passwort muss mindestens 8 Zeichen lang sein.' })
  @MaxLength(72)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Das Passwort muss Groß-, Kleinbuchstaben und eine Zahl enthalten.',
  })
  password: string;

  @ApiProperty({ example: 'Max' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName: string;

  @ApiProperty({ example: 'Mustermann' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  lastName: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class RequestPasswordResetDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Das Passwort muss Groß-, Kleinbuchstaben und eine Zahl enthalten.',
  })
  newPassword: string;
}
