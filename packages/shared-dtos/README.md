# Shared DTOs

This package contains shared Data Transfer Objects (DTOs) used across the application. These DTOs help maintain consistency in data structures between different parts of the application.

## Table of Contents

- [Shared DTOs](#shared-dtos)
  - [Table of Contents](#table-of-contents)
  - [Adding a New DTO](#adding-a-new-dto)
  - [Building the Package](#building-the-package)
  - [Using DTOs in Other Packages](#using-dtos-in-other-packages)
  - [Best Practices](#best-practices)
  - [Common Issues](#common-issues)
    - [DTO not found](#dto-not-found)
    - [Type errors after updating a DTO](#type-errors-after-updating-a-dto)

## Adding a New DTO

1. Create a new TypeScript file in the appropriate directory under `src/` (e.g., `src/nft/nft.dto.ts`)
2. Define your DTO class with proper decorators:

    ```typescript
    import { ApiProperty } from '@nestjs/swagger';
    import { IsString, IsNotEmpty } from 'class-validator';

    export class NewDto {
        @ApiProperty({ description: 'Description of the field' })
        @IsString()
        @IsNotEmpty()
        fieldName: string;
    }
    ```

3. Export the DTO in the appropriate `index.ts` file:
    ```typescript
    // src/nft/index.ts
    export * from './nft.dto';
    ```
4. Make sure to also export it in the main `index.ts` file if needed:
    ```typescript
    // src/index.ts
    export * from './nft';
    ```

## Building the Package

After adding or modifying any DTOs, you need to build the package:

```bash
# From the root of the monorepo
pnpm build --filter=@repo/shared-dtos

# Or navigate to the package and run
cd packages/shared-dtos
pnpm build
```

## Using DTOs in Other Packages

To use a DTO from another package, import it from the package root:

```typescript
// Correct way
import { NftDto } from '@repo/shared-dtos';
```

## Best Practices

1. **Always build after changes**: Remember to build the package after making changes to DTOs
2. **Use barrel exports**: Group related DTOs in directories with an `index.ts` file
3. **Document your DTOs**: Use JSDoc comments and `@ApiProperty` decorators for better documentation
4. **Keep DTOs focused**: Each DTO should have a single responsibility
5. **Versioning**: When making breaking changes, consider versioning your DTOs
6. **Validation**: Use `class-validator` decorators to define validation rules
7. **Documentation**: Keep this README updated with any changes to the workflow

## Common Issues

### DTO not found

If you get an error like `Module not found: Can't resolve '@repo/shared-dtos'`:

1. Make sure the package is built
2. Check that the DTO is properly exported in the relevant `index.ts` files
3. Verify the import path is correct

### Type errors after updating a DTO

1. Rebuild the shared-dtos package
2. Restart your development server
3. Clear any build caches if necessary
