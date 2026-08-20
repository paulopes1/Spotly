import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSearchDto {
  /**
   * A frase em linguagem natural. Limite de 500 chars protege contra abuso
   * de tokens na chamada de IA (prompt injection por volume).
   */
  @IsString()
  @MinLength(3, { message: 'Descreva o que você procura (mínimo 3 caracteres).' })
  @MaxLength(500, { message: 'A busca pode ter no máximo 500 caracteres.' })
  query!: string;
}
