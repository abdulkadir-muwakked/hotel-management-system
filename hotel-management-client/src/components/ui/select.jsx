// Simple Select component using shadcn/ui and Tailwind
import * as React from "react";

export const Select = React.forwardRef(function Select({ value, onValueChange, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className="border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      value={value}
      onChange={e => onValueChange?.(e.target.value)}
      {...props}
    >
      {children}
    </select>
  );
});

export default Select;
