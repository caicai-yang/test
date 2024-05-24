import { DeviceType } from '@/store/types'

export const projectName = 'CCTC'

export default {
  theme: 'standardBlue',
  sideTheme: 'white',
  themeColor: '#165dff',
  projectName,
  layoutMode: 'ttb',
  sideWidth: 210,
  pageAnim: '',
  isFixedNavBar: true,
  deviceType: DeviceType.PC,
  isCollapse: false,
  actionBar: {
    isShowSearch: true,
    isShowMessage: true,
    isShowRefresh: true,
    isShowFullScreen: true
  }
}
