<template>
  <div class="cm-table">
    <!-- 筛选区 -->
    <section
      v-if="filterFormOptions.length > 0"
      class="table-filter"
    >
      <CommonForm
        ref="filterForm"
        form-wrap="nowrap"
        :form-data="filterFormData"
        :form-configs="filterFormOptions"
        form-size="small"
        display="inline"
        label-position="right"
        :label-width="filterFormLabelWidth"
        :show-close="false"
        :show-submit="false"
        class="form-group"
      />
      <div
        class="button-group"
        :style="{marginLeft:filterFormLabelWidth}"
      >
        <el-button
          type="primary"
          size="small"
          @click="search()"
        >
          search
        </el-button>
        <el-button
          type="text"
          size="small"
          @click="reset()"
        >
          reset
        </el-button>
      </div>
    </section>

    <!-- 表格区 -->
    <el-table
      id="cmTable"
      ref="cmTable"
      :key="index"
      v-loading="loading"
      class="cm-table-border"
      :border="false"
      :data="tableData"
      :max-height="mHeight"
      :stripe="stripe"
      :header-cell-class-name="headerCellClassName"
      :cell-class-name="cellClassName"
      :cell-style="cellStyle"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortchange"
      @select="handleSelect"
      @select-all="handleSelectAll"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="selectionColumn"
        type="selection"
        fixed="left"
        width="55"
      />
      <!-- 序号列 -->
      <el-table-column
        v-if="indexColumn"
        type="index"
        label="No."
        align="left"
        fixed="left"
      />
      <!-- 各项数据列 -->
      <template v-for="column in columns.filter(item => !item.hidden)">
        <el-table-column
          :key="column.key || column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :align="column.align"
          :sortable="column.sortable?column.sortable:false"
          :fixed="column.fixed"
          :class-name="column.className || null"
        >
          <!-- 表头 slot -->
          <template
            slot="header"
            slot-scope="{ row }"
          >
            <slot
              :name="`${column.prop || column.key}-header`"
              :row="row"
            >
              <div
                v-if="column.renderHeader"
                style="padding: 0;line-height: 23px"
                v-html="column.renderHeader()"
              />
              <template v-else>{{ column.label || column.prop }}</template>
            </slot>
          </template>
          <!-- default slot -->
          <template slot-scope="{ row, $index }">
            <slot
              :name="column.prop || column.key"
              :row="row"
              :$index="$index"
            >
              <template>
                <!-- 头像 -->
                <img
                  v-if="column.displayType === 'avator'"
                  :src="row[column.prop] || defaultAvator"
                  class="cm-col-avator"
                >
                <!-- 封面图片 -->
                <div
                  v-else-if="column.displayType === 'imageList'"
                  class="cm-col-cover"
                >
                  <img
                    :src="row[column.prop][0]"
                  >
                  <div
                    v-if="row[column.prop].length > 1"
                    class="mask"
                  >
                    {{ row[column.prop].length - 1 }}+
                  </div>
                </div>
                <!-- 状态 -->
                <span
                  v-else-if="column.displayType === 'status'"
                  class="cm-col-status"
                  :class="[row[column.prop] ? 'succes-color' : 'danger-color']"
                >
                  {{ column.statusValue[Number(row[column.prop])] || row[column.prop] }}
                </span>
                <!-- 时间 -->
                <p
                  v-else-if="column.displayType === 'time'"
                  class="cm-col-time"
                >
                  <span>
                    {{ row[column.prop] ? dateParse(row[column.prop]).split(' ')[0] : '-' }}
                  </span>
                  <span v-if="row[column.prop]">
                    {{ dateParse(row[column.prop]).split(' ')[1] }}
                  </span>
                </p>
                <!-- 距离天数 -->
                <p
                  v-else-if="column.displayType === 'dateWithDays'"
                  class="cm-col-days"
                >
                  <span>
                    {{ row[column.prop] ? dateParse(row[column.prop]).split(' ')[0] : '-' }}
                  </span>
                  <span v-if="row[column.prop]">
                    ({{ daysToNow(row[column.prop]) }})
                  </span>
                </p>
                <!-- 交互操作 -->
                <span
                  v-else-if="column.displayType === 'operate'"
                  class="cm-col-operate primary-color"
                  @click="$emit(column.operateHandler, row)"
                >
                  {{ row[column.prop] }}
                </span>
                <!-- 文本列表 -->
                <p
                  v-else-if="column.displayType === 'stringList'"
                  class="cm-col-text"
                >
                  {{ row[column.prop].length > 0 ? row[column.prop][0] : '-' }}
                  <el-tooltip
                    v-if="row[column.prop].length > 1"
                    class="item"
                    effect="dark"
                    :content="row[column.prop].join(', ')"
                    placement="right"
                  >
                    <span>
                      ...{{ row[column.prop].length - 1 }}+
                    </span>
                  </el-tooltip>
                </p>
                <!-- 普通文本 -->
                <p
                  v-else-if="column.displayType === 'string'"
                  class="cm-col-text"
                >
                  {{ row[column.prop] || '-' }}
                </p>
              </template>
            </slot>
          </template>
        </el-table-column>
      </template>
      <!-- 操作列 -->
      <el-table-column
        v-if="operateColumns.length > 0"
        align="left"
        label="Operate"
        :width="operateColumnsWidth"
        fixed="right"
      >
        <template slot-scope="scope">
          <template v-for="(item,operateIndex) in operateColumns">
            <div
              v-if="item.render"
              :key="operateIndex"
              class="custom-button"
              @click="$emit(item.handler, scope.row)"
              v-html="item.render(scope.row)"
            />
            <el-button
              v-else-if="item.handler=='clipboard'"
              :id="`copyBtn_${scope.row.id}`"
              :key="operateIndex"
              class="col-operate-button clipboard"
              :class="item.type === 'primary' ? 'primary-color' : 'danger-color'"
              type="text"
              size="small"
              @click="copyLink(scope.row, item.copyField)"
            >
              {{ item.label }}
            </el-button>
            <el-button
              v-else
              :key="operateIndex"
              class="col-operate-button"
              :class="item.type === 'primary' ? 'primary-color' : 'danger-color'"
              type="text"
              size="small"
              @click="$emit(item.handler, scope.row)"
            >
              {{ item.label }}
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区 -->
    <el-pagination
      v-if="hasShowPaging"
      class="cm-table-pagination"
      :total="+total"
      :layout="'total, sizes, prev, pager, next, jumper'"
      :page-size="pageSize"
      :page-sizes="pageSizes"
      :current-page="curPage"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      @prev-click="handlePageChange"
      @next-change="handlePageChange"
    />
  </div>
</template>

<script>
import { dateParse, daysToNow } from '@/utils/time.js'
import CommonForm from '@/components/CommonForm'
import Clipboard from 'clipboard'
const _array = require('lodash/array')

/**
 * columns 参数说明
 * columns: [
    {
      key: [String, Number], // 唯一Key，可选，如果不传默认使用 prop 作为 key
      prop: String, // 字段名
      type: ['index', 'selection', ''], // col 类型，参照 element-ui 文档
      label: String, // 列的名称
      width: String, // 每列的宽度
      min-width: String, // 每列的最小宽度
      align: ['left','center','right'], // 列文字对齐方式
      sortable: [true, false, 'custom'], // 排序，参照 element-ui 文档
      className: String, // 自定义类名
      fixed: [true, 'left', 'right'] // 列是否固定在左侧或者右侧，true 表示固定在左侧
      hidden: Boolean, // 是否隐藏该列
      renderHeader: Function, // 传入一个函数返回表头
      displayType:[
        'imageList', // 图片列表，传入一个数组，数组项是图片src
        'avator', // 头像，传入图片src
        'status', // 状态值，暂时只支持两种状态，传入布尔值或者数字(0/1)
        'time', // 时间，传入值为时间戳，显示到时分秒
        'dateWithDays', // 日期，显示距离当前多少天
        'operate', // 交互操作，传入示例：{lebel:'edit',handler:fn}
        'stringList', // 文本列表，只显示一个，多余的表示为...
        'string' // 普通文本
      ],
      operateHandler: String, // 交互操作调用的父元素里的方法
      statusValue: ['label-1', 'label-2'], // 当displayType为status时，每个状态对应的文本
    }
   ]

  operateColumns 参数说明
  operateColumns: [
  [
    {
      label: 'Edit', // 操作按钮的文本
      type: 'primary', // 主题颜色
      handler: 'editHandler' // 父级操作方法,当handler为clipboard时，组件已封装文字剪贴板功能，可直接使用
    }
  ]
 */
export default {
  name: 'CmTable',
  components: {
    CommonForm
  },
  filters: {
    dateParse,
    daysToNow
  },
  props: {
    // 列配置
    columns: {
      type: Array,
      default() {
        return []
      }
    },

    // 搜索区域配置
    filterOptions: {
      type: Array,
      default() {
        return []
      }
    },

    filterFormLabelWidth: {
      type: String,
      default: '60px'
    },

    // 表格数据，字段应与columns中的props相对应
    dataSource: {
      type: Array,
      default() {
        return []
      }
    },

    // 操作列
    operateColumns: {
      type: Array,
      default: () => []
    },

    // 操作列
    operateColumnsWidth: {
      type: [String, Number],
      default: 120
    },

    loading: {
      type: Boolean,
      default: false
    },

    // 斑马条纹
    stripe: {
      type: Boolean,
      default: false
    },

    // 是否显示序号列
    indexColumn: {
      type: Boolean,
      default: false
    },

    // 是否显示选择列
    selectionColumn: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示分页
     * 为 always 时，将一直显示
     * 为 false 时，总是不显示
     * 为 true 时，只有页码大于1时才显示
     */
    pagination: {
      type: [Boolean, String],
      default: 'always',
      validator(value) {
        return ['always', true, false].indexOf(value) !== -1
      }
    },

    // 总条数
    total: {
      type: [Number, String],
      default: 150
    },

    // 每页显示数量
    pageSize: {
      type: Number,
      default: 10
    },

    // 页码
    pageNo: {
      type: Number,
      default: 1
    },

    // 分页选择器的选项设置
    pageSizes: {
      type: Array,
      default() {
        return [10, 30, 50, 80, 100]
      }
    },

    // 表头类
    headerCellClassName: {
      type: String,
      default: 'cm-header-bg'
    },

    // 最大高度，不包含分页高度
    maxHeight: {
      type: Number,
      default: 0
    },

    // 分页后是否自动滚动到顶部
    autoScrollTop: {
      type: Boolean,
      default: true
    },

    // 单元格的 style 的回调方法
    cellStyle: {
      type: [Function, String],
      default() {
        return { padding: '0px' }
      }
    },

    // 单元格的 className 的回调方法
    cellClassName: {
      type: [Function, String],
      default() {
        return ''
      }
    }
  },
  data() {
    const columnsDefault = { // 一些需要默认配置的columns属性
      align: 'left',
      sortable: false,
      fixed: false,
      hidden: false,
      displayType: 'string'
    }
    return {
      index: 0,
      curPage: 1,
      tableData: [], // 表格数据
      summaryData: {}, // 汇总数据
      tableSelectedRow: [],
      columnsDefault,
      filterFormData: {},
      defaultAvator: require('@/assets/images/tesla.jpg')
    }
  },
  computed: {
    // 兼容低版本
    hasShowPaging() {
      if (this.pagination === 'always') return true
      return this.pagination && this.total > this.pageSize
    },
    mHeight() {
      const { hasShowPaging, maxHeight } = this
      const height = hasShowPaging ? maxHeight : maxHeight + 46 // 46 为 pagination 的高度
      return this.maxHeight !== 0 ? height : 'auto'
    },
    filterFormOptions() {
      return this.filterOptions.map(item => {
        return {
          ...item,
          divwidth: 'fit',
          field: item.prop,
          options: item.options
        }
      })
    }
  },
  watch: {
    dataSource: {
      deep: true,
      immediate: true,
      handler(val) {
        this.generateData(val)
        // 滚动到顶部
        this.autoScrollTop && this.moveToTop()
      }
    },
    pageNo(val) {
      this.curPage = val
    },
    columns: {
      deep: true,
      immediate: true,
      handler(val) {
        this.index++ // 解决columns的顺序改变，视图不更新问题
        val.forEach(item => { // 给一些选项设置默认值
          for (const key in this.columnsDefault) {
            if (!item[key]) {
              item[key] = this.columnsDefault[key]
            }
          }
        })
      }
    },
    tableSelectedRow: {
      handler(newVal, oldVal) {
        if (newVal.length > oldVal.length) { // 添加
          this.$emit('selectionChangeOnRow', {
            isAdd: true,
            row: _array.difference(newVal, oldVal)
          })
        } else { // 减少
          this.$emit('selectionChangeOnRow', {
            isAdd: false,
            row: _array.difference(oldVal, newVal)
          })
        }
      }
    }
  },
  methods: {
    dateParse,
    daysToNow,
    search() {
      this.$emit('search', this.filterFormData)
    },
    reset() {
      this.filterFormData = {}
    },
    // 处理表格数据
    generateData(val) {
      this.tableData = val
    },

    // 根据列字段获取该列在 columns 的 index
    getIndexByProp(prop) {
      return this.columns.findIndex(item => item.prop === prop)
    },

    // 改变页数
    handlePageChange(page) {
      this.$emit('pageChange', page)
    },

    // 改变每页显示的条数
    handleSizeChange(size) {
      this.$emit('sizeChange', size)
    },

    // 选择改变方法
    handleSelectionChange(data) {
      this.tableSelectedRow = data
      this.$emit('selectChange', data)
    },

    // 返回页面顶部
    moveToTop() {
      if (this.maxHeight) {
        if (this.$refs?.cmTable?.bodyWrapper) {
          this.$refs.cmTable.bodyWrapper.scrollTop = 0
        }
      } else {
        this.move(0)
      }
    },

    // 滚动到某个位置
    move(amount) {
      document.documentElement.scrollTop = amount
      document.body.parentNode.scrollTop = amount
      document.body.scrollTop = amount
    },

    // 手动勾选数据行
    handleSelect(selection, row) {
      this.$emit('select', selection, row)
    },

    // 手动勾选全选
    handleSelectAll(selection) {
      this.$emit('select-all', selection)
    },

    // 设置当前行的选中状态
    setCurrentRow(index) {
      console.warn('设置选中行 >>>', index)
      this.$nextTick(() => {
        this.$refs.cmTable.setCurrentRow(index ? this.tableData[index] : undefined)
      })
    },

    // 切换选中状态
    toggleSelection(index) {
      this.$nextTick(() => {
        this.$refs.cmTable.toggleRowSelection(this.tableData[index], true)
      })
    },

    // 根据某个属性值切换选中状态，这个属性值一般得是唯一值，比如id
    toggleSelectionByProp({ prop, value }) {
      const filterRes = this.tableData.filter(item => item[prop] == value)
      if (filterRes.length > 0) {
        this.$refs.cmTable.toggleRowSelection(filterRes[0])
      }
      this.$refs.cmTable.toggleRowSelection(this.tableData[index])
    },

    // 清空选中状态
    clearSelection() {
      this.$refs.cmTable.clearSelection()
    },

    // 数据列排序
    handleSortchange(column) {
      const order = column.order
      const sortField = column.prop
      const sortDirection = order ? (order === 'descending' ? 'desc' : 'asc') : 'desc'
      const data = {
        sortDirection,
        sortField
      }
      this.$emit('sort', data)
    },

    // 复制内容到粘贴板
    copyLink (data, copyField) {
      console.log('copy content >>>', data[copyField])
      this.$nextTick(() => {
        const clipboard = new Clipboard(`#copyBtn_${data.id}`, {
          text: () => {
            return data[copyField]
          }
        })
        clipboard.on('success', (e) => {
          this.$message({
            type: 'success',
            message: 'The url has been copied to clipboard.'
          })
          // 释放内存
          clipboard.destroy()
        })
        clipboard.on('error', e => {
          this.$message({
            type: 'success',
            message: 'The url copy failed to clipboard.'
          })
          clipboard.destroy()
        })
      })
    }
  }
}
</script>

<style lang="scss">
.cm-col-cover{
  margin: 0!important;
}
.cm-table{

  .table-filter{
    background: #F5F6F7;
    padding: 15px;
    margin-bottom: 15px;
    .form-group{
      .el-form-item__label{
        font-size: 12px;
        font-weight: 400;
        color: #303133;
      }
    }
    .button-group{
      margin-left: 60px;
    }
    .el-form-item{
      margin-bottom: 15px;
    }
  }

  .el-table {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    color: #303133;
    p{
      margin: 0;
    }
    // 表格
    .cell{
      line-height: 1;
      padding: 14px 0 14px 20px;
      word-break: break-word;
    }
    // 表头
    th{
      padding: 0;
      background: #F2F2F2;
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      .cell{
        display: flex;
        align-items: center;
        height: 50px;
        padding: 0;
        padding-left: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #606266;
      }
    }
  }

  // 分页样式
  .cm-table-pagination {
    padding: 18px 12px 0;
    text-align: right;
    background-color: #fff;
  }
  .el-pagination{
    color: #606266;
    font-weight: 400;
  }

  // 父元素的边框
  .cm-table-border {
    border: 1px solid #dfe6ec;
    border-bottom: none;
  }

  .el-table td, .el-table th.is-leaf {
    border-bottom: 1px solid #f5f5f5;
  }

  // 不同类型列的样式
  .cm-col{
    &-avator{
      width: 40px;
      height: 40px;
      opacity: 1;
      border-radius: 50%;
      margin: 0 auto;
    }
    &-cover{
      width: 68px;
      height: 50px;
      position: relative;
      margin: 0 auto;
      img{
        height: 100%;
        width: 100%;
      }
      .mask{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        line-height: 50px;
        text-align: center;
        color: #ffffff;
        background: #0006;
      }
    }
    &-status{
      line-height: 14px;
    }
    &-time,&-days,&-text{
      span{
        display: block;
        line-height: 16px;
      }
    }
    &-operate{
      cursor: pointer;
    }
  }

  // 自定义按钮
  .custom-button{
    margin-left: 10px;
    padding: 9px 0;
    display: inline;
    cursor: pointer;
  }

  // 字体颜色
  .succes-color{
    color:#04880D
  }
  .danger-color{
    color:#E04545
  }
  .primary-color{
    color:#03BCAA
  }
}
</style>
