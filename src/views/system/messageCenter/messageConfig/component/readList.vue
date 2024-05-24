<template>
  <a-modal
    :visible="visible"
    :title="title"
    title-align="start"
    width="800px"
    :mask-closable="false"
    hide-cancel
    ok-text="关闭"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <Table :columns="tableHeader" :data="tableList" :show-footer="false" />
  </a-modal>
</template>

<script setup name="ReadList" lang="ts">
  import { getReadList } from '@/api/system/messageConfig'
  import { ref, watch } from 'vue'
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '查看已阅日志'
    },
    configId: {
      type: [String, Number],
      default: 0
    },
    userId: {
      type: Number,
      default: 0
    }
  })

  watch(
    () => props.visible,
    val => {
      if (val) {
        getList()
      }
    }
  )

  const emits = defineEmits(['update:visible'])

  const tableHeader = ref([
    {
      title: '用户账号',
      dataIndex: 'username'
    },
    {
      title: '用户名称',
      dataIndex: 'userFullName'
    },
    {
      title: '消息ID',
      dataIndex: 'id'
    },
    {
      title: '推送时间',
      dataIndex: 'sendStartTime'
    },
    {
      title: '是否确认已阅',
      dataIndex: 'haveRead',
      render: ({ record }: { record: any }) => {
        if (record.haveRead) {
          return '是'
        }
        return '否'
      }
    },
    {
      title: '已阅时间',
      dataIndex: 'readTime'
    }
  ])

  const tableList = ref([])

  function getList() {
    const params = {
      configId: props.configId,
      userId: props.userId
    }
    getReadList(params).then(res => {
      tableList.value = res.list
    })
  }
  function handleCancel() {
    emits('update:visible', false)
  }

  function handleOk() {
    handleCancel()
  }
</script>
