// 操作状态 1 成功 0 失败
type IOperationStatus = 0 | 1

export type IAuditLogItem = {
  id: number
  operator: string
  operatorUser: string
  operationTime: string // 操作时间
  operationStatus: IOperationStatus
  operation: string // 操作内容
  method: string // 请求方式
  clientIp: string // 客户端IP
}

export type IAuditLogList = IAuditLogItem[]

export type IAuditLogDetail = IAuditLogItem & {
  operationMethod: string // 	操作方法
  operationType: string // 	操作类型
  url: string // 	请求地址
  parameter: string // 	请求参数
  result: string // 	返回结果
  errorMsg: string // 	异常信息
  clientIpLocation: string // 	客户端IP位置
}

export type ILoginLogItem = {
  id: number // 日志ID
  username: string // 用户名
  loginIp: string // 登录IP
  loginLocation: string // 登录位置
  browser: string // 浏览器
  os: string // 操作系统
  status: IOperationStatus // 登录状态
  msg: string // 描述(多语言 key)
  createTime: string // 操作时间
}

export type ILoginLogList = ILoginLogItem[]
