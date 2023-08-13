# 使用 form-view 快速开发详情页面

## 模块目录

```
|- loadingCabin
|  |- config
|  |  |- create.ts
|  |  |- edit.ts
|  |  |- index.ts
|  |  |- modal.ts
|  |- create
|  |  |- index.vue
|  |- edit
|  |  |- index.vue
|  |- index.vue
```

## create/index.vue template 部分

存在放大镜的情况下

```vue
<template>
  <qt-form-view
    v-model:query-model="queryModel"
    v-model:value="values"
    :options="options"
    :query-data="queryData"
    :query-page-info="queryPageInfo"
    @menu-click="handleMenuClick"
    @page-info="handlePageInfo"
    @quick-search="handleQuickSearch"
  />
</template>
```

不存在放大镜的情况下

```vue
<template>
  <qt-form-view
    v-model:value="values"
    :options="options"
    @menu-click="handleMenuClick"
  />
</template>
```

## create/index.vue script 部分

### import

```typescript
import { cloneDeep } from 'lodash-es';
// 生产环境下关闭页签
import { openTab, closeTab } from '@/utils/toolsTab';
// 开发环境下关闭页签
import { useAddRoute, useCloseCurrentRoute } from '@/hooks/useRouters';
import { get, post } from '@/hooks/useRequest';
import { options as defaultOptions, baseData } from '../config/create';
import type {
  OnMenuClick,
  OnQuickSearch,
  QueryModelAssemble,
  TabOptions,
} from '@quantum-asia/qt-design/es/form-view/src/types';
import type { QueryPageInfo } from '@quantum-asia/qt-design/es/form/src/types';
```

### defineOptions

```typescript
defineOptions({ name: 'LoadingCabinCreate' });
const router = useRouter();
```

### ref

通用

```typescript
const values = ref<Record<string, any>>({
  baseData: cloneDeep(baseData),
});
const options = ref<TabOptions>(cloneDeep(defaultOptions));
```

在有放大镜的情况下

```typescript
const queryModel = ref<QueryModelAssemble>({
  baseData: [],
});
const queryData = ref<Record<string, any>>({
  containerNo: [],
});
const queryPageInfo = ref<QueryPageInfo>({
  containerNo: {
    page: 1,
    pageSize: 20,
    itemCount: 0,
  },
});
// 在有多个放大镜的情况下
const showMagnifierField = ref<string>('');
```

### watch queryModel

一个表单创建一个 watch

```typescript
watch(
  () => unref(queryModel).baseData,
  () => {
    // 一个放大镜的情况下
    getContainerNoList();
    // 多个放大镜的情况下
    if (showMagnifierField.value == 'containerNo') {
      getContainerNoList();
    }
    if (showMagnifierField.value == 'packageDesc') {
      getPackageDescList();
    }
  },
);
```

### form-view 事件处理

#### menuClickEvent

```typescript
const handleMenuClick: OnMenuClick = (name: string): void => {
  switch (name) {
    case 'create':
      const compName = 'loadingCabinCreate';
      const routePath = 'loadingCabinCreate-new';

      useAddRoute(router, {
        name: '组托装柜-新建',
        path: routePath,
        compName: compName,
        compKey: 'loadingCabinCreate',
      });

      router.replace('loadingCabinCreate-new');

      break;
    case 'save':
      saveLoadingCabin();
      break;
    case 'close':
      // 生产环境下
      closeTab();
      // 开发环境下
      useCloseCurrentRoute(router.currentRoute.value.name as string);
      break;
  }
}
```

#### pageInfoEvent

```typescript
const handlePageInfo = ({ params }) => {
  if (params.field == 'containeNo') {
    unref(queryPageInfo).containerNo.page = params.options.page;
    unref(queryPageInfo).containerNo.pageSize = params.options.pageSize;
    getContainerNoList();
  }
  if (params.field == 'packageDesc') {
    unref(queryPageInfo).packageDesc.page = params.options.page;
    unref(queryPageInfo).packageDesc.pageSize = params.options.pageSize;
    getPackageDescList();
  }
}
```

#### quickSearchEvent

```typescript
const handleQuickSearch: OnQuickSearch = ({ name, params }): void => {
  switch (name) {
    case 'baseData':
      if (params.field == 'containerNo' && params.show) {
        // 仅一个放大镜
        getContainerNoList();
        // 多个
        showMagnifierField.value = 'containerNo';
        getContainerNoList();
      }
      if (params.field == 'packageDesc' && params.show) {
        // 仅一个放大镜
        getPackageDescList();
        // 多个
        showMagnifierField.value = 'PackageDesc';
        getPackageDescList();
      }
  }
}
```

### 放大镜获取数据

```typescript
const getContainerNoList = async (): Promise<void> => {
  const { page, pageSize } = unref(queryPageInfo).containerNo;

  const res = await post('url', {
    pageInfo: {
      currentPage: page,
      pageSize,
      sortField: 'CREATED_DATE DESC',
      isGetTotalCount: true,
    },
    queryModel: {
      items: unref(queryModel).baseData,
    },
  });

  queryData.value.containerNo = res.list;
  queryPageInfo.value.containerNo.itemCount = res.total;
};
```

### 保存并提交数据

```typescript
const saveLodingCabin = async (): Promise<void> => {
  const res = await post('url', {
    ...unref(values).baseData,
  });

  // 多个放大镜的情况下
  showMagnifierField.value = '';

  // 关闭当前路由，跳转到编辑页面
  const code = baseData['ttID'];
  const compName = 'loadingCabinEdit';
  const routePath = `${lowerFirst(compName)}-${code}`;

  // 生产环境下
  openTab(`/loadingCabinEdit?code=${code}`, routePath, router);
  closeTab();
  // 开发环境下
  useAddRoute(router, {
    name: `组托装柜-${code}`,
    path: routePath,
    compName,
    compKey: `loadingCabinEdit${code}`,
  });
  useCloseCurrentRoute(router.currentRoute.value.name as string);
  router.replace({ path: '/loadingCabinEdit', query: { code: res } });
};
```

## config/create.ts 部分

### import

通用

```typescript
import { TabOptions } from '@quantum-asia/qt-design/es/form-view/src/types';
import { FormList } from '@quantum-asia/qt-design/es/form/src/types';
```

在有放大镜的情况下

```typescript
import { ColumnProps } from '@quantum-asia/qt-design/es/table/src/types';
import { QueryOptions } from '@quantum-asia/qt-design/es/types/queryModel';
```

### options

```typescript
export const formViewOptions: TabOptions = [
  {
    title: '组托装柜-新建',
    name: 'loadingCabinCreate',
    group: [
      {
        compType: 'form',
        title: '基础信息',
        name: 'baseData',
        formOptions: baseDataFormOptions,
        formProps: {
          labelWidth: '130px',
        },
      },
    ],
    menus: [
      {
        title: '关闭',
        name: 'close',
        show: true,
        disabled: false,
        type: 'default',
      },
    ],
  },
];
```

### baseData

```typescript
export const baseData: { [key: string]: any } = {
  assembleId: '',
  packageVolume: 0,
  batchBulk: 'Y',
};
```

### baseDataFormOptions

```typescript
export const baseDataFormOptions: FormList = [

]
```

input 类型

```typescript
{
  compType: 'input',
  span: 4,
  label: '组托ID',
  field: 'assembleId',
}
```

放大镜，inputQuery 类型

```typescript
{
  compType: 'inputQuery',
  span: 4,
  label: '包装描述',
  field: 'packageDesc',
  tableColumns: packageDescTableColumns,
  queryOptions: packageDescQueryOptions,
  tableProps: {
    height: '100%',
    menuConfig: {},
  },
  autoAssign: { packageDesc: 'packname' },
  readonly: true,
  required: true,
},
```

select 类型

```typescript
{
  compType: 'select',
  span: 4,
  label: '包装类型',
  field: 'packageType',
  // 手动写 options
  options: [
    {
      label: '托盘',
      value: '托盘',
    },
    {
      label: '箱',
      value: '箱',
    },
    {
      label: '件',
      value: '件',
    },
    {
      label: '包',
      value: '包',
    },
  ],
  // or 数据字典加载
  dictionaryKeys: '',
}
```

inputNumber 类型

```typescript
{
  compType: 'inputNumber',
  span: 4,
  label: '体积',
  field: 'packageVolume',
  min: 0,
},
```

switch 类型

```typescript
{
  compType: 'switch',
  span: 4,
  label: '是否整托',
  field: 'batchBulk',
  checkedValue: 'Y',
  uncheckedValue: 'N',
},
```

### queryOptions

仅在有放大镜的情况下有需要，详细配置参考 table-view

```typescript
export const packageDescQueryOptions: QueryOptions = [
  {
    compType: 'input',
    label: '包装标识',
    field: 'packgid',
  },
]
```

### tableColumns

仅在有放大镜的情况下有需要，详细配置参考 table-view

```typescript
export const packageDescTableColumns: ColumnProps[] = [
  {
    type: 'radio',
    width: 60,
    resizable: false,
    fixed: 'left',
    align: 'center',
  },
  {
    type: 'seq',
    width: 60,
    resizable: false,
    fixed: 'left',
    align: 'center',
  },
  {
    title: '包装标识',
    field: 'packgid',
    width: 200,
  },
];
```