import { Ref, UnwrapRef } from 'vue'
import { RouteRecordRaw } from 'vue-router'
import { Dictionary } from '@/types/common'

export interface UserState {
  id?: number | string
  username?: string
  name?: string
  mobile?: string
  orgId?: number | string
  avatar?: string
  sex?: string
  post?: string
  createTime?: string
  orgName?: string
  validDate?: string
  [key: string]: any
}

export interface THeaderKeysState {
  key: string
  value: string
}

export interface THeaderState {
  key: string
  value: Array<any>
}

export interface DictionaryState {
  [key: string]: Array<Dictionary>
}

export enum LayoutMode {
  LTR = 'ltr',
  LCR = 'lcr',
  TTB = 'ttb'
}

export enum DeviceType {
  PC = 'pc',
  PAD = 'pad',
  MOBILE = 'mobile'
}

export enum ThemeMode {
  STANDARD_BLUE = 'standardBlue',
  LIGHT = 'light',
  DARK = 'dark'
}

export enum SideTheme {
  DARK = 'dark',
  WHITE = 'white',
  BLUE = 'blue',
  IMAGE = 'image'
}

export enum PageAnim {
  FADE = 'fade',
  OPACITY = 'opacity',
  DOWN = 'down',
  SCALE = 'scale'
}

export interface AppConfigState {
  projectName: string
  theme: ThemeMode
  sideTheme: SideTheme
  themeColor: string
  layoutMode: LayoutMode
  deviceType: DeviceType
  sideWidth: number
  pageAnim: PageAnim
  isFixedNavBar: boolean
  isCollapse: boolean
  actionBar: {
    isShowSearch: boolean
    isShowMessage: boolean
    isShowRefresh: boolean
    isShowFullScreen: boolean
  }
}

export interface MenuOption {
  key: string | undefined
  label: string | undefined
  icon: string | undefined
  children: Array<MenuOption> | null
}

export interface SplitTab {
  label: string
  iconPrefix?: string | unknown
  icon: string
  fullPath: string
  children?: Array<RouteRecordRaw>
  checked: Ref<UnwrapRef<boolean>>
}

export interface OriginRoute {
  id?: number
  parentCode?: string
  name: string
  code?: string
  isRootPath?: boolean
  iconPrefix?: string
  affix?: string
  badge?: string | number
  isSingle?: boolean
  route: string
  routeName: string
  componentPath: string
  hidden?: boolean
  type?: number
  icon?: string
  externalLink?: string
  cached?: boolean
  tableName?: string
  children?: Array<OriginRoute>
}
