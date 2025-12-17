module.exports = {
  root: true,
  env: {
    node: true,
    // 增加浏览器环境，让 `defineProps` 等全局可用
    'vue/setup-compiler-macros': true
  },
  extends: [
    // 使用 Vue 3 的推荐规则集，替代 ‘plugin:vue/essential’
    'plugin:vue/vue3-recommended',
    'eslint:recommended'
  ],
  // 添加这一部分，告诉 ESLint 这些是全局变量，无需定义
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  },
rules: {
  'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  // 添加这一行，将“变量未使用”从错误降级为警告
  'no-unused-vars': 'warn'  // 或者 'off' 完全关闭
}
}