import React from "react";

export function Card({ className = "", ...props }) {
	return <div className={("rounded-lg border border-red-900/30 bg-zinc-900/60 " + (className ? ` ${className}` : ""))} {...props} />;
}

export function CardContent({ className = "", ...props }) {
	return <div className={("p-4 " + (className ? ` ${className}` : ""))} {...props} />;
}

export default Card;