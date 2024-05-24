import { IParams, IEnabled } from '@/types'

type IUserBase = {
  username: string
  name: string
  mobile: string
  enabled: IEnabled
  orgId: number
  comment: string
}

export type ICreateUser = IUserBase & {
  sex: string
  post: string
  validDate: string
  roleIds: number[]
}

export type IUpdateUser = IUserBase & {
  id: number
}

export type IUserDetail = ICreateUser & {
  id: number
  orgName: string
}

export type IUserListItem = IUserBase & {
  id: number
  createByUser: string
  createTime: string
  orgName: string
}

export type IUserList = IUserListItem[]

export type ITransferAuth = {
  id: number
  username: string
  name: string
  roleIds: number[]
}

export type IUserListParams = IParams & { enabled: IEnabled | '' }
export type IUserListParamsByRole = IUserListParams & { roleId: number }
export type IUserListParamsByOrg = IUserListParams & { orgId: number }
export type IBatchExportUser = (IUserListParamsByRole | IUserListParamsByOrg) & {
  noPage: IEnabled
}

export type IPersonalInfo = {
  avatar: string
  createTime: string
  id: number
  mobile: string
  name: string // 名称
  orgId: number
  orgName: string
  post: string
  sex: string
  username: string // 工号
  validDate: string
}

export interface IUpdatePersonalInfo {
  id: number | string
  name: string
  mobile?: string
  sex?: string
  avatar?: string
}

// 下载事件
export type IEvent = {
  eventId: string // 事件唯一id
  title: string // 下载内容标题
  process: number // 下载进度
  url: string // 下载完成后的 url
}

// websocket下载内容
export type IDownloadEvent = {
  // 事件唯一id
  [key: string]: IEvent
}
