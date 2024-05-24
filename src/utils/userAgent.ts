const userAgent = navigator.userAgent.toLowerCase()

function isBrowseType(type: string): boolean {
  return userAgent.includes(type)
}

export const IS_MOBILE =
  /(Android|webOS|iPhone|iPad|iPod|SymbianOS|BlackBerry|Windows Phone)/i.test(userAgent)

export const IS_FIREFOX = isBrowseType('firefox')

export const IS_MAC = /macintosh|mac os x/i.test(userAgent)
