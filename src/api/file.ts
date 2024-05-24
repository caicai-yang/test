import request from '@/utils/request'

const basePath = '/file'

export const FileApi = {
  uploadFile(data: FormData) {
    return request.post(basePath + '/upload', data)
  },
  // 下载文件流
  downloadFile(fileId: string) {
    return request({
      url: basePath + '/download',
      method: 'post',
      responseType: 'blob',
      data: { fileId }
    })
  }
}
