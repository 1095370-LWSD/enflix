import React from "react";

export function Label({ className = "", ...props }) {
	return <label className={("text-sm font-medium text-zinc-300" + (className ? ` ${className}` : ""))} {...props} />;
}

export default Label;