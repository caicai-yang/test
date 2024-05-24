<script lang="tsx" name="PageTransition">
  import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
  import { IconDoubleUp, IconDoubleDown } from '@arco-design/web-vue/es/icon'

  export default defineComponent({
    setup(props, { slots }) {
      const iconRef = ref()
      const pageMode = ref<'half' | 'fullUp' | 'fullBottom'>('half')

      function handleMouseUp(event: MouseEvent) {
        if (event.button === 0) {
          // 鼠标左键
          if (pageMode.value === 'half') {
            return (pageMode.value = 'fullUp')
          }

          return (pageMode.value = 'half')
        }

        if (event.button === 2) {
          // 右键点击
          if (pageMode.value === 'fullBottom') {
            return (pageMode.value = 'fullUp')
          }

          return (pageMode.value = 'fullBottom')
        }
      }

      // 渲染 icon
      function renderIcon() {
        const Icon = pageMode.value === 'fullUp' ? IconDoubleUp : IconDoubleDown

        return (
          <div
            ref={iconRef}
            onMouseup={handleMouseUp}
            class={`page-transition-icon page-transition-icon-${pageMode.value}`}
          >
            <Icon />
          </div>
        )
      }

      function preventContextMenu(event: MouseEvent) {
        event.preventDefault()
      }

      onMounted(() => {
        iconRef.value.addEventListener('contextmenu', preventContextMenu)
      })

      onBeforeUnmount(() => {
        iconRef.value.removeEventListener('contextmenu', preventContextMenu)
      })

      return () => {
        return (
          <div class='page-transition'>
            <div class={`page-transition-up page-transition-up-${pageMode.value}`}>
              {slots?.upComponent?.()}
            </div>

            <div class={`page-transition-bottom page-transition-bottom-${pageMode.value}`}>
              {slots?.bottomComponent?.()}
            </div>
            {renderIcon()}
          </div>
        )
      }
    }
  })
</script>

<style lang="less" scoped>
  .page-transition {
    width: 100%;
    height: 100%;
    position: relative;
    overflow-y: hidden;
    .page-transition-up,
    .page-transition-bottom {
      transition: height 0.5s ease;
    }

    .page-transition-up-half {
      height: 49%;
      margin-bottom: 1%;
    }
    .page-transition-bottom-half {
      height: 49%;
    }
    .page-transition-up-fullUp,
    .page-transition-bottom-fullBottom {
      height: 100%;
    }

    .page-transition-up-fullBottom,
    .page-transition-bottom-fullTop {
      height: 0;
      overflow: hidden;
    }

    .page-transition-icon {
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      width: 40px;
      height: 40px;
      line-height: 42px;
      text-align: center;
      font-size: 35px;
      font-weight: 700;
      border-radius: 50%;
      background-color: #fff;
      color: #d7d7d7;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
      cursor: pointer;
      transition: all 0.5s ease;
      z-index: 999;

      > svg {
        margin-top: 2px;
      }
    }

    .page-transition-icon-half {
      top: 48%;
    }

    .page-transition-icon-fullUp {
      top: calc(100% - 85px);
    }
    .page-transition-icon-fullBottom {
      top: 20px;
    }
  }
</style>
