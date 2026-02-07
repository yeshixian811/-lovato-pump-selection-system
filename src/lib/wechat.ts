/**
 * 微信环境检测工具
 */

/**
 * 检测是否在微信浏览器中
 */
export function isWechatBrowser(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
}

/**
 * 检测是否在微信小程序 WebView 中
 */
export function isWechatMiniProgram(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('miniprogram') !== -1;
}

/**
 * 获取微信环境信息
 */
export function getWechatEnvironment() {
  return {
    isWechat: isWechatBrowser(),
    isMiniProgram: isWechatMiniProgram(),
    userAgent: navigator.userAgent,
  };
}

/**
 * 页面跳转（兼容微信小程序）
 * @param url 跳转目标 URL
 */
export function navigateTo(url: string) {
  if (isWechatMiniProgram()) {
    // 在小程序中，使用 wx.miniProgram.navigateTo
    if (typeof window !== 'undefined' && (window as any).wx) {
      (window as any).wx.miniProgram.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(url)}`,
      });
    } else {
      // 如果 JSSDK 未加载，使用普通跳转
      window.location.href = url;
    }
  } else {
    // 普通浏览器环境
    window.location.href = url;
  }
}

/**
 * 返回上一页（兼容微信小程序）
 */
export function navigateBack() {
  if (isWechatMiniProgram()) {
    if (typeof window !== 'undefined' && (window as any).wx) {
      (window as any).wx.miniProgram.navigateBack();
    } else {
      window.history.back();
    }
  } else {
    window.history.back();
  }
}

/**
 * 显示 Toast 提示（兼容微信小程序）
 */
export function showToast(title: string, duration: number = 2000) {
  if (isWechatMiniProgram()) {
    if (typeof window !== 'undefined' && (window as any).wx) {
      (window as any).wx.showToast({
        title,
        icon: 'none',
        duration,
      });
    } else {
      // 使用自定义 Toast
      console.log(title);
    }
  } else {
    // 使用自定义 Toast
    console.log(title);
  }
}

/**
 * 初始化微信 JSSDK
 * @param appId 微信公众号 AppID
 */
export function initWechatSDK(appId: string) {
  return new Promise((resolve, reject) => {
    if (!isWechatBrowser()) {
      resolve(false);
      return;
    }

    // 动态加载微信 JSSDK
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
    script.onload = () => {
      // 通过后端获取签名
      fetch('/api/wechat/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          url: window.location.href.split('#')[0],
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.signature) {
            (window as any).wx.config({
              debug: false,
              appId,
              timestamp: data.timestamp,
              nonceStr: data.nonceStr,
              signature: data.signature,
              jsApiList: [
                'updateAppMessageShareData',
                'updateTimelineShareData',
                'onMenuShareAppMessage',
                'onMenuShareTimeline',
              ],
            });

            (window as any).wx.ready(() => {
              resolve(true);
            });

            (window as any).wx.error((err: any) => {
              console.error('微信 JSSDK 配置失败:', err);
              reject(err);
            });
          }
        })
        .catch(reject);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * 配置微信分享
 */
export function configWechatShare(options: {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}) {
  if (typeof window !== 'undefined' && (window as any).wx) {
    const wx = (window as any).wx;

    // 更新分享给朋友
    wx.updateAppMessageShareData({
      title: options.title,
      desc: options.desc,
      link: options.link,
      imgUrl: options.imgUrl,
      success: () => {
        console.log('分享配置成功');
      },
    });

    // 更新分享到朋友圈
    wx.updateTimelineShareData({
      title: options.title,
      link: options.link,
      imgUrl: options.imgUrl,
      success: () => {
        console.log('朋友圈分享配置成功');
      },
    });
  }
}
