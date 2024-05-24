import { IEnabled } from './common'

type IRoleBase = {
  id: number
  code: string // 备注
  name: string // 名称
  parentId: number // 父级id
  enabled: IEnabled // 是否启用
  priority: number // 显示排序
  comment: string // 备注
  parentNames?: string
}

// 角色详情
export type IRoleDetail = IRoleBase & {
  menuIds: string[] // 菜单权限列表
  orgIds: number[] // 组织权限列表
  parentNames: string // 所有父级名称
}

// 新建角色
export type ICreateRole = Omit<IRoleDetail, 'parentNames'>

export type IUpdateRole = ICreateRole & { id: number }

export type IRoleItem = IRoleBase & {
  createByUser: string
  createTime: string
  children: IRoleItem[]
}

// 角色列表
export type IRoleList = IRoleItem[]

// 角色树
export type IRoleTreeItem = {
  id: number
  name: string
  parentId: number
  children: IRoleTreeItem[]
}

export type IRoleTree = IRoleTreeItem[]
