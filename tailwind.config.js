/** @type {import('tailwindcss').Config} */
module.exports = {
     darkMode: "class",
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  theme: {
  	extend: {
		screens: {
      'sm': '480px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px'
    },
		fontFamily: {
			nunito: ['Nunito', 'sans-serif'],
		  },
  		colors: {
  			primary50: '#EAEAF1',
  			primary100: '#BCBDD3',
  			primary200: '#9C9DBE',
  			primary500: '#434487',
  			primary600: '#242568',
  			secondary50: '#BFF0DF',
  			secondary100: '#BFF0DF',
  			secondary200: '#A1E8D0',
  			secondary300: '#76DEBB',
  			secondary400: '#5BD7AD',
  			secondary500: '#32CD99',
  			secondary600: '#2EBB8B',
  			secondary800: '#1C7154',
  			secondary900: '#155640',
  			neutral50: '#EAEAEA',
  			neutral100: '#BFBEBE',
  			neutral200: '#A09E9E',
  			neutral300: '#747272',
  			neutral400: '#595656',
  			neutral500: '#302C2C',
  			neutral800: '#6D6D6D',
  			selected: '#098DDD',
  			border: '#C7C7C7',
  			borderGreen: '#86CB64',
  			red: '#D12121',
  			white: '#FFF',
  			generate: 'rgba(45, 45, 45, 0.25)',
  			pink: '#FCC4C4',
  			bg50: '#F9F9F9',
  			bg100: '#EEE',
  			bg200: '#E5E5E5',
  			bgGreen: '#D9FAC9',
			tagColor: '#628D1C',
  			borderGray200: '#C7C7C7',
  			'foundation-neurtal-neurtal-300': '#747272',
  			'foundation-primary-blue-color-primary-color-500': '#434487',
  			'foundation-background-color-background-color-50': '#f9f9f9',
  			'foundation-neurtal-neurtal-50': '#f4f4f4',
  			'foundation-neurtal-neurtal-500': '#302c2c',
  			ghostwhite: '#eaeaf1',
  			gray: '#121212',
  			black: '#000',
  			mediumseagreen: '#32cd99',
  			'foundation-background-color-background-color-100': '#eee',
  			'foundation-background-color-background-color-300': '#d9d9d9',
  			'foundation-green-green-50': '#ebfaf5',
  			'foundation-neurtal-neurtal-400': '#595656',
  			'foundation-green-green-800': '#1c7154',
  			'foundation-green-green-100': '#bff0df',
  			'foundation-green-green-700': '#24926d',
  			'foundation-green-green-300': '#76debb',
  			darkslateblue: '#1c1d51',
  			'foundation-background-color-background-color-600': '#b5b5b5',
  			'foundation-primary-blue-color-primary-color-300': '#6f70a1',
  			'foundation-background-color-background-color-200': '#e5e5e5',
  			crimson: '#da3232',
  			firebrick: '#d12121',
  			'foundation-neurtal-neurtal-100': '#bfbebe',
  			'foundation-primary-blue-color-primary-color-600': '#242568'
  		},
  		border: {
  			'border-dashed': '1px dashed var(--Foundation-primary-blue-color-primary-color-500, #434487)'
  		},
  		fontFamily: {
  			nunito: ['Nunito', 'sans-serif']
  		},
		
  		borderWidth: {
  			'1': '1px ',
  			'2': '2px',
  			'3': '3px',
  			'4': '4px',
  			'6': '6px'
  		},
  		borderColor: {
  			dashed: 'var(--Foundation-background-color-background-color-300, #D9D9D9)',
  			neutral100: 'var(--Foundation-background-color-background-color-300, #D9D9D9);'
  		}
  	},
  	fontSize: {
  		lg: '18px',
  		base: '16px',
  		'21xl': '40px',
  		sm: '14px',
  		'9xl': '28px',
  		xs: '12px',
  		xl: '20px'
  	}
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
      require("tailwindcss-animate")
],
};