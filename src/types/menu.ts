// 菜单详情

import { IEnabled } from './common'

export type IMenuDetail = {
  id: number
  code: string
  name: string
  parentCode: string
  icon: string
  route: string
  enabled: IEnabled
  priority: number
  routeName: string
  cached: IEnabled
  createTime: string
  parentEnabled: IEnabled
  children: IMenuDetail[]
}

export type IMenuList = IMenuDetail[]

export interface CreateMenu {
  code: string
  name: string
  parentCode: string
  type: string
  icon?: string
  route?: string
  enabled: IEnabled
  priority: number
  routeName?: string
  componentPath?: string
  externalLink?: string
  cached?: IEnabled
}

export interface UpdateMenu extends CreateMenu {
  id: number
}
