/**
 * API 调用工具
 * 自动处理 Token 认证
 */

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * 从多个来源获取 Token
 */
export function getToken(): string | null {
  // 客户端环境
  if (typeof window !== 'undefined') {
    // 1. 优先从 sessionStorage 获取（管理员登录使用）
    const sessionToken = sessionStorage.getItem('admin_token');
    if (sessionToken) {
      return sessionToken;
    }

    // 2. 从 localStorage 获取（普通用户登录使用）
    const localToken = localStorage.getItem('auth_token');
    if (localToken) {
      return localToken;
    }

    // 3. 从 cookie 获取
    const cookies = document.cookie;
    const match = cookies.match(/auth_token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * 保存 Token
 */
export function setToken(token: string, storage: 'session' | 'local' = 'local'): void {
  if (storage === 'session') {
    sessionStorage.setItem('admin_token', token);
  } else {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * 清除 Token
 */
export function clearToken(): void {
  // 客户端环境
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('admin_token');
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; Path=/; Max-Age=0';
  }
}

/**
 * 统一的 API 调用函数
 * 自动添加认证 Token
 */
export async function api<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  // 构建 headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // 添加认证 Token（如果不是跳过认证）
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // 处理 401 未授权错误
    if (response.status === 401) {
      // 清除 Token
      clearToken();

      // 如果不是登录页面，跳转到登录页
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') && currentPath !== '/admin-login') {
        window.location.href = '/admin-login';
      } else if (currentPath.startsWith('/dashboard') && currentPath !== '/auth') {
        window.location.href = '/auth';
      }

      throw new Error('未登录或登录已过期');
    }

    // 处理其他 HTTP 错误
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    // 返回 JSON 数据
    return await response.json();
  } catch (error) {
    console.error('API 调用失败:', error);
    throw error;
  }
}

/**
 * GET 请求
 */
export async function get<T = any>(url: string, options?: RequestOptions): Promise<T> {
  return api<T>(url, { ...options, method: 'GET' });
}

/**
 * POST 请求
 */
export async function post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
  return api<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT 请求
 */
export async function put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
  return api<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 请求
 */
export async function del<T = any>(url: string, options?: RequestOptions): Promise<T> {
  return api<T>(url, { ...options, method: 'DELETE' });
}

/**
 * 上传文件
 */
export async function upload<T = any>(url: string, formData: FormData, options?: RequestOptions): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {};

  // 添加认证 Token
  if (token && !options?.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers,
      body: formData, // 不设置 Content-Type，让浏览器自动设置 multipart/form-data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
}
