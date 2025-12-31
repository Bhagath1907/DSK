import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: "bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/30 border border-transparent",
            secondary: "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/30 border border-transparent",
            outline: "border-2 border-sky-500 text-sky-500 hover:bg-sky-50",
            ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
            destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 border border-transparent"
        }

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2 text-base",
            lg: "px-6 py-3 text-lg",
            icon: "h-10 w-10 p-2"
        }

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
