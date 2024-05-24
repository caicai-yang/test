<script lang="tsx" name="TableTd">
  import { defineComponent, resolveComponent, h, PropType } from 'vue'
  import { Tag } from '@arco-design/web-vue'
  import SvgIcon from '../SvgIcon/index.vue'
  import DictTag from '@/components/DictTag.vue'
  import { useDictionary } from '@/hooks/useDictionary'
  import { CUSTOMER_SVG_PREFIX } from '@/utils/constant'

  export default defineComponent({
    props: {
      column: {
        type: Object,
        default: () => {}
      },
      record: {
        type: Object,
        default: () => {}
      },
      rowIndex: {
        type: Number,
        default: 0
      },
      // 标签大小
      tagSize: {
        type: String as PropType<'medium' | 'small' | 'large' | undefined>,
        default: 'medium'
      }
    },
    setup(props) {
      // 获取字典数组
      function getDictionary(value: string) {
        const currentDictionary = useDictionary(value)
        return currentDictionary.value
      }

      function renderContent() {
        return props.column.render({
          record: props.record,
          colum: props.column,
          rowIndex: props.rowIndex
        })
      }

      function renderIcon() {
        const { column, record } = props

        const iconName = record[column.dataIndex]

        if (iconName.startsWith(CUSTOMER_SVG_PREFIX)) {
          return (
            <SvgIcon
              name={record[column.dataIndex].split(CUSTOMER_SVG_PREFIX)[1]}
              style='width: 20px; height: 20px'
              color='#30333b'
            />
          )
        }

        return h(resolveComponent(iconName), { size: 20 })
      }

      function renderTag() {
        const { record, column } = props
        const content = record[column.dataIndex]
        if (record.color) {
          return (
            <Tag class='dict-tag' color={record.color}>
              {content}
            </Tag>
          )
        }
        return content
      }

      function renderDictionary() {
        const { column, record } = props
        return (
          <DictTag
            options={getDictionary(column.dictionaryCode)}
            value={record[column.dataIndex]}
            size={props.tagSize}
          />
        )
      }

      function renderImage() {
        return <img src={props.record[props.column.dataIndex]} style='height: 100px; width: auto' />
      }

      return () => {
        const { column, record } = props
        const content = record[column.dataIndex]
        const dataType = column.dataType

        if (column.render) {
          return renderContent()
        }

        if (
          !column.formatter &&
          !column.slotName &&
          (column.dictionaryCode || ['IconFont', 'tag', 'IMG'].includes(column.dataType))
        ) {
          if (dataType === 'IconFont' && content) {
            return renderIcon()
          }

          if (dataType === 'tag') {
            return renderTag()
          }

          if (column.dictionaryCode) {
            return renderDictionary()
          }

          if (dataType === 'IMG' && content) {
            return renderImage()
          }
        }

        return content
      }
    }
  })
</script>

<style lang="less" scoped>
  .dict-tag {
    height: auto;
    padding: 5px 8px;
    white-space: unset;
  }
</style>
