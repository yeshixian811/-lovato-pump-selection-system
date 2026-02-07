-- 水泵选型系统数据库表
-- 执行命令: psql -U postgres -d lovato_pump_selection -f migrations/002_create_pump_tables.sql

-- 1. 水泵产品表
CREATE TABLE IF NOT EXISTS pumps (
    id SERIAL PRIMARY KEY,
    model VARCHAR(50) UNIQUE NOT NULL,  -- 型号
    name VARCHAR(100) NOT NULL,  -- 产品名称
    brand VARCHAR(50) DEFAULT 'Lovato',  -- 品牌
    type VARCHAR(50) NOT NULL,  -- 类型：centrifugal/vertical/submersible
    series VARCHAR(50),  -- 系列
    description TEXT,  -- 产品描述
    
    -- 性能参数
    max_flow_rate DECIMAL(10,2),  -- 最大流量 (m³/h)
    min_flow_rate DECIMAL(10,2),  -- 最小流量 (m³/h)
    max_head DECIMAL(10,2),  -- 最大扬程 (m)
    min_head DECIMAL(10,2),  -- 最小扬程 (m)
    rated_power DECIMAL(10,2),  -- 额定功率 (kW)
    rated_speed INTEGER,  -- 额定转速 (rpm)
    efficiency DECIMAL(5,2),  -- 效率 (%)
    
    -- 电气参数
    voltage VARCHAR(20),  -- 电压 (V)
    frequency INTEGER,  -- 频率 (Hz)
    current DECIMAL(10,2),  -- 电流 (A)
    power_factor DECIMAL(3,2),  -- 功率因数
    
    -- 物理参数
    inlet_diameter DECIMAL(10,2),  -- 进口直径 (mm)
    outlet_diameter DECIMAL(10,2),  -- 出口直径 (mm)
    weight DECIMAL(10,2),  -- 重量 (kg)
    dimensions VARCHAR(100),  -- 尺寸 (长x宽x高)
    
    -- 材质和防护
    casing_material VARCHAR(50),  -- 泵体材质
    impeller_material VARCHAR(50),  -- 叶轮材质
    seal_type VARCHAR(50),  -- 密封形式
    protection_level VARCHAR(20),  -- 防护等级
    insulation_class VARCHAR(20),  -- 绝缘等级
    
    -- 应用场景
    applications TEXT[],  -- 适用场景数组
    fluid_types TEXT[],  -- 适用流体类型
    max_temperature DECIMAL(5,2),  -- 最高温度 (°C)
    min_temperature DECIMAL(5,2),  -- 最低温度 (°C)
    max_viscosity DECIMAL(10,2),  -- 最大粘度 (mPa·s)
    
    -- 价格和库存
    price DECIMAL(10,2),  -- 价格
    currency VARCHAR(10) DEFAULT 'CNY',  -- 货币
    in_stock BOOLEAN DEFAULT true,  -- 是否有货
    stock_quantity INTEGER DEFAULT 0,  -- 库存数量
    
    -- SEO和展示
    is_active BOOLEAN DEFAULT true,  -- 是否上架
    is_featured BOOLEAN DEFAULT false,  -- 是否推荐
    image_url TEXT,  -- 产品图片URL
    spec_sheet_url TEXT,  -- 规格书URL
    manual_url TEXT,  -- 说明书URL
    
    -- 排序和统计
    sort_order INTEGER DEFAULT 0,  -- 排序
    view_count INTEGER DEFAULT 0,  -- 浏览次数
    selection_count INTEGER DEFAULT 0,  -- 被选型次数
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT check_flow_rate CHECK (max_flow_rate >= min_flow_rate),
    CONSTRAINT check_head CHECK (max_head >= min_head),
    CONSTRAINT check_power CHECK (rated_power > 0),
    CONSTRAINT check_efficiency CHECK (efficiency >= 0 AND efficiency <= 100)
);

-- 2. 水泵性能曲线数据表
CREATE TABLE IF NOT EXISTS pump_performance_curves (
    id SERIAL PRIMARY KEY,
    pump_id INTEGER REFERENCES pumps(id) ON DELETE CASCADE,
    flow_rate DECIMAL(10,2) NOT NULL,  -- 流量 (m³/h)
    head DECIMAL(10,2) NOT NULL,  -- 扬程 (m)
    power DECIMAL(10,2),  -- 功率 (kW)
    efficiency DECIMAL(5,2),  -- 效率 (%)
    npsh DECIMAL(10,2),  -- NPSH (m)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 用户选型记录表
CREATE TABLE IF NOT EXISTS selection_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),  -- 会话ID（用于匿名用户）
    
    -- 用户输入参数
    required_flow_rate DECIMAL(10,2),  -- 所需流量
    required_head DECIMAL(10,2),  -- 所需扬程
    application_type VARCHAR(50),  -- 应用类型
    fluid_type VARCHAR(50),  -- 流体类型
    fluid_temperature DECIMAL(5,2),  -- 流体温度
    pump_type VARCHAR(50),  -- 水泵类型
    
    -- 选型结果
    matched_pump_id INTEGER REFERENCES pumps(id),
    match_score DECIMAL(5,2),  -- 匹配度分数 (0-100)
    alternatives TEXT[],  -- 备选水泵ID数组
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_pumps_type ON pumps(type);
CREATE INDEX IF NOT EXISTS idx_pumps_series ON pumps(series);
CREATE INDEX IF NOT EXISTS idx_pumps_flow_range ON pumps(min_flow_rate, max_flow_rate);
CREATE INDEX IF NOT EXISTS idx_pumps_head_range ON pumps(min_head, max_head);
CREATE INDEX IF NOT EXISTS idx_pumps_power ON pumps(rated_power);
CREATE INDEX IF NOT EXISTS idx_pumps_applications ON pumps USING GIN(applications);
CREATE INDEX IF NOT EXISTS idx_pumps_fluid_types ON pumps USING GIN(fluid_types);
CREATE INDEX IF NOT EXISTS idx_pumps_active ON pumps(is_active);
CREATE INDEX IF NOT EXISTS idx_pump_performance_pump_id ON pump_performance_curves(pump_id);
CREATE INDEX IF NOT EXISTS idx_selection_records_user_id ON selection_records(user_id);
CREATE INDEX IF NOT EXISTS idx_selection_records_session_id ON selection_records(session_id);
CREATE INDEX IF NOT EXISTS idx_selection_records_created_at ON selection_records(created_at);

-- 5. 创建更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pumps_updated_at BEFORE UPDATE ON pumps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE pumps IS '水泵产品表';
COMMENT ON TABLE pump_performance_curves IS '水泵性能曲线数据表';
COMMENT ON TABLE selection_records IS '用户选型记录表';
