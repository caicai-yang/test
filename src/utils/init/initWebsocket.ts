import socket from '../websocket'
import useUserStore from '@/store/modules/user'

type IMessage = {
  event: string // 事件类型
  eventId: string // 事件唯一标识，同一事件的消息都会使用同一个事件标识，例如导出abc.xlsx文件的进度消息都会使用同一个事件标识
  title: string // 事件标题
  // 特殊参数
  params: {
    msgUnreadNum: number // 未读消息
    progress: number // 导出进度
    downloadUrl: string // 导出完成地址
    [key: string]: string | number
  }
}

type IData = {
  event: string // 事件类型
  message: IMessage
}

export default function () {
  const userStore = useUserStore()
  socket.init((message: any) => {
    if (!message || !message.data) {
      return
    }
    const data = JSON.parse(message.data) as IData
    if (data.event === 'LOGIN_RES') {
      console.log('websocket连接成功')
    } else if (data.event === 'INDEX') {
      // 主页消息
      const unreadNum = data.message?.params?.msgUnreadNum || 0
      userStore.setUnreadMessageNum(unreadNum)
    } else if (data.event === 'EXCEL_EXPORT_PROGRESS') {
      // EXCEL导出中
      const { eventId, title, params } = data.message
      userStore.updateDownloadEvent({
        eventId,
        title,
        process: params.progress,
        url: ''
      })
    } else if (data.event === 'EXCEL_EXPORT_FINISH') {
      // EXCEL导出完成
      const { eventId, title, params } = data.message
      userStore.updateDownloadEvent({
        eventId,
        title,
        process: 1,
        url: params.downloadUrl
      })
    }
  })
}
