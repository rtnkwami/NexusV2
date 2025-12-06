import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiOptionalQuery(params: string[], required: boolean = false) {
  return applyDecorators(
    ...params.map((param) =>
      ApiQuery({
        name: param,
        required,
        type: 'string',
      }),
    ),
  );
}
