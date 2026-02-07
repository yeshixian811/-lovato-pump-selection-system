# ✅ Select 组件错误已修复

## 🔍 问题原因

在 `src/app/selection/page.tsx` 中，`PUMP_TYPES` 数组的第一个选项使用了空字符串作为 value：

```typescript
const PUMP_TYPES = [
  { value: '', label: '全部类型' },  // ❌ 空字符串
  { value: 'centrifugal', label: '离心泵' },
  { value: 'vertical', label: '立式泵' },
  { value: 'submersible', label: '潜水泵' },
];
```

Radix UI 的 Select 组件不允许 Select.Item 的 value 为空字符串。

---

## 🔧 已修复的内容

### 1. 修改 PUMP_TYPES
将空字符串改为 'all'：

```typescript
const PUMP_TYPES = [
  { value: 'all', label: '全部类型' },  // ✅ 改为 'all'
  { value: 'centrifugal', label: '离心泵' },
  { value: 'vertical', label: '立式泵' },
  { value: 'submersible', label: '潜水泵' },
];
```

### 2. 修改 formData 初始值
```typescript
const [formData, setFormData] = useState<SelectionParams>({
  required_flow_rate: 50,
  required_head: 30,
  application_type: 'water_supply',
  fluid_type: 'clean_water',
  pump_type: 'all',  // ✅ 改为 'all'
  preferred_power: 7.5,
});
```

### 3. 修改 handleReset 函数
```typescript
const handleReset = () => {
  setFormData({
    required_flow_rate: 50,
    required_head: 30,
    application_type: 'water_supply',
    fluid_type: 'clean_water',
    pump_type: 'all',  // ✅ 改为 'all'
    preferred_power: 7.5,
  });
  ...
};
```

### 4. 修改 API 路由
在 `src/app/api/pump/match/route.ts` 中，当 pump_type 为 'all' 时不添加类型过滤：

```typescript
// 添加类型筛选
if (params.pump_type && params.pump_type !== 'all') {
  sql += ` AND type = '${params.pump_type}'`;
}
```

这样当用户选择"全部类型"时，会查询所有类型的水泵。

---

## 🎯 修复效果

- ✅ Select 组件不再报错
- ✅ 水泵选型页面可以正常加载
- ✅ 用户可以选择"全部类型"来查询所有水泵
- ✅ 当选择具体类型时，会按类型筛选

---

## 🚀 现在可以正常使用了

访问 http://9.129.104.56:5000/selection 或 http://localhost:5000/selection 即可看到正常的选型页面。
