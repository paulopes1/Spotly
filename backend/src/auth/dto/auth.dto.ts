import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Informe seu nome.' })
  @MaxLength(80)
  name!: string;

  @IsEmail({}, { message: 'E-mail inválido.' })
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'A senha precisa de pelo menos 8 caracteres.' })
  @MaxLength(72) // limite do bcrypt
  @Matches(/(?=.*[a-zA-Z])(?=.*\d)/, { message: 'A senha precisa de letras e números.' })
  password!: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'E-mail inválido.' })
  email!: string;

  @IsString()
  @MaxLength(72)
  password!: string;
}
