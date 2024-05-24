import { Switch, Tag } from '@arco-design/web-vue'
import { hasPermission } from '@/utils'
import { useFindByDictionary } from '@/hooks/useDictionary'
import _ from 'lodash-es'

interface RenderOptions<T extends { [key: string]: any }> {
  permission: string
  callback: (value: string | number | boolean) => void
  field: keyof T
  record: T
  dictionaryCode?: string
}

// 渲染 Switch
export function renderSwitch<T extends { [key: string]: any }>({
  record,
  field,
  callback
}: Omit<RenderOptions<T>, 'permission'>) {
  const handleChange = _.debounce(callback, 500)
  return (
    <Switch
      modelValue={record[field]}
      checkedValue='ENABLE'
      uncheckedValue='DISABLE'
      onChange={handleChange}
    />
  )
}

// 渲染 Tag
export function renderTag(value: any, dictionaryCode = 'SYS_MSG_STATUS') {
  const find = useFindByDictionary(dictionaryCode, value)
  return <Tag color={find?.color}>{find?.name}</Tag>
}

// 渲染函数
export default function render<T extends { [key: string]: any }>({
  record,
  field,
  callback,
  permission,
  dictionaryCode
}: RenderOptions<T>) {
  if (hasPermission(permission)) {
    return renderSwitch<T>({ record, field, callback })
  }
  return renderTag(record[field], dictionaryCode)
}
