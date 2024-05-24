import { IEnabled } from '@/types/common'
import request from '@/utils/request'
import { CreateMenu, UpdateMenu } from '@/types/menu'

const basePath = '/sys/menu'

export const MenuSettingApi = {
  getMenuList(params: { enabled?: IEnabled }) {
    return request.post(basePath + '/list', null, { params })
  }
}

// 获取菜单列表
export function getMenuList(params?: { enabled?: IEnabled | '' }) {
  return request.post(basePath + '/list', null, { params })
}

// 获取菜单列表
export function createMenu(data: CreateMenu) {
  return request({
    url: basePath + '/create',
    method: 'post',
    data
  })
}

// 获取菜单列表
export function updateMenu(data: UpdateMenu) {
  return request({
    url: basePath + '/update',
    method: 'post',
    data
  })
}

// 获取菜单列表
export function findMenuById(params: { id: number }) {
  return request({
    url: basePath + '/find',
    method: 'get',
    params
  })
}

// 删除菜单
export function deleteMenu(id: number) {
  return request({
    url: `${basePath}/delete?id=${id}`,
    method: 'post'
  })
}

// 查询菜单树状列表
export function getMenuTree(params?: { enabled?: IEnabled; keyword?: string }) {
  return request.get(basePath + '/tree', { params })
}
