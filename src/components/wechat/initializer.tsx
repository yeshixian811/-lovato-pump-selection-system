'use client';

import { useEffect } from 'react';
import { getWechatEnvironment } from '@/lib/wechat';

/**
 * 微信环境初始化组件
 * 用于检测微信环境并初始化相关功能
 */
export function WechatInitializer() {
  useEffect(() => {
    const env = getWechatEnvironment();

    // 在微信小程序环境中，可以添加一些特殊的处理
    if (env.isMiniProgram) {
      // 设置页面标题
      document.title = '洛瓦托智能选型';

      // 可以通知小程序显示/隐藏导航栏
      if (typeof window !== 'undefined' && (window as any).wx) {
        // 通知小程序显示/隐藏导航栏
        // (window as any).wx.miniProgram.postMessage({
        //   data: {
        //     action: 'hideNavigationBar',
        //   },
        // });
      }

      // 添加微信小程序特有的样式
      document.body.classList.add('wechat-miniprogram');
    }

    if (env.isWechat) {
      // 在微信浏览器中
      document.body.classList.add('wechat-browser');
    }
  }, []);

  return null;
}

/**
 * 微信分享配置组件
 * 用于配置微信分享功能
 */
export function WechatShareConfig({
  title,
  desc,
  link,
  imgUrl,
}: {
  title: string;
  desc: string;
  link?: string;
  imgUrl?: string;
}) {
  useEffect(() => {
    // 设置默认值
    const shareTitle = title || '洛瓦托智能水泵选型系统';
    const shareDesc = desc || '快速、精准、高效 - 根据您的需求智能匹配最合适的水泵产品';
    const shareLink = link || (typeof window !== 'undefined' ? window.location.href : '');
    const shareImgUrl = imgUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/icon-512x512.png`;

    // 在微信环境中配置分享
    if (typeof window !== 'undefined' && (window as any).wx) {
      const wx = (window as any).wx;

      // 更新分享给朋友
      wx.updateAppMessageShareData({
        title: shareTitle,
        desc: shareDesc,
        link: shareLink,
        imgUrl: shareImgUrl,
        success: () => {
          console.log('微信分享配置成功');
        },
      });

      // 更新分享到朋友圈
      wx.updateTimelineShareData({
        title: shareTitle,
        link: shareLink,
        imgUrl: shareImgUrl,
        success: () => {
          console.log('朋友圈分享配置成功');
        },
      });
    }
  }, [title, desc, link, imgUrl]);

  return null;
}
