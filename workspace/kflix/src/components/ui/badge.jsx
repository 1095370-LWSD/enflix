import React from "react";

export function Badge({ className = "", children }) {
	return (
		<span className={("inline-flex items-center rounded-md bg-red-600/20 px-2 py-0.5 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-600/20" + (className ? ` ${className}` : ""))}>
			{children}
		</span>
	);
}

export default Badge;