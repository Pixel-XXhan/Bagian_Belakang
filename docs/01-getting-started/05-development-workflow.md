# Development Workflow

Panduan alur kerja development.

## Git Workflow

### Branch Naming
```
feature/add-rubrik-module
bugfix/fix-rpp-generation
hotfix/auth-token-expire
docs/update-api-reference
```

### Commit Message
```
feat: add rubrik penilaian module
fix: resolve PDF export timeout
docs: update API documentation
refactor: improve error handling
test: add unit tests for rpp service
```

## Development Commands

```bash
# Development server (hot reload)
npm run start:dev

# Build for production
npm run build

# Run production server
npm run start:prod

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Test coverage
npm run test:cov
```

## Adding New Module

### 1. Generate Module dengan CLI

```bash
nest g module module-name
nest g controller module-name
nest g service module-name
```

### 2. Create DTO

```typescript
// src/module-name/dto/module-name.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class UpdateModuleDto extends PartialType(CreateModuleDto) {}
```

### 3. Implement Service

```typescript
@Injectable()
export class ModuleService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('table_name')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
}
```

### 4. Add Controller

```typescript
@ApiTags('Module Name')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v2/module-name')
export class ModuleController {
  constructor(private readonly service: ModuleService) {}

  @Get()
  async findAll(@CurrentUser() user: CurrentUserData) {
    return this.service.findAll(user.id);
  }
}
```

### 5. Register in AppModule

```typescript
// app.module.ts
import { ModuleNameModule } from './module-name/module-name.module';

@Module({
  imports: [
    // ... other modules
    ModuleNameModule,
  ],
})
export class AppModule {}
```

### 6. Add Database Table

```sql
-- db/migrations/002_add_module_table.sql
CREATE TABLE IF NOT EXISTS module_name (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing

### Unit Test
```typescript
// module-name.service.spec.ts
describe('ModuleService', () => {
  it('should return all items', async () => {
    const result = await service.findAll('user-id');
    expect(result).toBeDefined();
  });
});
```

### E2E Test
```typescript
// test/module-name.e2e-spec.ts
describe('ModuleController (e2e)', () => {
  it('/api/v2/module-name (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v2/module-name')
      .expect(200);
  });
});
```

## Code Review Checklist

- [ ] DTO validation decorators
- [ ] Swagger documentation
- [ ] Error handling
- [ ] Auth guard applied
- [ ] Database migration added
- [ ] Unit tests written
- [ ] Documentation updated
