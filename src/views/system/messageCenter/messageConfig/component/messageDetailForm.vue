<template>
  <a-card :bordered="false">
    <ContentTitle title="消息详情" />
    <a-form
      ref="formRef"
      class="custom-item-width"
      :model="formData"
      :rules="isRead ? {} : rules"
      :disabled="isRead"
      layout="inline"
    >
      <a-form-item label="消息编号:">
        <a-input v-model="formData.code" placeholder="系统自动生成" disabled size="large" />
      </a-form-item>
      <a-form-item field="name" label="消息名称:">
        <a-input
          v-model="formData.name"
          placeholder="请输入消息名称"
          :max-length="50"
          :disabled="isDisabled"
          size="large"
        />
      </a-form-item>
      <a-form-item field="sendChannel" label="发送渠道:">
        <a-select
          v-model="formData.sendChannel"
          placeholder="请选择发送渠道"
          size="large"
          :disabled="isDisabled"
        >
          <a-option
            v-for="item of msgSendChannel"
            :key="(item.value as number) + 1"
            :value="item.value"
            :label="item.name"
          />
        </a-select>
      </a-form-item>
      <a-form-item field="type" label="消息类型:">
        <a-select
          v-model="formData.type"
          placeholder="请选择消息类型"
          size="large"
          :disabled="isDisabled"
        >
          <a-option
            v-for="item of msgTypes"
            :key="(item.value as number) + 1"
            :value="item.value"
            :label="item.name"
          />
        </a-select>
      </a-form-item>
      <a-form-item field="level" label="消息优先级:">
        <a-select
          v-model="formData.level"
          placeholder="请选择消息优先级"
          size="large"
          :disabled="isDisabled"
        >
          <a-option
            v-for="item of msgLevels"
            :key="(item.value as number) + 1"
            :value="item.value"
            :label="item.name"
          />
        </a-select>
      </a-form-item>
      <a-form-item label="消息描述:">
        <a-input
          v-model="formData.description"
          placeholder="请输入消息描述"
          size="large"
          :max-length="200"
        />
      </a-form-item>
      <a-form-item field="confirmRead" label="是否确认已阅:">
        <a-select v-model="formData.confirmRead" placeholder="请选择是否确认已阅" size="large">
          <a-option :value="1">是</a-option>
          <a-option :value="0">否</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="sendNow" label="立即发送:">
        <a-select
          v-model="formData.sendNow"
          placeholder="请选择发送类型"
          size="large"
          :disabled="isDisabled"
          @change="sendTypeChange"
        >
          <a-option :value="1">是</a-option>
          <a-option :value="0">定时发送</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="sendToAll" label="是否推送所有用户:">
        <a-select
          v-model="formData.sendToAll"
          placeholder="请选择是否推送所有用户"
          size="large"
          @change="allPersonChange"
        >
          <a-option :value="1">是</a-option>
          <a-option :value="0">否</a-option>
        </a-select>
      </a-form-item>
      <template v-if="formData.sendNow !== 1">
        <a-form-item field="sendStartTime" label="推送开始时间">
          <a-date-picker
            v-model="formData.sendStartTime"
            show-time
            placeholder="请输入推送开始时间"
            size="large"
            :disabled="isDisabled"
          />
        </a-form-item>
        <a-form-item label="重复发送:">
          <a-input-group>
            <a-input-number
              v-model="formData.sendIntervalNum"
              v-enter:3.number
              size="large"
              placeholder="请输入发送间隔周期"
              :min="0"
            />
            <a-select v-model="formData.sendTimeUnit" size="large" style="width: 80px">
              <a-option
                v-for="item of timeUnits"
                :key="(item.value as number) + 1"
                :value="item.value"
                :label="item.name"
              />
            </a-select>
          </a-input-group>
        </a-form-item>
        <a-form-item v-if="formData.sendIntervalNum" label="推送结束时间">
          <a-date-picker
            v-model="formData.sendEndTime"
            show-time
            placeholder="请输入推送结束时间"
            size="large"
          />
        </a-form-item>
      </template>
    </a-form>
  </a-card>
</template>

<script setup name="topMessageDetail" lang="ts">
  import { Message } from '@arco-design/web-vue'
  import { useRoute } from 'vue-router'
  import { toRef, getCurrentInstance, computed } from 'vue'
  import type { PropType } from 'vue'
  import { useDictionary } from '@/hooks/useDictionary'

  const props = defineProps({
    data: {
      type: Object as PropType<{ [props: string]: any }>,
      default: () => {}
    },
    isRead: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['allPersonChange'])
  const route = useRoute()

  // 编辑时表单禁用
  const isDisabled = computed(() => {
    return route.params.type === 'isEdit'
  })

  const rules = computed(() => {
    const defaultRules = {
      name: [{ required: true, message: '请输入消息名称' }],
      sendChannel: [{ required: true, message: '请选择发送渠道' }],
      type: [{ required: true, message: '请选择消息类型' }],
      level: [{ required: true, message: '请选择消息优先级' }],
      confirmRead: [{ required: true, message: '请选择是否确定已阅' }],
      sendNow: [{ required: true, message: '请选择发送类型' }],
      sendToAll: [{ required: true, message: '请选择是否推送所有用户' }],
      sendStartTime: []
    }
    if (formData.value.sendNow === 0) {
      defaultRules.sendStartTime = [{ required: true, message: '请选择推送开始时间' }] as any
    } else {
      defaultRules.sendStartTime = []
      proxy.$refs.formRef && proxy.$refs.formRef.clearValidate('sendStartTime')
    }
    return defaultRules
  })

  const formData: { [props: string]: any } = toRef(props, 'data')

  function allPersonChange(val: any) {
    emit('allPersonChange', val)
  }

  const { proxy } = getCurrentInstance() as any

  const msgSendChannel = useDictionary('SYS_MSG_SEND_CHANNEL')
  const msgTypes = useDictionary('SYS_MSG_TYPE')
  const msgLevels = useDictionary('SYS_MSG_LEVEL')
  const timeUnits = useDictionary('SYS_MSG_TIME_UNIT')

  // 发送类型切换
  function sendTypeChange(val: string | number | Record<string, any>) {
    // 立即发送
    if (val === 1) {
      // 清空这几个数据
      formData.value.sendStartTime = ''
      formData.value.sendIntervalNum = ''
      formData.value.sendTimeUnit = ''
      formData.value.sendIntervalNum = ''
    }
  }

  async function validateForm() {
    // 校验表单是否填写完毕
    const result = await proxy.$refs.formRef.validate((valid: any) => valid)
    if (result) {
      Message.warning('请填写详情信息')
      return false
    }
    return true
  }
  defineExpose({
    validateForm
  })
</script>

<style lang="less" scoped>
  .topTittle {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
</style>
