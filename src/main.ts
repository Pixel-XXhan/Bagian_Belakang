import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('RPP Generator API')
    .setDescription(`
## API Backend untuk Aplikasi RPP Generator

### Fitur Utama:
- **Authentication**: Login via Google & Facebook OAuth (Supabase)
- **Gemini API**: Text generation, multimodal, streaming, function calling
- **OpenRouter API**: Claude & GPT models, vision, streaming, tool calling

### Models Tersedia:

#### Gemini
- \`gemini-3-pro-preview\` - Model flagship
- \`gemini-3-flash-preview\` - Model cepat dengan thinking
- \`gemini-1.5-flash\` - Model efisien
- \`gemini-2.5-pro\` - Context window besar

#### OpenRouter
- \`anthropic/claude-opus-4.5\` - Visual reasoning superior
- \`anthropic/claude-sonnet-4.5\` - 1M context window
- \`openai/gpt-5.2-chat\` - Conversational
- \`openai/gpt-5.2-pro\` - High-throughput
- \`openai/gpt-5.2\` - Flagship model
    `)
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints (Google/Facebook OAuth)')
    .addTag('Gemini', 'Google Gemini AI API endpoints')
    .addTag('OpenRouter', 'OpenRouter AI API endpoints (Claude, GPT)')
    .addTag('RPP', 'RPP (Lesson Plan) management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'RPP Generator API Docs',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2.5em; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger UI available at http://localhost:${port}/api/docs`);
}
bootstrap();
