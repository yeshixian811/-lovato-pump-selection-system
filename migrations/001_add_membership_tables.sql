-- 会员制功能数据库迁移脚本
-- 执行顺序：按顺序运行以下SQL语句

-- 第1步：创建枚举类型

-- 用户角色枚举
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 订阅状态枚举
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'past_due', 'trialing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 第2步：创建用户相关表

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'user',
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
  subscription_status subscription_status NOT NULL DEFAULT 'active',
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- 邮箱验证表
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- 密码重置表
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- 第3步：创建订阅相关表

-- 订阅计划表
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  features JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  status subscription_status NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_subscription_id VARCHAR(255),
  wechat_transaction_id VARCHAR(255),
  alipay_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 选型历史表
CREATE TABLE IF NOT EXISTS selection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flow_rate DECIMAL(10, 2),
  head DECIMAL(10, 2),
  selected_pump_id VARCHAR(100),
  pump_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_selection_history_user_id ON selection_history(user_id);
CREATE INDEX IF NOT EXISTS idx_selection_history_created_at ON selection_history(created_at DESC);

-- 使用统计表
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  selection_count INTEGER NOT NULL DEFAULT 0,
  last_reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);

-- 第4步：插入订阅计划数据

-- 先清空现有数据（如果存在）
TRUNCATE TABLE subscription_plans CASCADE;

-- 插入免费计划
INSERT INTO subscription_plans (id, name, description, price, billing_cycle, features) VALUES
(
  'free',
  '免费会员',
  '体验基础功能',
  0,
  'monthly',
  '{
    "maxSelections": 10,
    "historyRetention": 0,
    "exportFormats": [],
    "supportPriority": "none",
    "apiAccess": false,
    "maxUsers": 1
  }'::jsonb
);

-- 插入基础会员（月付）
INSERT INTO subscription_plans (id, name, description, price, billing_cycle, features) VALUES
(
  'basic',
  '基础会员',
  '适合个人用户',
  29,
  'monthly',
  '{
    "maxSelections": null,
    "historyRetention": 30,
    "exportFormats": ["csv"],
    "supportPriority": "standard",
    "apiAccess": false,
    "maxUsers": 1
  }'::jsonb
);

-- 插入基础会员（年付）
INSERT INTO subscription_plans (id, name, description, price, billing_cycle, features) VALUES
(
  'basic_yearly',
  '基础会员',
  '适合个人用户（年付优惠）',
  290,
  'yearly',
  '{
    "maxSelections": null,
    "historyRetention": 30,
    "exportFormats": ["csv"],
    "supportPriority": "standard",
    "apiAccess": false,
    "maxUsers": 1
  }'::jsonb
);

-- 插入高级会员（月付）
INSERT INTO subscription_plans (id, name, description, price, billing_cycle, features) VALUES
(
  'pro',
  '高级会员',
  '适合专业用户',
  99,
  'monthly',
  '{
    "maxSelections": null,
    "historyRetention": null,
    "exportFormats": ["csv", "excel"],
    "supportPriority": "priority",
    "apiAccess": true,
    "maxUsers": 1
  }'::jsonb
);

-- 插入高级会员（年付）
INSERT INTO subscription_plans (id, name, description, price, billing_cycle, features) VALUES
(
  'pro_yearly',
  '高级会员',
  '适合专业用户（年付优惠）',
  990,
  'yearly',
  '{
    "maxSelections": null,
    "historyRetention": null,
    "exportFormats": ["csv", "excel"],
    "supportPriority": "priority",
    "apiAccess": true,
    "maxUsers": 1
  }'::jsonb
);

-- 第5步：创建更新时间戳的触发器函数

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_stats_updated_at BEFORE UPDATE ON usage_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 第6步：完成

-- 验证数据
SELECT '用户表' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT '订阅计划表', COUNT(*) FROM subscription_plans
UNION ALL
SELECT '订阅表', COUNT(*) FROM subscriptions
UNION ALL
SELECT '选型历史表', COUNT(*) FROM selection_history
UNION ALL
SELECT '使用统计表', COUNT(*) FROM usage_stats;

SELECT '数据库迁移完成！' as status;
