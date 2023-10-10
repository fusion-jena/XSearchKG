const config = {
	api: {
		baseUrl: 'http://localhost:3001'
	},
	page: {
		title: 'XSearchKG',
		subtitle: 'A Platform for Explainable Keyword Search over Knowledge Graphs'
	},
	select: {
		theme: (defaultTheme) => ({
			...defaultTheme,
			colors: {
				...defaultTheme.colors,
				primary: 'var(--text-color-2)',
				primary25: 'var(--background-color-4)',
				primary50: 'var(--background-color-3)',
				primary75: 'var(--background-color-4)',
				danger: 'var(--text-color-1)',
				dangerLight: 'var(--background-color-4)',
				neutral0: 'var(--background-color-2)',
				neutral5: 'var(--background-color-2)',
				neutral10: 'var(--background-color-2)',
				neutral20: 'var(--background-color-4)',
				neutral30: 'var(--background-color-4)',
				neutral40: 'var(--text-color-2)',
				neutral50: 'var(--text-color-2)',
				neutral60: 'var(--text-color-2)',
				neutral70: 'var(--text-color-1)',
				neutral80: 'var(--text-color-1)',
				neutral90: 'var(--text-color-1)'
			}
		})
	}
};

export default config;
