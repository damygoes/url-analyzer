import { forwardRef } from 'react';
import { iconMap, type IconName } from './iconMapping';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl';

const sizeMap: Record<
  IconSize,
  { width: number; height: number; strokeWidth: number }
> = {
  sm: { width: 12, height: 12, strokeWidth: 0.8 },
  md: { width: 15, height: 15, strokeWidth: 1 },
  lg: { width: 18, height: 18, strokeWidth: 1.2 },
  xl: { width: 24, height: 24, strokeWidth: 1.5 },
  '2xl': { width: 30, height: 30, strokeWidth: 1.7 },
  '3xl': { width: 36, height: 36, strokeWidth: 2 },
  '5xl': { width: 69, height: 69, strokeWidth: 3 },
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: IconSize;
  color?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'xl', color = 'currentColor', className, ...rest }, ref) => {
    const SvgIcon = iconMap[name];
    const { width, height, strokeWidth } = sizeMap[size];

    if (!SvgIcon) {
      console.warn(
        `Icon "${name}" not found. Available icons: ${Object.keys(iconMap).join(', ')}`
      );
      return null;
    }

    return (
      <SvgIcon
        ref={ref}
        width={rest.width ?? width}
        height={rest.height ?? height}
        strokeWidth={strokeWidth}
        className={className}
        fill="none"
        stroke={color || undefined}
        {...rest}
      />
    );
  }
);

Icon.displayName = 'Icon';
