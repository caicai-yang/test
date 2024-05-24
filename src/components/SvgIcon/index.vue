<template>
  <div
    v-if="isExternalIcon"
    :style="styleExternalIcon"
    class="svg-external-icon svg-icon"
    v-bind="$attrs"
  ></div>
  <svg v-else :class="svgClass" aria-hidden="true" v-bind="$attrs">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
</template>

<script setup lang="ts" name="SvgIcon">
  import { computed } from 'vue'

  interface Props {
    name: string
    color: string
    className?: string
  }
  const props = withDefaults(defineProps<Props>(), {
    name: '',
    color: '#000',
    className: ''
  })

  const isExternalIcon = computed(() => isExternal(props.name))
  const iconName = computed(() => `#icon-${props.name}`)
  const svgClass = computed(() => {
    if (props.className) {
      return 'svg-icon ' + props.className
    }
    return 'svg-icon'
  })
  // 外链 icon
  const styleExternalIcon = computed(() => {
    return {
      mask: `url(${props.name}) no-repeat 50% 50%`,
      '-webkit-mask': `url(${props.name}) no-repeat 50% 50%`
    }
  })

  /**
   * @param {string} path
   * @returns {Boolean}
   */
  function isExternal(path: string) {
    return /^(https?:|mailto:|tel:)/.test(path)
  }
</script>

<style scoped>
  .svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }

  .svg-external-icon {
    background-color: currentColor;
    mask-size: cover !important;
    display: inline-block;
  }
</style>
