// frontend/src/components/ui/timeline-item.tsx
import { ReactNode } from 'react';

interface TimelineItemProps {
  children: ReactNode;
  className?: string;
}

export function TimelineItem({ children, className = '' }: TimelineItemProps) {
  return (
    <li className={`relative flex items-start gap-4 py-1 pl-8 before:absolute before:left-4 before:top-0 before:-bottom-4 before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A] last:before:hidden ${className}`}>
      <span className="absolute left-0 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
        <span className="h-3 w-3 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]" />
      </span>
      <span className="mt-1">{children}</span>
    </li>
  );
}