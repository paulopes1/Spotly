import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { FallbackAiService } from './fallback.service';
import { OpenAiService } from './openai.service';

@Module({
  providers: [AiService, OpenAiService, FallbackAiService],
  exports: [AiService],
})
export class AiModule {}
