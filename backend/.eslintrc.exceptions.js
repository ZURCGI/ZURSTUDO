// ESLint 例外規則配置
// 用於處理無法避免的第三方庫類型問題

module.exports = {
  // 針對特定文件的例外規則
  overrides: [
    {
      // 第三方庫相關文件
      files: [
        'src/media/**/*.ts',
        'src/upload/**/*.ts',
        'src/analytics/**/*.ts'
      ],
      rules: {
        // 允許必要的類型斷言
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        // 允許 require 語法（某些第三方庫需要）
        '@typescript-eslint/no-require-imports': 'off',
      }
    },
    {
      // 測試文件
      files: ['test/**/*.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
      }
    }
  ]
}; 