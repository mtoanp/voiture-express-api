import { Transform, TransformFnParams } from 'class-transformer';

export function NormalizeEmail() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim().toLowerCase() : String(value),
  );
}
