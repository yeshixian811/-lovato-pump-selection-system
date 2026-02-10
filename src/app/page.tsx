'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Droplets, ArrowRight } from "lucide-react";
import { HomeNavbar } from "@/components/HomeNavbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HomeNavbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-12">
            洛瓦托水泵选型系统
          </h1>

          <div className="grid gap-8 md:grid-cols-1 max-w-md mx-auto">
            {/* 选型工具 */}
            <Link href="/selection">
              <Card className="hover:shadow-xl transition-all cursor-pointer h-full">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Calculator className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    智能选型
                  </h2>
                  <p className="text-gray-600 mb-6">
                    输入流量和扬程参数，智能匹配最适合的水泵产品
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    开始选型
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
