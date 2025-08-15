import React, { createContext, useContext, useEffect } from "react";

const DialogContext = createContext({ open: false, onOpenChange: () => {} });

export function Dialog({ open, onOpenChange, children }) {
	return open ? (
		<DialogContext.Provider value={{ open, onOpenChange }}>
			{children}
		</DialogContext.Provider>
	) : null;
}

export function DialogContent({ className = "", children }) {
	const { onOpenChange } = useContext(DialogContext);

	useEffect(() => {
		const onKey = (e) => { if (e.key === 'Escape') onOpenChange?.(false); };
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [onOpenChange]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/80" onClick={() => onOpenChange?.(false)} />
			<div className={("relative z-10 w-[95vw] max-w-3xl rounded-xl border border-red-900/40 bg-zinc-950 shadow-xl " + (className ? ` ${className}` : ""))}>
				{children}
			</div>
		</div>
	);
}

export function DialogHeader({ className = "", ...props }) {
	return <div className={("border-b border-red-900/30 p-4 " + (className ? ` ${className}` : ""))} {...props} />;
}
export function DialogFooter({ className = "", ...props }) {
	return <div className={("border-t border-red-900/30 p-4 flex justify-end gap-2 " + (className ? ` ${className}` : ""))} {...props} />;
}
export function DialogTitle({ className = "", ...props }) {
	return <h3 className={("text-lg font-semibold text-white " + (className ? ` ${className}` : ""))} {...props} />;
}
export function DialogDescription({ className = "", ...props }) {
	return <p className={("text-sm text-zinc-400 " + (className ? ` ${className}` : ""))} {...props} />;
}

export default Dialog;