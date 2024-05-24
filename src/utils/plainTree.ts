type TreeMapNames = {
  [key: string]: string
}

type TreeDataItem = {
  id: number
  name: string
  code: string
  children: TreeDataItem[]
}

type TreeMapChildren = {
  [key: string]: { code: string; hasChildren: boolean }
}

/**
 * 拼接名称
 * @param data 树数据
 * @param parentName
 * @returns {id: parentsName}
 */
export function plainTreeNames(data: TreeDataItem[], parentName = '') {
  let map: TreeMapNames = {}
  if (!data || !data.length) {
    return
  }
  data.forEach(item => {
    const { id, name, children } = item
    map[id] = parentName ? `${parentName}/${name}` : name
    if (children && children.length) {
      map = { ...map, ...plainTreeNames(children, map[id]) }
    }
  })
  return map
}

/**
 * @param data 树
 * @returns {id: {code, hasChildren}}
 */
export function plainTreeChildren(data: TreeDataItem[]) {
  let map: TreeMapChildren = {}
  if (!data || !data.length) {
    return {}
  }
  data.forEach(item => {
    const { id, code, children } = item
    const hasChildren = !!(children && children.length)
    map[id ?? code] = { code, hasChildren }
    map = { ...map, ...plainTreeChildren(children) }
  })
  return map
}

export function getExpandAndSelectKeysByTree(
  data: TreeDataItem[],
  keyField: 'id' | 'code' | string = 'id'
): {
  expandKeys: (string | number)[]
  selectKeys: (string | number)[]
} {
  const map = plainTreeChildren(data)
  const expandKeys = []
  const selectKeys = []
  for (const key in map) {
    const { code, hasChildren } = map[key]
    const value = keyField === 'id' ? +key : code
    hasChildren && expandKeys.push(value)
    selectKeys.push(value)
  }

  return {
    expandKeys,
    selectKeys
  }
}

/**
 * 深度遍历节点映射, 保证 id 顺序
 * @param {id: [childId]}
 */
export function mapKeys(data: any[], fieldKeys = 'id') {
  let map: any = {}
  data.forEach(item => {
    map['_' + item[fieldKeys]] = []

    if (item.children && item.children.length) {
      item.children.forEach((sub: any) => {
        map['_' + item[fieldKeys]].push(sub[fieldKeys])
        map = { ...map, ...mapKeys(item.children, fieldKeys) }
      })
    }
  })
  return map
}

/**
 * 扁平化
 * @param data
 */
export function flatByChildren(data: any[]) {
  let list: any[] = []
  data.forEach(({ children, ...item }) => {
    list.push(item)
    if (children && children.length) {
      list = [...list, ...flatByChildren(children)]
    }
  })
  return list
}
