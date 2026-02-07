import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'up' | 'down' | 'flat' | 'gold' | 'crypto' | 'bond' | 'primary';
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  up: 'bg-red-50 text-red-600',
  down: 'bg-blue-50 text-blue-600',
  flat: 'bg-gray-100 text-gray-500',
  gold: 'bg-amber-50 text-amber-700',
  crypto: 'bg-purple-50 text-purple-700',
  bond: 'bg-emerald-50 text-emerald-700',
  primary: 'bg-primary-50 text-primary-700',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
