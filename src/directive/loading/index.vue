<template>
  <div class="loading-container">
    <div class="loading-spinner">
      <span class="spinner-item item1"></span>
      <span class="spinner-item item2"></span>
      <span class="spinner-item item3"></span>
      <span class="spinner-item item4"></span>
      <span class="spinner-item item5"></span>
      <span class="spinner-item item6"></span>
      <span class="spinner-item item7"></span>
    </div>
    <div class="loading-text">{{ loadingText }}</div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue'
  export default defineComponent({
    name: 'Loading',
    setup() {
      const loadingText = ref('加载中...')
      const setLoadingText = (text: string) => {
        loadingText.value = text
      }
      return { loadingText, setLoadingText }
    }
  })
</script>
<style lang="less" scoped>
  @keyframes rotateSpinner {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .loading-container {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #409eff;
    z-index: 99999;
    .loading-spinner {
      position: relative;
      width: 16px;
      height: 16px;
      animation: rotateSpinner 1s linear infinite;
      .spinner-item {
        position: absolute;
        display: block;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: #409eff;
      }
      .item1 {
        top: 0;
        left: 50%;
        transform: translateX(-50%);
      }
      .item2 {
        top: 13%;
        left: 12%;
      }
      .item3 {
        top: 40%;
        left: 0;
      }
      .item4 {
        bottom: 13%;
        left: 12%;
      }
      .item5 {
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
      }
      .item6 {
        bottom: 13%;
        right: 12%;
      }
      .item7 {
        top: 40%;
        right: 0;
      }
    }
    .loading-text {
      font-size: 13px;
      padding: 10px;
    }
  }
</style>
