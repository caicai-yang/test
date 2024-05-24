<script lang="tsx" name="Tab">
  import { defineComponent, shallowRef, ref, watchEffect, KeepAlive } from 'vue'
  import type { PropType, Component, VNodeChild, ShallowRef } from 'vue'
  import { Card, Button, Tooltip } from '@arco-design/web-vue'
  import { ButtonProps } from '@arco-design/web-vue'

  interface ComponentItem {
    title: string
    component: Component
    headerRender?: (currentComponentRef: Component | undefined) => VNodeChild
    hasAddButton?: boolean
    props?: { [key: string]: any }
    addButtonTooltipProps?: { [key: string]: any }
    addButtonProps?: ButtonProps
  }

  export default defineComponent({
    props: {
      hasAddButton: {
        type: Boolean,
        default: false
      },
      addButtonTooltipProps: {
        type: Object,
        default: () => ({ disabled: true })
      },
      addButtonProps: {
        type: Object as PropType<ButtonProps>,
        default: () => ({})
      },
      componentList: {
        type: Array as PropType<Array<ComponentItem>>,
        default: () => []
      },
      isRenderCardWrapper: {
        type: Boolean,
        default: true
      }
    },
    setup(props, { expose }) {
      let currentComponent: ShallowRef<ComponentItem>
      const currentComponentRef = ref()

      watchEffect(() => {
        const findComponent = props.componentList.find(
          (componentItem: ComponentItem) => componentItem.title === currentComponent?.value.title
        )
        currentComponent = findComponent
          ? shallowRef(findComponent)
          : shallowRef(props.componentList[0])
      })

      expose({ currentComponentRef })

      function renderTab() {
        const Component = currentComponent.value.component
        return (
          <div class='tab'>
            <div class='tab-header'>
              <div class='tab-header-left'>
                {props.componentList.map((item, index) => (
                  <div
                    key={index}
                    class={[
                      [
                        'tab-header-item',
                        item === currentComponent.value && `tab-header-item-active`
                      ]
                    ]}
                    style={{ left: `${-10 * index}px` }}
                    onClick={() => (currentComponent.value = item)}
                  >
                    {item.title}
                  </div>
                ))}
              </div>

              <div class='tab-header-right'>
                <Tooltip
                  {...(props.addButtonTooltipProps || currentComponent.value.addButtonTooltipProps)}
                >
                  {(props.hasAddButton || currentComponent.value.hasAddButton) && (
                    <div>
                      <Button
                        type='primary'
                        onClick={currentComponentRef.value?.handleAdd}
                        {...(JSON.stringify(props.addButtonProps) !== '{}'
                          ? props.addButtonProps
                          : currentComponent.value.addButtonProps)}
                      >
                        新增
                      </Button>
                    </div>
                  )}
                </Tooltip>

                {currentComponent.value.headerRender &&
                  currentComponent.value.headerRender(currentComponentRef.value)}
              </div>
            </div>

            <KeepAlive>
              <Component
                ref={currentComponentRef}
                style='flex: 1'
                {...currentComponent.value.props}
              />
            </KeepAlive>
          </div>
        )
      }

      return () => {
        if (props.isRenderCardWrapper) {
          return <Card class='arco-card-body100 arco-card-body-flex'>{renderTab()}</Card>
        }
        return renderTab()
      }
    }
  })
</script>

<style lang="less" scoped>
  .tab {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .tab-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .tab-header-left {
        flex: 1;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .tab-header-item {
          position: relative;
          min-width: 70px;
          padding: 0 20px;
          height: 35px;
          line-height: 35px;
          text-align: center;
          box-sizing: border-box;
          border: 1px solid #e0f0ff;
          border-top-right-radius: 21px;
          background-color: #fdfdfd;
          cursor: pointer;
          transition: 0.3s ease all;
        }

        .tab-header-item-active {
          z-index: 1;
          color: #fff;
          background-color: rgba(var(--primary-1));
          border-color: rgba(var(--primary-1));
        }
      }

      .tab-header-right {
        flex: none;

        button + button {
          margin-left: 20px;
        }
      }
    }
  }
</style>
