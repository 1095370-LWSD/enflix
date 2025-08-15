import React from "react";

export function Input({ className = "", ...props }) {
	return (
		<input
			className={
				"flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
				+ (className ? ` ${className}` : "")
			}
			{...props}
		/>
	);
}

export default Input;