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
		'no-unused-vars': 'off',
		'unused-imports/no-unused-vars': 'off',
		'no-alert': 'off',
	},
	formatters: true,
});
