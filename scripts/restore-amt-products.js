// 恢复AMT系列产品数据
const AMT_PRODUCTS = [
  {
    name: "AMT 25-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "6.3",
      "扬程": "20",
      "功率": "0.75"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 32-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "12.5",
      "扬程": "20",
      "功率": "1.5"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 32-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "12.5",
      "扬程": "32",
      "功率": "2.2"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 40-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "25",
      "扬程": "20",
      "功率": "3"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 40-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "25",
      "扬程": "32",
      "功率": "4"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 40-200",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "25",
      "扬程": "50",
      "功率": "7.5"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 50-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "50",
      "扬程": "20",
      "功率": "5.5"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 50-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "50",
      "扬程": "32",
      "功率": "7.5"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 50-200",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "50",
      "扬程": "50",
      "功率": "15"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 65-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "100",
      "扬程": "20",
      "功率": "11"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 65-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "100",
      "扬程": "32",
      "功率": "18.5"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 65-200",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "100",
      "扬程": "50",
      "功率": "30"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 80-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "160",
      "扬程": "20",
      "功率": "18.5"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 80-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "160",
      "扬程": "32",
      "功率": "30"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 80-200",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "160",
      "扬程": "50",
      "功率": "45"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 100-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "250",
      "扬程": "20",
      "功率": "30"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 100-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "250",
      "扬程": "32",
      "功率": "45"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 100-200",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "250",
      "扬程": "50",
      "功率": "75"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 125-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "400",
      "扬程": "20",
      "功率": "45"
    }),
    image_url: "",
    featured: true
  },
  {
    name: "AMT 125-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: JSON.stringify({
      "流量": "400",
      "扬程": "32",
      "功率": "75"
    }),
    image_url: "",
    featured: true
  }
];

console.log('AMT系列产品数据已准备好');
console.log('总计:', AMT_PRODUCTS.length, '个产品');
console.log('\n产品列表:');
AMT_PRODUCTS.forEach((p, i) => {
  const spec = JSON.parse(p.specifications);
  console.log(`${i + 1}. ${p.name} - 流量: ${spec['流量']}m³/h, 扬程: ${spec['扬程']}m, 功率: ${spec['功率']}kW`);
});
