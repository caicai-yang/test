import request from '@/utils/request'
import {
  ICreateUser,
  IUpdateUser,
  ITransferAuth,
  IBatchExportUser,
  IParams,
  IUpdatePersonalInfo
} from '@/types'
import { DOWNLOAD_TIME_OUT } from '@/utils/constant'

const basePath = '/sys/user'

export const UserSettingApi = {
  // 创建用户
  createUser(data: ICreateUser) {
    return request.post(basePath + '/create', data)
  },

  // 查询用户详情
  findUser(params: { id: number }) {
    return request.get(basePath + '/find', { params })
  },

  // 查询用户列表
  getUserList(data: any) {
    return request.post(basePath + '/list', data)
  },

  // 更新用户
  updateUser(data: IUpdateUser) {
    return request.post(basePath + '/update', data)
  },

  // 删除用户
  deleteUser(params: { id: number }) {
    return request.post(basePath + '/delete', null, { params })
  },

  // 批量删除用户
  batchDeleteUser(data: number[]) {
    return request.post(basePath + '/batch-delete', data)
  },

  // 重置密码
  resetPassword(params: { id: number }) {
    return request.post(basePath + '/reset-password', null, { params })
  },

  // 移交用户权限
  transferAuth(data: ITransferAuth) {
    return request.post(basePath + '/transfer-authority', data)
  },

  // 获取批量导入用户模板
  getImportTemplate() {
    return request.get(basePath + '/import-template', { responseType: 'blob' })
  },

  // 批量导入用户
  batchImportUser(data: FormData) {
    return request.post(basePath + '/import', data)
  },

  // 批量导出用户
  batchExportUser(data: IBatchExportUser) {
    return request.post(basePath + '/export', data, {
      responseType: 'blob',
      timeout: DOWNLOAD_TIME_OUT
    })
  },
  // 获取个人中心详情
  getPersonalInfo() {
    return request.get(basePath + '/personal-info')
  },

  getUserLoginLog(data: IParams) {
    return request.post(basePath + '/login-log', data)
  },

  updateUserPassword(data: { oldPassword: string; password: string }) {
    return request.post(basePath + '/password/update', data)
  },

  updatePersonalInfo(data: IUpdatePersonalInfo) {
    return request.post(basePath + '/personal-info/update', data)
  }
}
