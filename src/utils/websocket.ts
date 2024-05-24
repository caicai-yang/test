import type { Socket } from '@/types/socket'
import useUserStore from '@/store/modules/user'

const socket: Socket = {
  ws: null, // websocket 实例
  // connectURL: import.meta.env.VITE_WS_HOST,
  connectURL: '192.168.14.16',
  connectPort: '8200',
  // 开启标识
  socketOpen: false,
  // 心跳timer
  hearBeatTimer: null,
  // 心跳发送频率
  hearBeatInterval: 10 * 60 * 1000, // 10分钟
  // 是否自动重连
  isReconnect: true,
  // 已发起重连次数
  reconnectCurrent: 0,
  // 重连timer
  reconnectTimer: null,
  // 重连频率
  reconnectInterval: 5 * 1000,

  /**
   * 初始化
   * @param receiveMessage { 接收消息回调函数 }
   * @param maxReconnectCount { 最大重连次数 }
   * @returns void
   */
  init: (receiveMessage: Function | null, maxReconnectCount: number | null) => {
    if (!('WebSocket' in window)) {
      console.log('浏览器不支持WebSocket')
      return null
    }
    // websocket已连接成功
    if (socket.ws?.readyState === 1) {
      return
    }
    socket.ws = new WebSocket('ws://' + socket.connectURL + ':' + socket.connectPort + '/ws')
    socket.ws.onmessage = (e: any) => {
      if (receiveMessage) {
        receiveMessage(e)
      }
    }
    socket.ws.onclose = () => {
      socket.socketOpen = false
      // 需要重新连接
      if (socket.isReconnect) {
        socket.reconnectTimer = setTimeout(() => {
          // 已正常连接，无需重连
          if (socket.ws.readyState === 1) {
            clearTimeout(socket.reconnectTimer)
            return
          }
          // 超过重连次数
          if (
            maxReconnectCount &&
            maxReconnectCount > 0 &&
            socket.reconnectCurrent > maxReconnectCount
          ) {
            clearTimeout(socket.reconnectTimer)
            return
          }
          console.log('重新连接...')
          // 记录重连次数
          socket.reconnectCurrent++
          socket.reconnect(receiveMessage, maxReconnectCount)
        }, socket.reconnectInterval)
      }
    }
    // 连接成功
    socket.ws.onopen = async () => {
      const userStore = useUserStore()
      const user = (await userStore.getUser()) as any
      socket.socketOpen = true
      socket.isReconnect = true
      // 发送连接
      const data = {
        event: 'LOGIN',
        message: {
          userId: user.id
        }
      }
      socket.send(data)
      // 开启心跳
      socket.heartbeat()
    }
    // 连接发生错误
    socket.ws.onerror = (error: any) => {
      console.log('error:', error)
    }
  },

  // 心跳监听
  heartbeat: () => {
    socket.hearBeatTimer && clearInterval(socket.hearBeatTimer)

    socket.hearBeatTimer = setInterval(() => {
      const data = {
        event: 'PING',
        message: {}
      }
      socket.send(data)
    }, socket.hearBeatInterval)
  },

  // 建立连接
  send: (data: Object, callback: Function) => {
    // 开启状态直接发送
    if (socket.ws.readyState === socket.ws.OPEN) {
      socket.ws.send(JSON.stringify(data))
      callback && callback()
    } else {
      clearInterval(socket.hearBeatTimer)
      console.log('websocket连接已断开')
    }
  },

  // 关闭连接
  close: () => {
    socket.isReconnect = false
    socket.ws && socket.ws.close()
  },

  // 重新连接
  reconnect: (receiveMessage: Function | null, maxReconnectCount: number | null) => {
    if (socket.ws && !socket.isReconnect) {
      socket.close()
    }
    socket.init(receiveMessage, maxReconnectCount)
  }
}

export default socket
