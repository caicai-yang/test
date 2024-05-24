import request from '@/utils/request'
import { ICreateRole, IUpdateRole } from '@/types'
import { IEnabled } from '@/types/common'

const basePath = '/sys/role'

export const RoleSettingApi = {
  createRole(data: ICreateRole) {
    return request.post(basePath + '/create', data)
  },

  findRole(params: { id: number }) {
    return request.get(basePath + '/find', { params })
  },

  getRoleList(params: { enabled: IEnabled | '' }) {
    return request.post(basePath + '/list', null, { params })
  },

  updateRole(data: IUpdateRole) {
    return request.post(basePath + '/update', data)
  },

  deleteRole(params: { id: number }) {
    return request.post(basePath + '/delete', null, { params })
  },

  batchDeleteRole(data: number[]) {
    return request.post(basePath + '/batch-delete', data)
  },

  getRoleTree(params?: { keyword?: string; enabled: IEnabled }) {
    return request.get(basePath + '/tree', { params })
  },

  // 查询角色用户列表
  getRoleUserList(data: { currentPage: number; pageSize: number; roleId: number }) {
    return request.post(basePath + '/user', data)
  },

  // 解绑角色用户
  unlinkRole(params: { roleId: number; userId: number }) {
    return request.post(basePath + '/user/unlink', null, { params })
  }
}
