## 该组件在模块中以 <Table /> 使用（推荐使用该组件）

1. <Table /> 组件使用了vxe-table插件
功能模块中使用到表格，推荐使用<Table />组件，提高页面的渲染和交互速度

2. 系统中的功能模块，表格原本使用的是 <ArcoTable />组件
<ArcoTable />组件使用arco-design的 <a-table />，页面数据量较一般时，
操作性能也较好，但若数据量较大时，界面切换和操作中会有视觉延迟，
为了优化页面渲染性能，加了 <Table />组件，新模块中，推荐使用 <Table /> 组件

3. tips: <Table /> 中有部分列使用fixed属性时，若需要在表格中显示总结行，
则当页面宽度小于表格宽度时（即此时有横向滚动条，同时有固定列不滚动），这时纵向
滚动会出现固定列与非固定列位置不完全匹配问题。
所以表格高度较大的，且使用总结行的情况下，若滚动位置效果不理想时，建议可以继续使用 <Table /> 组件
