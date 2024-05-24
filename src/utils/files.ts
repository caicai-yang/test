import { FileApi } from '@/api'
import useFilesStore from '@/store/modules/files'
import { Message } from '@arco-design/web-vue'

// 把url转为a标签下载
function saveByFileUrl(url: string, filename: string) {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function XMLHttpDownload(fileId: string, filename: string) {
  const xHttp = new XMLHttpRequest()
  xHttp.open('GET', fileId, true)
  xHttp.responseType = 'blob'
  xHttp.onload = () => {
    download(xHttp.response, filename)
  }
  xHttp.send()
}

/**
 * 下载二进制数据
 * @param data 二进制数据
 */
export function download(data: any, filename: string) {
  const url = window.URL.createObjectURL(new Blob([data]))
  saveByFileUrl(url, filename)
}

/**
 * 通过fileId下载文件
 * @param fileId { 文件id }
 * @param filename { 指定的文件名称，必须包含文件后缀 }
 * @returns
 */
export function downloadByFileId(fileId: string, filename: string) {
  // fileId为完整路劲，则直接打开路劲下载
  if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
    const type = fileId.substring(fileId.lastIndexOf('.') + 1)
    // 下载图片
    if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
      const img = new Image()
      img.setAttribute('crossOrigin', 'anonymous')
      img.src = fileId
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.height = img.height
        canvas.width = img.width
        const canvasContext = canvas.getContext('2d')
        canvasContext?.drawImage(img, 0, 0, img.width, img.height)
        const url = canvas.toDataURL('image/jpeg', 1)
        saveByFileUrl(url, filename)
      }
    } else {
      // 下载PDF、word等文件
      XMLHttpDownload(fileId, filename)
    }
    return
  }
  FileApi.downloadFile(fileId).then(blob => {
    download(blob, filename)
  })
}

/**
 * 通过fileId查看文件
 * @param fileId { 文件id }
 * @param filename { 指定的文件名称，必须包含文件后缀 } 如果不传则使用服务器文件名称（默认）
 */
export async function previewFile(fileId: string, filename?: string) {
  const filesStore = useFilesStore()
  let fileUrl = ''

  // fileId为完整路劲
  if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
    fileUrl = fileId
  } else if (filesStore.getKey(fileId)) {
    fileUrl = filesStore.getKey(fileId)
  } else {
    const res: any = await FileApi.getFileUrlByFileId({ fileId })
    if (!res || !res.url) {
      return Message.error('该文件路径错误，无法查看')
    }
    filesStore.saveFileUrl(fileId, res.url)
    fileUrl = res.url
  }

  // 获取url类型，兼容接口返回的url带有参数的情况
  const _fileUrl = fileUrl.split('?')[0]
  const type = _fileUrl.substring(_fileUrl.lastIndexOf('.') + 1)

  // TODO: 目前只有word文件为处理名称后直接下载，若有其他文件类型也需要做此处理，则把类型加到判断中
  // 如果是word文档，且有自定义名称，则重命名后下载word文件
  if (['doc', 'docx'].includes(type) && filename) {
    XMLHttpDownload(fileUrl, filename)
  } else {
    window.open(fileUrl, '_blank')
  }
}
