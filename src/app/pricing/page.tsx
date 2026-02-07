"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star } from 'lucide-react'

interface PlanFeatures {
  name: string
  description: string
  price: number | null
  features: Array<{ text: string; included: boolean }>
  popular?: boolean
}

const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    name: '免费会员',
    description: '体验基础功能',
    price: 0,
    features: [
      { text: '基础选型功能', included: true },
      { text: '浏览产品库', included: true },
      { text: '每月10次选型', included: true },
      { text: '导出数据', included: false },
      { text: '保存选型历史', included: false },
      { text: '技术支持', included: false },
      { text: 'API访问', included: false },
    ],
  },
  basic: {
    name: '基础会员',
    description: '适合个人用户',
    price: 29,
    features: [
      { text: '无限次选型', included: true },
      { text: '保存选型历史（30天）', included: true },
      { text: '导出CSV格式', included: true },
      { text: '标准技术支持', included: true },
      { text: '高级功能', included: false },
      { text: 'API访问', included: false },
      { text: '优先支持', included: false },
    ],
  },
  pro: {
    name: '高级会员',
    description: '适合专业用户',
    price: 99,
    popular: true,
    features: [
      { text: '所有基础会员功能', included: true },
      { text: '永久保存选型历史', included: true },
      { text: '导出Excel格式', included: true },
      { text: '优先技术支持', included: true },
      { text: 'API访问权限', included: true },
      { text: '高级数据分析', included: true },
      { text: '定制化建议', included: false },
    ],
  },
  enterprise: {
    name: '企业会员',
    description: '适合企业用户',
    price: null,
    features: [
      { text: '所有高级会员功能', included: true },
      { text: '多用户管理', included: true },
      { text: '定制化功能', included: true },
      { text: '专属技术支持', included: true },
      { text: 'SLA服务保障', included: true },
      { text: '培训服务', included: true },
      { text: '定制化开发', included: true },
    ],
  },
}

type PlanKey = keyof typeof PLAN_FEATURES

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null)

  const getPrice = (plan: typeof PLAN_FEATURES[PlanKey]) => {
    if (plan.price === null) return '联系销售'
    
    const monthlyPrice = plan.price
    const yearlyPrice = Math.floor(monthlyPrice * 12 * 0.8) // 8折
    
    return billingCycle === 'monthly' 
      ? `¥${monthlyPrice}/月` 
      : `¥${yearlyPrice}/年`
  }

  const handleSubscribe = (planKey: PlanKey) => {
    if (planKey === 'enterprise') {
      // 打开联系表单或跳转到联系页面
      window.location.href = '/contact'
      return
    }
    
    if (planKey === 'free') {
      // 跳转到注册页面
      window.location.href = '/auth/register'
      return
    }
    
    // 跳转到支付页面
    window.location.href = `/checkout?plan=${planKey}&cycle=${billingCycle}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            选择适合您的方案
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            灵活的定价方案，满足不同需求
          </p>
          
          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-full transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              月付
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-full transition-all duration-300 relative ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              年付
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                省20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {Object.entries(PLAN_FEATURES).map(([key, plan]) => (
            <Card
              key={key}
              className={`relative transition-all duration-300 hover:shadow-2xl ${
                plan.popular
                  ? 'border-2 border-purple-500 scale-105 shadow-xl'
                  : 'border border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 shadow-lg">
                    <Star className="w-4 h-4 mr-1" />
                    最受欢迎
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pt-8 pb-6">
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  {plan.price !== null ? (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">
                        {billingCycle === 'monthly' ? plan.price : Math.floor(plan.price * 12 * 0.8)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{billingCycle === 'monthly' ? '月' : '年'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold">定制</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  onClick={() => handleSubscribe(key as PlanKey)}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600'
                  }`}
                  size="lg"
                >
                  {key === 'free' ? '免费开始' : key === 'enterprise' ? '联系销售' : '立即订阅'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
          
          <div className="space-y-6">
            {[
              {
                question: '如何升级或降级订阅？',
                answer: '您可以随时在账户设置中升级或降级订阅。升级后立即生效，降级在当前计费周期结束后生效。'
              },
              {
                question: '可以退款吗？',
                answer: '我们提供7天无理由退款。如果您对服务不满意，请联系客服申请退款。'
              },
              {
                question: '企业版如何定价？',
                answer: '企业版根据具体需求定制。请联系我们的销售团队获取专属报价。'
              },
              {
                question: '支持哪些支付方式？',
                answer: '我们支持微信支付、支付宝、银联卡以及国际信用卡。'
              },
            ].map((faq, index) => (
              <Card key={index} className="border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
