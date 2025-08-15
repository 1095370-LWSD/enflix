import React from "react";

function cn(...classes) {
	return classes.filter(Boolean).join(" ");
}

export function Button({
	asChild,
	variant = "default",
	size = "default",
	className = "",
	children,
	...props
}) {
	const Comp = asChild ? 'span' : 'button';
	const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-black";
	const variants = {
		default: "bg-red-600 text-white hover:bg-red-600/90",
		secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
		ghost: "bg-transparent hover:bg-white/10 text-zinc-200",
	};
	const sizes = {
		default: "h-9 px-4 py-2",
		icon: "h-9 w-9",
	};
	return (
		<Comp className={cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className)} {...props}>
			{children}
		</Comp>
	);
}

export default Button;