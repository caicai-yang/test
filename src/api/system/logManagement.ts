import request from '@/utils/request'
import { IParams } from '@/types'

const basePath = '/sys/audit-log'

export const LogManagementApi = {
  // 获取操作日志列表
  getAuditLogList(data: IParams) {
    return request.post(basePath + '/list', data)
  },

  // 操作日志详情
  getAuditLogDetail(params: { id: number }) {
    return request.get(basePath + '/find', { params })
  },

  // 登录日志列表
  getLoginLogList(data: IParams) {
    return request.post('/sys/login-log/list', data)
  }
}
