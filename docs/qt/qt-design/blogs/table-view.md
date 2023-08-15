# 使用 table-view 组件快速开发基础表页面

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

## index.vue template 部分

```vue
<template>
  <qt-table-view
    v-model:query-model="queryModel"
    v-model:query-options="queryOptions"
    :table-data="tableData"
    :table-columns="tableColumns"
    :table-props="tableProps"
    :page-props="pageProps"
    :customable="fasle"
    :templateable="false"
    exportable
    importable
    createable
    :router="[{ field: 'assembleId' }]"
    :import-props="importProps"
    :export-props="exportProps"
    :menu-options="menuOptions"
    @page-info="handlePageInfo"
    @selection="handleSelection"
    @export-submit="handleExportSubmit"
    @import-finish="handleImportFinish"
    @create="handleCreate"
    @refresh="getList"
    @to="rowClick"
  />
</template>
```

## index.vue script 部分

### import 部分

```typescript
import { Add, Edit, Delete } from "@icon-park/vue-next";
import { lowerFirst, cloneDeep } from "lodash-es";
import { useDialog } from "naive-ui";
import { getToken } from "@/utils/auth";
import { get, post } from "@/hooks/useRequest";
import { useAddRoute } from "@/hooks/useRouters";
import {
  queryOptions as defaultQueryOptions,
  tableColumns as defaultTableColumns,
} from "./config/index";
import type {
  QueryModel,
  QueryOptions,
} from "@quantum-asia/qt-design/es/types/queryModel";
import type {
  ColumnProps,
  OnPageInfo,
  OnSelection,
} from "@quantum-asia/qt-design/es/table/src/types";
import type { VxeTableProps } from "vxe-table";
import type { PaginationProps } from "naive-ui";
import type { ExportProps, ImportProps } from "@quantum-asia/qt-design";
import type { OnExportSubmit } from "@quantum-asia/qt-design/es/table-view/src/types";
import type { MenuOptions } from "@quantum-asia/qt-design/es/context-menu/src/types";
```

### defineOptions 部分

```typescript
defineOptions({ name: "LoadingCabin" });
const router = useRouter();
const dialog = useDialog();
```

### ref 部分

```typescript
const queryModel ref<QueryModel>();
const queryOptions = ref<QueryOptions>(defaultQueryOptions);
const tableData = ref<Record<string, any>>([]);
const tableColumns = ref<ColumnProps[]>(defaultTableColumns);
const tableProps = ref({
  height: '100%',
  menuConfig: {
    enabled: true,
  },
} as VxeTableProps);
const pageProps = ref<PaginationProps>({
  page: 1,
  pageSize: 20,
  itemCount: 0,
});
const importProps = ref<ImportProps>({
  action: '/api/tms/assembleInfo/dataImport',
  headers: {
    Authorization: 'Token',
    Token: getToken(),
  },
  download: {
    template: {
      name: '下载模板',
      action: '/api/tms/assembleInfo/templateDownload',
      headers: {
        Authorization: 'Token',
        Token: getToken(),
        'Content-Type': 'application/json',
      },
    },
    fail: {
      name: '失败数据下载',
      action: '/api/tms/assembleInfo/errorDataDownload',
      headers: {
        Authorization: 'Token',
        Token: getToken(),
        'Content-Type': 'application/json',
      },
    },
  },
});
const exportProps = ref<ExportProps>({
  min: 1,
  max: 2,
  title: '导出',
  wasm: true,
});
const selection = ref<Record<string, any>>({});
```

### menuOptions 部分

```typescript
const menuOptions = computed<MenuOptions>(() => {
  return [
    {
      label: "新建",
      icon: Add,
      multiple: true,
      click: (): void => {
        handleCreate();
      },
    },
    {
      label: "编辑",
      icon: Edit,
      multiple: false,
      click: (): void => {
        rowClick(unref(selection)[0].id);
      },
    },
    {
      label: "删除",
      icon: Delete,
      multiple: true,
      click: (): void => {
        dialog.warning({
          title: "提示",
          content: "确定删除选中数据?",
          positiveText: "确定",
          negativeText: "取消",
          onPositiveClick: (): void => {
            // 注意 item.id 需要修改
            // 支持批量删除
            delLoadingCabin(unref(selection).map((item) => item.id));
            // 不可批量删除
            delLoadingCabin(unref(selection)[0].id);
          },
        });
      },
    },
  ];
});
```

### watch queryModel

```typescript
watch(
  () => unref(queryModel),
  () => {
    if (unref(queryOptions).length) getList();
  },
  {
    deep: true,
  }
);
```

### table-view 事件处理

#### pageInfoEvent

```typescript
const handlePageInfo: OnPageInfo = (pageInfo) => {
  unref(pageProps).page = pageInfo.page;
  unref(pageProps).pageSize = pageInfo.pageSize;
  getList();
};
```

#### selectionEvent

```typescript
const handleSelection: OnSelection = (rows) => {
  if (rows.length) {
    selection.value = rows;
  }
};
```

#### exportSubmitEvent

```typescript
/*
  导出请求不能使用 for 循环的方式，这样容易产生并发错误，接口可能会崩溃

  解决方法：
    1.计算用户所需要导出的总数据量：dataNum = (max - min + 1) * pageSize
    2.如果 dataNum < 20000，仅调用一次接口进行导出
    3.如果 dataNum > 20000，按照 pageSize = 20000 再调用接口进行导出，减少请求次数
*/
const handleExportSubmit: OnExportSubmit = async ({ min, max }) => {
  const dataNum = unref(pageProps).pageSize! * (max - min + 1);
  const newMax = Math.ceil(dataNum / 20000);

  const newQueryModel = queryModel.value.map((item: any) => {
    return item.value instanceof Array
      ? { ...item, value: [item.value.join()] }
      : item;
  });

  if (dataNum < 20000) {
    const res = await post("url", {
      pageInfo: {
        currentPage: 1,
        pageSize: dataNum,
        isGetTotalCount: true,
      },
      queryModel: {
        items: [...newQueryModel],
      },
    });

    return { columns: unref(tableColumns), data: res.list };
  } else {
    const requestList = Array.from({ length: newMax - min + 1 }, (_, i) => {
      const currentPage = min + i;

      return post("url", {
        pageInfo: {
          currentPage,
          pageSize:
            currentPage === newMax
              ? dataNum - (currentPage - 1) * 20000
              : 20000,
        },
        queryModel: {
          items: [...newQueryModel],
        },
      });
    });

    const result = await Promise.all(requestList);
    const resData = result.flatMap((item) => item.list || []);
    return { columns: unref(tableColumns), data: resData };
  }
};
```

#### importFinishEvent

```typescript
const handleImportFinish = (): void => {
  console.log("导入完毕");
};
```

#### createEvent

```typescript
const handleCreate = (): void => {
  const compName = "loadingCabinCreate";
  const routePath = "loadingCabinCreate-new";

  useAddRoute(router, {
    name: "组托装柜-新建",
    path: routePath,
    compName: compName,
    compKey: "loadingCabinCreate",
  });

  router.replace("loadingCabinCreate-new");
};
```

#### rowClickEvent

```typescript
const rowClick = (code: string, params? any): void => {
  if (params) {
    // 注意这里的 params.row.id 可能要修改
    code = params.row.id,
  }

  const compName = 'loadingCabinEdit';
  const routePath = `${lowerFirst(compName)}-${code ?? 'new'}`;

  useAddRoute(router, {
    name: `组托装柜-${code ?? '新建'}`,
    path: routePath,
    compName: compName,
    compKey: `loadingCabinEdit${code}`,
  });

  router.replace({
    path: routePath,
    query: code ? { code: code } : {},
  });
}
```

### 获取列表分页数据

```typescript
const getList = async (): Promise<void> => {
  const { page, pageSize } = urnef(pageProps);

  const res = await post("url", {
    pageInfo: {
      currentPage: page,
      pageSize,
      sortField: "CREATED_DATE DESC",
      isGetTotalCount: true,
    },
    queryModel: {
      items: unref(queryModel),
    },
  });

  const { list, total } = res;
  tableData.value = list;
  exportProps.value.max = Math.ceil(total / pageSize!);
  pageProps.value.itemCount = total;
};
```

### 删除选中数据

```typescript
// 批量删除
const delLoadingCabin = async (ids: string[]) => {
  await post(
    "url",
    {
      ids,
    },
    {
      requestOptions: {
        globalMessage: true,
      },
    }
  );

  getList();
};

// 仅支持单行数据删除
const delLoadingCabin = async (id: string) => {
  await post(
    "url",
    {
      ids: [id],
    },
    {
      requestOptions: {
        globalMessage: true,
      },
    }
  );

  getList();
};
```

## config/index.ts 部分

### import

```typescript
import type { ColumnProps } from "@quantum-asia/qt-design/es/table/src/types";
import type { QueryOptions } from "@quantum-asia/qt-design/es/types/queryModel";
```

### queryOptions

```typescript
export const queryOptions: QueryOptions = [];
```

input 类型

```typescript
{
  compType: 'input',
  label: '组托ID',
  field: 'assembleId',
},
```

select 类型

```typescript
{
  compType: 'select',
  label: '包装类型',
  field: 'packageType',
  multiple: false,  // 多选
  // 手动写 options
  // options: [
  //   {
  //     label: '托盘',
  //     value: '托盘',
  //   },
  // ],
  // 数据字典加载 不写 options 选项
}
```

number 类型

```typescript
{
  compType: 'number',
  label: '体积',
  field: 'packageVolume',
}
```

date 类型

```typescript
{
  compType: 'date',
  label: '创建日期',
  field: 'createdDate',
}
```

### tableColumns

```typescript
export const tableColumns: ColumnProps[] = [
  {
    type: "checkbox",
    width: 60,
    resizable: false,
    fixed: "left",
    align: "center",
  },
  {
    type: "seq",
    width: 60,
    resizable: false,
    fixed: "left",
    align: "center",
  },
  {
    title: "组托ID",
    field: "assembleId",
    width: 200,
  },
  {
    title: "包装类型",
    field: "packageType",
    width: 200,
    // select 类型使用数据字典加载
    params: {
      dictionaryKey: "key",
    },
  },
];
```
