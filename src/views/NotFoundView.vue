<template>
  <div class="not-found-view">
    <h1>404 - 页面未找到</h1>
    <p>抱歉，您访问的页面不存在。</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found-view {
  padding: 20px;
  text-align: center;
}
</style>