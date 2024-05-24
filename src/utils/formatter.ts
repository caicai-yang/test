type Unit = 'K' | 'M' | 'G'

const BASE = 1024
/**
 * 将文件大小转化为指定单位
 * @param size 文件大小
 * @param unit 转化单位
 * @returns string
 */
export function formatterFileSize(size: number | undefined, unit: Unit = 'K') {
  if (!size || size <= 0) {
    return `${size}${unit}`
  }

  if (unit === 'K') {
    return `${(size / BASE).toFixed(2)}${unit}`
  }

  if (unit === 'M') {
    return `${(size / BASE / BASE).toFixed(2)}${unit}`
  }

  if (unit === 'G') {
    return `${(size / BASE / BASE / BASE).toFixed(2)}${unit}`
  }

  return ''
}

// 去除生产批号的逗号和前后空格
export function removeComma(codeStr: string) {
  if (typeof codeStr !== 'string') {
    return codeStr
  }

  if (!codeStr) {
    return codeStr.trim()
  }

  // 去除空格和中英文逗号
  return codeStr.trim().replace(/,/g, '').replace(/，/g, '')
}
