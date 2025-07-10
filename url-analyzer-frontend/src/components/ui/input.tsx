import { cn } from '@/lib/utils';
import * as React from 'react';
import { Icon, type IconProps, type IconSize } from './icon/Icon';
import type { IconName } from './icon/iconMapping';

export interface InputProps extends React.ComponentProps<'input'> {
  icon?: IconName;
  iconPosition?: 'before' | 'after';
  isLoading?: boolean;
}

const iconSizeMap: Record<NonNullable<InputProps['iconPosition']>, IconSize> = {
  before: 'lg',
  after: 'lg',
};

function Input({
  className,
  type = 'text',
  icon,
  iconPosition = 'before',
  isLoading = false,
  ...props
}: InputProps) {
  const hasIcon = Boolean(icon || isLoading);
  const iconSize = iconSizeMap[iconPosition || 'before'];

  const effectiveIcon: IconProps | undefined = isLoading
    ? { name: 'loading', size: iconSize }
    : icon
      ? { name: icon, size: iconSize }
      : undefined;

  const renderIcon = (icon?: IconProps) =>
    icon ? (
      <span
        className={cn(
          'absolute top-1/2 -translate-y-1/2 pointer-events-none text-neutral-dark',
          iconPosition === 'before' ? 'left-3' : 'right-3',
          icon.name === 'loading' && 'animate-spin'
        )}
      >
        <Icon {...icon} />
      </span>
    ) : null;

  return (
    <div className="relative w-full">
      {iconPosition === 'before' && renderIcon(effectiveIcon)}

      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          hasIcon && iconPosition === 'before' && 'pl-10',
          hasIcon && iconPosition === 'after' && 'pr-8',
          className
        )}
        {...props}
      />

      {iconPosition === 'after' && renderIcon(effectiveIcon)}
    </div>
  );
}

Input.displayName = 'Input';

export { Input };
