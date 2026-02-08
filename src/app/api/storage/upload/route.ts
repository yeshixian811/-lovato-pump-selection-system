import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

// 安全警告：accessKey 和 secretKey 需要从环境变量中配置
// 当前为空字符串，文件上传功能可能无法正常工作
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: process.env.COZE_BUCKET_ACCESS_KEY || "",
  secretKey: process.env.COZE_BUCKET_SECRET_KEY || "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未找到文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，仅支持 JPG、PNG、GIF、WebP 格式' },
        { status: 400 }
      );
    }

    // 验证文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过限制，最大支持 5MB' },
        { status: 400 }
      );
    }

    // 将文件转换为 Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const ext = file.name.split('.').pop();
    const fileName = `pump-images/${timestamp}_${random}.${ext}`;

    // 上传文件到对象存储
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: file.type,
    });

    // 生成签名 URL
    const url = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 86400 * 30, // 30 天有效期
    });

    return NextResponse.json({
      success: true,
      url: url,
      key: fileKey,
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { error: '文件上传失败', message: (error as Error).message },
      { status: 500 }
    );
  }
}
