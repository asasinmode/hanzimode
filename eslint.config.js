import antfu from '@antfu/eslint-config';

export default antfu({
	stylistic: {
		semi: true,
		indent: 'tab',
	},
	rules: {
		'style/brace-style': ['error', '1tbs'],
		'curly': ['error', 'all'],
		'no-console': 'off',
	},
	formatters: true,
});
