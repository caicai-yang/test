// 密码正则: 8-20位且至少包含大写字母、小写字母、数字、符号中的三种
export const passwordReg =
  /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)([^\u4e00-\u9fa5\s]){8,20}$/

// 手机号码正则
export const phoneReg =
  /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/

// 浮点数: 13位整数, 3位小数
export const double3Reg = /^(0|[1-9]\d{0,12})(\.\d{0,3})?/

export const strictDouble3Reg = /^(0|[1-9]\d{0,12})(\.\d{0,3})?$/
// 0或正整数
export const integerReg = /^(0|[1-9]\d*)/
// 正整数
export const positiveIntegerReg = /^[1-9]\d*/

interface ValidatorOptions {
  name?: string // label
  isRequired?: boolean // 是否必填
  isPassword?: boolean // 是否为密码
  isPhone?: boolean // 是否为手机号
}

export default function validator({
  name = '',
  isRequired = true,
  isPhone = false,
  isPassword = false
}: ValidatorOptions = {}) {
  return (value: any = '', callback: any) => {
    const _value = (value + '').trim()
    if (isRequired && !_value) {
      return callback(`请输入${name}`)
    }
    if (isPhone && _value && !phoneReg.test(_value)) {
      return callback('请输入正确的手机号码')
    }
    if (isPassword && _value && !passwordReg.test(_value)) {
      return callback('8-20位且至少包含大写字母、小写字母、数字、符号中的三种')
    }
    return callback()
  }
}

// 生产批次规则
export const batchNoRules = [
  { required: true, message: '请输入生产批号' },
  {
    validator(value: any, callback: any) {
      if (value.includes(' ')) {
        return callback('请正确输入生产批号')
      }
      return callback()
    }
  }
]

// 批次数量规则
export const batchNumRules = [
  { required: true, message: '请输入批次数量' },
  {
    validator(value: any, callback: any) {
      if (!strictDouble3Reg.test(value)) {
        return callback('请正确输入批次数量')
      }
      return callback()
    }
  }
]
