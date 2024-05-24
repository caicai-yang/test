import request from '@/utils/request'
import { GlobalListInterface, IEnabled } from '@/types/common'
import { ICreateOrg, IUpdateOrg } from '@/types'

const basePath = '/sys/org'

type OrgListOptions = GlobalListInterface & {
  parentId: number
}

export const OrgStructureApi = {
  // 获取组织架构树
  getOrgTree(params?: { keyword?: string; enabled?: IEnabled }) {
    return request.get(basePath + '/tree', { params })
  },
  // 新建组织
  createOrg(data: ICreateOrg) {
    return request.post(basePath + '/create', data)
  },
  // 获取组织机构详情
  findOrg(params: { id: number }) {
    return request.get(basePath + '/find', { params })
  },
  // 获取组织架构列表
  getOrgList(data: OrgListOptions) {
    return request.post(basePath + '/list', data)
  },
  // 更新组织
  updateOrg(data: IUpdateOrg) {
    return request.post(basePath + '/update', data)
  },
  // 删除组织
  deleteOrg(params: { id: number }) {
    return request.post(basePath + '/delete', null, { params })
  },
  // 批量删除组织
  batchDeleteOrg(data: number[]) {
    return request.post(basePath + '/batch-delete', data)
  }
}
