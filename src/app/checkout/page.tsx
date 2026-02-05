"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const PLAN_NAMES = {
  basic: '基础会员',
  pro: '高级会员',
  enterprise: '企业会员',
}

const PLAN_PRICES = {
  basic: { monthly: 29, yearly: 290 },
  pro: { monthly: 99, yearly: 990 },
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') as 'basic' | 'pro' | 'enterprise' | null
  const cycle = searchParams.get('cycle') as 'monthly' | 'yearly' | null

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay' | 'card'>('wechat')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!plan || (plan !== 'enterprise' && !cycle)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>无效的订阅计划</CardTitle>
            <CardDescription>请返回选择有效的订阅计划</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/pricing'}>
              返回定价页面
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (plan === 'enterprise') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>企业会员</CardTitle>
            <CardDescription>请联系我们的销售团队获取报价</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/contact'}>
              联系销售
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const price = PLAN_PRICES[plan][cycle!]

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      // 这里应该调用后端API创建支付订单
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          billingCycle: cycle,
          paymentMethod,
        }),
      })

      if (!response.ok) {
        throw new Error('创建支付订单失败')
      }

      const data = await response.json()

      // 跳转到支付页面或显示支付二维码
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else if (data.qrCode) {
        // 显示二维码支付
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '支付失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-center">订单创建成功</CardTitle>
            <CardDescription className="text-center">
              请使用{paymentMethod === 'wechat' ? '微信' : '支付宝'}扫描下方二维码完成支付
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* 这里应该显示支付二维码 */}
            <div className="w-64 h-64 bg-gray-100 flex items-center justify-center mb-4">
              <p className="text-gray-500">支付二维码</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              订单金额: ¥{price}
            </p>
            <Button
              variant="outline"
              onClick={() => setSuccess(false)}
            >
              取消支付
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            完成订阅
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>订单信息</CardTitle>
              <CardDescription>请确认您的订阅信息并选择支付方式</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 订单详情 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 dark:text-gray-400">订阅计划</span>
                  <span className="font-bold">{PLAN_NAMES[plan]}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 dark:text-gray-400">计费周期</span>
                  <span className="font-bold">{cycle === 'monthly' ? '月付' : '年付'}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-bold">总计</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ¥{price}
                  </span>
                </div>
              </div>

              {/* 支付方式选择 */}
              <div>
                <h3 className="font-semibold mb-4">选择支付方式</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('wechat')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'wechat'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">💳</div>
                    <div className="font-semibold text-sm">微信支付</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('alipay')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'alipay'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">💵</div>
                    <div className="font-semibold text-sm">支付宝</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">💳</div>
                    <div className="font-semibold text-sm">银行卡</div>
                  </button>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 确认支付按钮 */}
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  `支付 ¥${price}`
                )}
              </Button>

              {/* 返回按钮 */}
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/pricing'}
                className="w-full"
              >
                返回选择其他方案
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
