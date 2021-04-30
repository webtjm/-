<template>
  <el-form
    :ref="reform"
    :model="formData"
    :size="formSize ? formSize : 'medium'"
    :label-width="labelWidth"
    :class="['cm_el_form', `cm_em_form-${display}`]"
    :rules="formRule"
    :label-position="labelPosition"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div
      v-for="(item, index) in formConfigs"
      :key="index"
      class="cm_el_form_item"
      :style="{
        width: item.divwidth ? item.divwidth : '100%',
        display: item.hide ? 'none' : 'block',
      }"
    >
      <el-form-item
        v-show="!item.isshow"
        :label="item.label"
        :prop="item.field"
        :required="item.required"
      >
        <!-- 纯文本 -->
        <template v-if="item.type == 'text'">
          <div class="group-text-box">
            <span
              class="group-text"
              :style="{ width: item.width ? item.width + 'px' : '400px' }"
            >{{ formData[item.field] }}</span>
          </div>
        </template>
        <!-- 按钮 -->
        <template v-if="item.type == 'button'">
          <div
            v-if="item.themeType == 'single'"
            class="group-box single"
          >
            <div class="group-item">
              <span
                v-if="formData[item.field]"
                class="item"
              >{{
                formData[item.field][item.themeField]
              }}</span>
            </div>
            <el-button
              type="primary"
              :size="formSize"
              @click="buttonTap(item)"
            >
              {{ item.placeholder }}
            </el-button>
          </div>
          <div
            v-if="item.themeType == 'multi'"
            class="group-box multi"
          >
            <template v-if="formData[item.field]">
              <div
                v-for="(el, elIdx) in formData[item.field]"
                :key="elIdx"
                class="group-item-box"
              >
                <span class="item text-overflow-line_1">{{
                  el[item.themeField]
                }}</span>
                <el-button
                  type="danger"
                  :size="formSize"
                  icon="el-icon-delete"
                  circle
                  @click="bindDelete(elIdx)"
                />
              </div>
            </template>
            <el-button
              v-if="item.showButton == undefined ? true : item.showButton"
              type="primary"
              :size="formSize"
              @click="buttonTap(item)"
            >
              {{ item.placeholder }}
            </el-button>
          </div>
        </template>
        <!-- 普通输入框 -->
        <template v-if="item.type == 'input'">
          <el-input
            v-model="formData[item.field]"
            :style="{ width: item.width ? item.width + 'px' : '400px' }"
            :disabled="item.disabled ? item.disabled : false"
            :maxlength="item.maxlength ? item.maxlength : 30"
            :show-word-limit="item.showWordLimit ? item.showWordLimit : false"
            :placeholder="
              item.placeholder ? item.placeholder : 'Enter ' + item.label
            "
          />
        </template>
        <!-- 密码输入框 -->
        <template v-else-if="item.type == 'password'">
          <el-input
            v-model="formData[item.field]"
            :style="{ width: item.width ? item.width + 'px' : '400px' }"
            :disabled="item.disabled ? item.disabled : false"
            :maxlength="item.maxlength ? item.maxlength : 30"
            :placeholder="item.placeholder ? item.placeholder : 'Enter 内容'"
            autocomplete="on"
            show-password
          />
        </template>
        <!-- 下拉选择框 -->
        <template v-else-if="item.type == 'select'">
          <el-select
            v-model="formData[item.field]"
            :multiple="item.multiple ? item.multiple : false"
            :filterable="item.filterable ? item.filterable : false"
            :disabled="item.disabled ? item.disabled : false"
            :style="{ width: item.width ? item.width + 'px' : '400px' }"
            :placeholder="
              item.placeholder ? item.placeholder : 'enter ' + item.label
            "
            @change="bindChange"
          >
            <el-option
              v-for="(opt, optIdx) in item.options"
              :key="optIdx"
              :label="opt.label || opt.name"
              :value="opt.value"
            />
          </el-select>
        </template>
        <!-- 文本域 -->
        <template v-else-if="item.type == 'textarea'">
          <el-input
            v-model="formData[item.field]"
            :style="{ width: item.width ? item.width + 'px' : '400px' }"
            type="textarea"
            :autosize="{
              minRows: item.minRows ? item.minRows : 4,
              maxRows: item.maxRows ? item.maxRows : 6,
            }"
            :disabled="item.disabled ? item.disabled : false"
            :maxlength="item.maxlength ? item.maxlength : 30"
            :show-word-limit="item.showWordLimit ? item.showWordLimit : true"
            :placeholder="
              item.placeholder ? item.placeholder : 'enter ' + item.label
            "
          />
        </template>
        <!-- 多选框 -->
        <template v-else-if="item.type == 'checkbox'">
          <el-checkbox-group
            v-model="formData[item.field]"
            :disabled="item.disabled ? item.disabled : false"
            :style="{ width: item.width ? item.width + 'px' : '400px' }"
          >
            <el-checkbox
              v-for="(checkedItem, optIdx) in item.options"
              :key="optIdx"
              :border="item.showBorder ? item.showBorder : false"
              :label="checkedItem.value"
              @change="bindChange"
            >
              {{ checkedItem.label }}
            </el-checkbox>
          </el-checkbox-group>
        </template>
        <!-- 单选框 -->
        <template v-else-if="item.type == 'radio'">
          <el-radio-group
            v-model="formData[item.field]"
            :disabled="item.disabled ? item.disabled : false"
            :style="{ width: item.width ? item.width + 'px' : '400px' }"
            @change="bindChange"
          >
            <el-radio
              v-for="(checkedItem, optIdx) in item.options"
              :key="optIdx"
              :border="item.showBorder ? item.showBorder : false"
              :label="checkedItem.value"
            >
              {{ checkedItem.label }}
            </el-radio>
          </el-radio-group>
        </template>
        <!-- 时间范围选择器 -->
        <template v-else-if="item.type == 'time'">
          <el-date-picker
            v-model="formData[item.field]"
            :disabled="item.disabled ? item.disabled : false"
            :style="{ width: item.width ? item.width + 'px' : '400px' }"
            value-format="timestamp"
            :type="item.dateType"
            unlink-panels
            :range-separator="item.rangeSeparator ? item.rangeSeparator : 'to'"
            :start-placeholder="
              item.startPlaceholder
                ? item.startPlaceholder
                : 'pick the start time'
            "
            :end-placeholder="
              item.endPlaceholder ? item.endPlaceholder : 'pick the end time'
            "
            :placeholder="item.placeholder ? item.placeholder : 'pick a time'"
            @change="handleDateTimeChange"
          />
        </template>
        <!-- 地区三级联动 -->
        <template v-else-if="item.type == 'citypicker'">
          <el-cascader
            v-model="formData[item.field]"
            :disabled="item.disabled ? item.disabled : false"
            :style="{ width: item.width ? item.width + 'px' : '400px' }"
            :options="cityoptions"
            :props="cityprops"
            :placeholder="item.placeholder ? item.placeholder : 'enter 内容'"
          />
        </template>
        <!-- 图片上传 -->
        <template v-else-if="item.type == 'image'">
          <div class="upload-box">
            <el-upload
              class="avatar-uploader"
              list-type="picture-card"
              accept=".png, .jpg"
              :file-list="formData[item.field]"
              action
              :headers="item.headers"
              :http-request="item.uploadTap"
              :on-success="item.callback"
              :on-remove="item.removeTap"
              :before-upload="beforeUpload"
              :on-preview="handlePictureCardPreview"
              :on-exceed="handlePictureExceed"
              :limit="item.limit"
            >
              <i class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
            <el-dialog
              :visible.sync="picturePreviewDialog"
              append-to-body
            >
              <img
                width="100%"
                :src="dialogImageUrl"
              >
            </el-dialog>
          </div>
        </template>
        <!-- 多层级联动 -->
        <template v-else-if="item.type == 'cascader'">
          <el-cascader
            v-model="formData[item.field]"
            :disabled="item.disabled ? item.disabled : false"
            :style="{ width: item.width ? item.width + 'px' : '400px' }"
            :options="item.options"
            :props="item.props"
            :placeholder="
              item.placeholder ? item.placeholder : 'enter ' + item.label
            "
          />
        </template>
        <!-- 时间间隔 -->
        <template v-else-if="item.type == 'interval'">
          <div class="interval-box">
            <el-input
              v-for="(interval, idx) in item.intervals"
              :key="idx"
              v-model="formData[interval.field]"
              :style="{
                width: interval.width ? interval.width + 'px' : '150px',
              }"
              :disabled="interval.disabled ? interval.disabled : false"
              :placeholder="
                interval.placeholder
                  ? interval.placeholder
                  : 'Enter ' + interval.label
              "
            />
            <span class="tip">{{ item.tip }}</span>
          </div>
        </template>
      </el-form-item>
    </div>
    <div
      class="form-confirm-box"
      :style="{ width: display === 'block' ? '100%' : '', textAlign: btnAlign }"
    >
      <el-button
        v-if="showClose"
        @click="cancelSubmitTap"
      >
        {{ closeLabel }}
      </el-button>
      <el-button
        v-if="showSubmit"
        type="primary"
        :loading="loading"
        @click="submitTap"
      >
        {{ submitLabel }}
      </el-button>
    </div>
  </el-form>
</template>
<script>
export default {
  name: 'CommonForm',
  props: {
    reform: {
      // elform的ref属性
      type: String,
      default: function () {
        return 'cmForm'
      }
    },
    formSize: {
      type: String,
      default: 'medium' // 组件大小，可选值：large, medium, small, mini
    },
    display: {
      // 表单项布局，可选值：inline，block
      type: String,
      default: 'block'
    },

    labelWidth: {
      // label宽度
      type: String,
      default: function () {
        return '110px'
      }
    },

    labelPosition: {
      // label的位置
      type: String,
      default: function () {
        return 'right'
      }
    },

    reformRule: {
      // 校验规则
      type: Object,
      default: function () {
        return {}
      }
    },

    formData: {
      // 表单的值
      type: Object,
      default: function () {
        return {}
      }
    },

    formConfigs: {
      // 表单配置项
      type: Array,
      default: function () {
        return [
          {
            label: '输入框', // 文字label
            type: 'input', // input,select,textarea,checkbox,radio,time,citypicker,image,password
            maxlength: 30, // 输入长度限制
            showWordLimit: false, // 输入长度提示
            hide: false, // 是否显示
            field: 'id', // 字段名称
            isshow: false, // 是否展示
            width: false, // 文本宽度
            disabled: false, // 是否禁用
            placeholder: 'Enter ', // placeholder提示
            showBorder: false, // 是否显示边框，基于radio、checkout
            multiple: false, // 是否多选，基于select，checkbox
            filterable: false, // 是否多选，基于select
            required: false, // 是否必填
            onChange: () => {}, // change回调，基于select、radio、checkout
            onSuccess: () => {} // 成功回调，基于upload
          }
        ]
      }
    },

    submitLoading: {
      // 提交等待状态
      type: Boolean,
      default: false
    },

    showClose: {
      // 是否显示取消按钮
      type: Boolean,
      default: true
    },

    showSubmit: {
      // 是否显示提交按钮
      type: Boolean,
      default: true
    },

    closeLabel: {
      // 取消按钮文字
      type: String,
      default: 'cancel'
    },

    submitLabel: {
      // 提交按钮文字
      type: String,
      default: 'confirm'
    },

    btnAlign: {
      // 按钮对齐方式, 可选值：left,center,right
      type: String,
      default: 'left'
    }
  },
  data() {
    return {
      outData: {},
      formRule: {},
      cityoptions: [],
      cityprops: {
        value: 'name',
        label: 'name'
      },
      loading: false,
      dialogImageUrl: '',
      picturePreviewDialog: false
    }
  },
  created() {
    this.formRule = this.reformRule
  },
  mounted() {},
  methods: {
    handleDateTimeChange(data) {
      this.$emit('dateTimeChange', data)
    },
    handlePictureExceed(files, fileList) {
      console.log('upload limit')
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.picturePreviewDialog = true
    },
    bindChange(e) {
      this.$emit('change', e)
    },
    bindDelete(index) {
      this.$emit('groupDelete', index)
    },
    beforeUpload(file) {
      const isLt20M = file.size / 1024 / 1024 < 20
      if (!isLt20M) {
        this.$message.error('上传文件大小不能超过 20MB!')
      }
      return isLt20M
    },
    buttonTap(target) {
      this.$emit(target.event)
    },
    cancelSubmitTap() {
      this.$emit('cancel')
    },
    submitTap() {
      let flag = false
      this.$refs[this.reform].validate((valid) => {
        if (valid) {
          flag = true
        } else {
          flag = false
        }
      })
      if (flag) {
        this.loading = this.submitLoading
        this.$emit(
          'submit',
          this.formData,
          this.submitLoading
            ? () => {
                this.loading = false
              }
            : null
        )
      } else {
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";
.cm_el_form {
  display: flex;
  flex-wrap: wrap;
  padding-right: 25px;
}
.cm_em_form-inline {
  .el-form-item {
    margin-right: 20px;
  }
}
.cm_el_form_item {
  display: flex;
  ::v-deep .el-radio {
    line-height: 40px;
  }
}
.question-wraper {
  display: flex;
  flex-flow: column;
  .el-form-item__label {
    text-align: left;
  }
  .answer_content {
    // position: relative;
    // left: -110px;
  }
}
.avatar-uploader {
  ::v-deep .el-upload {
    width: 100px;
    height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    &:hover{
      border-color: $theme;
    }
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
.interval-box {
  ::v-deep .el-input {
    margin-right: 20px;
  }
  .tip {
    color: #a9a9a9;
  }
}
.group-box {
  &.single {
    .item {
      margin-right: 20px;
    }
  }
  &.multi {
    .group-item-box {
      display: flex;
      button {
        width: 35px;
        height: 35px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 20px;
      }
    }
    .item {
      width: 350px;
      display: block;
      margin-bottom: 10px;
    }
  }
}
.group-text-box {
  .group-text {
    display: block;
  }
}
.upload-box {
  display: flex;
  ::v-deep .el-upload-list--picture-card{
    .el-upload-list__item{
      width: 100px;
      height: 100px;
    }
  }
}
</style>
