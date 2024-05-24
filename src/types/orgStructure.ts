import { IEnabled } from './common'

type IOrgBase = {
  code: string
  name: string
  parentId: number
  enabled: IEnabled
}

export type ICreateOrg = IOrgBase & {
  priority: number
  type: string
  attribute: string
  director: string
  comment: string
}

export type IUpdateOrg = ICreateOrg & {
  id: number
}

export type IOrgTreeItem = IOrgBase & {
  id: number
  parentEnabled: IEnabled
  parentNames: string
  parentIds: number[]
  children: IOrgTreeItem[]
}

export type IOrgTree = IOrgTreeItem[]

export type IOrgDetail = IUpdateOrg & {
  parentNames: string
}

export type IOrgListItem = IUpdateOrg & {
  createByUser: string
  createTime: string
}

export type IOrgList = IOrgListItem[]
