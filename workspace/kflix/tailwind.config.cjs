/**** Tailwind Config (CJS) ****/
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				brand: {
					red: "#dc2626",
					dark: "#0b0b0b",
				},
			},
		},
	},
	plugins: [],
};