-- 水泵样本数据
-- 执行命令: psql -U postgres -d lovato_pump_selection -f migrations/003_insert_sample_pumps.sql

-- 清空现有数据
TRUNCATE TABLE pump_performance_curves CASCADE;
TRUNCATE TABLE selection_records CASCADE;
TRUNCATE TABLE pumps CASCADE;

-- 重置序列
ALTER SEQUENCE pumps_id_seq RESTART WITH 1;
ALTER SEQUENCE pump_performance_curves_id_seq RESTART WITH 1;
ALTER SEQUENCE selection_records_id_seq RESTART WITH 1;

-- 插入水泵样本数据
INSERT INTO pumps (model, name, brand, type, series, description, max_flow_rate, min_flow_rate, max_head, min_head, rated_power, rated_speed, efficiency, voltage, frequency, current, power_factor, inlet_diameter, outlet_diameter, weight, dimensions, casing_material, impeller_material, seal_type, protection_level, insulation_class, applications, fluid_types, max_temperature, min_temperature, max_viscosity, price, currency, in_stock, stock_quantity, is_active, is_featured) VALUES
-- 离心泵系列
('LVP-50-125', 'Lovato 离心泵 50-125', 'Lovato', 'centrifugal', 'Standard', '标准离心泵，适用于供水和工业循环', 12.5, 6.3, 20, 18, 1.5, 2900, 72, '380V', 50, 3.2, 0.85, 50, 40, 25, '420x220x260', '铸铁', '青铜', '机械密封', 'IP54', 'F', ARRAY['water_supply', 'industrial', 'irrigation'], ARRAY['clean_water'], 80, 0, 50, 1200, 'CNY', true, 20, true, true),

('LVP-50-160', 'Lovato 离心泵 50-160', 'Lovato', 'centrifugal', 'Standard', '标准离心泵，适用于供水和工业循环', 25, 12.5, 32, 28, 3, 2900, 75, '380V', 50, 6.1, 0.86, 50, 40, 35, '450x240x280', '铸铁', '青铜', '机械密封', 'IP54', 'F', ARRAY['water_supply', 'industrial', 'irrigation'], ARRAY['clean_water'], 80, 0, 50, 1800, 'CNY', true, 15, true, true),

('LVP-65-160', 'Lovato 离心泵 65-160', 'Lovato', 'centrifugal', 'Standard', '标准离心泵，适用于供水和工业循环', 50, 25, 32, 28, 5.5, 2900, 76, '380V', 50, 10.5, 0.87, 65, 50, 45, '480x260x300', '铸铁', '青铜', '机械密封', 'IP54', 'F', ARRAY['water_supply', 'industrial', 'irrigation'], ARRAY['clean_water'], 80, 0, 50, 2500, 'CNY', true, 10, true, true),

('LVP-65-200', 'Lovato 离心泵 65-200', 'Lovato', 'centrifugal', 'Standard', '标准离心泵，适用于供水和工业循环', 50, 25, 50, 45, 7.5, 2900, 74, '380V', 50, 14.5, 0.86, 65, 50, 55, '500x280x320', '铸铁', '青铜', '机械密封', 'IP54', 'F', ARRAY['water_supply', 'industrial', 'irrigation'], ARRAY['clean_water'], 80, 0, 50, 3200, 'CNY', true, 8, true, true),

('LVP-80-200', 'Lovato 离心泵 80-200', 'Lovato', 'centrifugal', 'Standard', '标准离心泵，适用于供水和工业循环', 100, 50, 50, 45, 15, 2900, 78, '380V', 50, 28, 0.88, 80, 65, 80, '550x300x350', '铸铁', '青铜', '机械密封', 'IP54', 'F', ARRAY['water_supply', 'industrial', 'irrigation'], ARRAY['clean_water'], 80, 0, 50, 5800, 'CNY', true, 5, true, true),

('LVP-80-250', 'Lovato 离心泵 80-250', 'Lovato', 'centrifugal', 'Standard', '标准离心泵，适用于供水和工业循环', 100, 50, 80, 70, 22, 2900, 76, '380V', 50, 42, 0.87, 80, 65, 110, '600x320x380', '铸铁', '青铜', '机械密封', 'IP54', 'F', ARRAY['water_supply', 'industrial', 'irrigation'], ARRAY['clean_water'], 80, 0, 50, 7500, 'CNY', true, 3, true, true),

('LVP-100-200', 'Lovato 离心泵 100-200', 'Lovato', 'centrifugal', 'Standard', '标准离心泵，适用于供水和工业循环', 160, 80, 50, 45, 22, 2900, 79, '380V', 50, 42, 0.88, 100, 80, 120, '650x340x400', '铸铁', '青铜', '机械密封', 'IP54', 'F', ARRAY['water_supply', 'industrial', 'irrigation'], ARRAY['clean_water'], 80, 0, 50, 8200, 'CNY', true, 5, true, true),

('LVP-100-250', 'Lovato 离心泵 100-250', 'Lovato', 'centrifugal', 'Standard', '标准离心泵，适用于供水和工业循环', 160, 80, 80, 70, 37, 2900, 77, '380V', 50, 70, 0.87, 100, 80, 150, '700x360x420', '铸铁', '青铜', '机械密封', 'IP54', 'F', ARRAY['water_supply', 'industrial', 'irrigation'], ARRAY['clean_water'], 80, 0, 50, 12000, 'CNY', true, 3, true, true),

('LVP-125-250', 'Lovato 离心泵 125-250', 'Lovato', 'centrifugal', 'Standard', '标准离心泵，适用于供水和工业循环', 250, 125, 80, 70, 55, 2900, 78, '380V', 50, 105, 0.87, 125, 100, 180, '750x380x450', '铸铁', '青铜', '机械密封', 'IP54', 'F', ARRAY['water_supply', 'industrial', 'irrigation'], ARRAY['clean_water'], 80, 0, 50, 18000, 'CNY', true, 2, true, true),

('LVP-125-315', 'Lovato 离心泵 125-315', 'Lovato', 'centrifugal', 'Standard', '标准离心泵，适用于供水和工业循环', 250, 125, 125, 110, 75, 2900, 76, '380V', 50, 142, 0.86, 125, 100, 220, '800x400x480', '铸铁', '青铜', '机械密封', 'IP54', 'F', ARRAY['water_supply', 'industrial', 'irrigation'], ARRAY['clean_water'], 80, 0, 50, 25000, 'CNY', true, 1, true, true),

-- 立式泵系列
('LVV-40-100', 'Lovato 立式泵 40-100', 'Lovato', 'vertical', 'Vertical', '立式多级泵，适用于高层供水', 6, 3, 15, 12, 0.75, 2900, 68, '380V', 50, 1.8, 0.83, 40, 32, 20, '300x150x400', '不锈钢', '不锈钢', '机械密封', 'IP55', 'F', ARRAY['water_supply', 'hvac', 'fire_protection'], ARRAY['clean_water', 'sea_water'], 90, 0, 30, 2500, 'CNY', true, 15, true, true),

('LVV-40-125', 'Lovato 立式泵 40-125', 'Lovato', 'vertical', 'Vertical', '立式多级泵，适用于高层供水', 6, 3, 25, 22, 1.5, 2900, 70, '380V', 50, 3.5, 0.84, 40, 32, 25, '300x150x450', '不锈钢', '不锈钢', '机械密封', 'IP55', 'F', ARRAY['water_supply', 'hvac', 'fire_protection'], ARRAY['clean_water', 'sea_water'], 90, 0, 30, 3200, 'CNY', true, 12, true, true),

('LVV-50-100', 'Lovato 立式泵 50-100', 'Lovato', 'vertical', 'Vertical', '立式多级泵，适用于高层供水', 10, 5, 15, 12, 1.5, 2900, 72, '380V', 50, 3.8, 0.85, 50, 40, 25, '350x180x420', '不锈钢', '不锈钢', '机械密封', 'IP55', 'F', ARRAY['water_supply', 'hvac', 'fire_protection'], ARRAY['clean_water', 'sea_water'], 90, 0, 30, 3500, 'CNY', true, 10, true, true),

('LVV-50-150', 'Lovato 立式泵 50-150', 'Lovato', 'vertical', 'Vertical', '立式多级泵，适用于高层供水', 10, 5, 30, 27, 3, 2900, 71, '380V', 50, 7.2, 0.84, 50, 40, 35, '350x180x500', '不锈钢', '不锈钢', '机械密封', 'IP55', 'F', ARRAY['water_supply', 'hvac', 'fire_protection'], ARRAY['clean_water', 'sea_water'], 90, 0, 30, 4500, 'CNY', true, 8, true, true),

('LVV-65-100', 'Lovato 立式泵 65-100', 'Lovato', 'vertical', 'Vertical', '立式多级泵，适用于高层供水', 25, 12, 15, 12, 3, 2900, 74, '380V', 50, 7.5, 0.86, 65, 50, 40, '400x200x450', '不锈钢', '不锈钢', '机械密封', 'IP55', 'F', ARRAY['water_supply', 'hvac', 'fire_protection'], ARRAY['clean_water', 'sea_water'], 90, 0, 30, 5200, 'CNY', true, 6, true, true),

('LVV-65-150', 'Lovato 立式泵 65-150', 'Lovato', 'vertical', 'Vertical', '立式多级泵，适用于高层供水', 25, 12, 45, 40, 7.5, 2900, 73, '380V', 50, 18.5, 0.85, 65, 50, 60, '400x200x580', '不锈钢', '不锈钢', '机械密封', 'IP55', 'F', ARRAY['water_supply', 'hvac', 'fire_protection'], ARRAY['clean_water', 'sea_water'], 90, 0, 30, 7800, 'CNY', true, 5, true, true),

('LVV-80-120', 'Lovato 立式泵 80-120', 'Lovato', 'vertical', 'Vertical', '立式多级泵，适用于高层供水', 50, 25, 25, 22, 7.5, 2900, 75, '380V', 50, 18.8, 0.86, 80, 65, 65, '450x220x500', '不锈钢', '不锈钢', '机械密封', 'IP55', 'F', ARRAY['water_supply', 'hvac', 'fire_protection'], ARRAY['clean_water', 'sea_water'], 90, 0, 30, 8500, 'CNY', true, 4, true, true),

('LVV-80-180', 'Lovato 立式泵 80-180', 'Lovato', 'vertical', 'Vertical', '立式多级泵，适用于高层供水', 50, 25, 60, 55, 15, 2900, 74, '380V', 50, 37, 0.85, 80, 65, 95, '450x220x650', '不锈钢', '不锈钢', '机械密封', 'IP55', 'F', ARRAY['water_supply', 'hvac', 'fire_protection'], ARRAY['clean_water', 'sea_water'], 90, 0, 30, 15000, 'CNY', true, 3, true, true),

-- 潜水泵系列
('LVS-50-15', 'Lovato 潜水泵 50-15', 'Lovato', 'submersible', 'WQ', '潜水排污泵，适用于污水处理和排水', 25, 10, 15, 10, 3, 2900, 72, '380V', 50, 6.5, 0.85, 50, 50, 45, '400x400x600', '铸铁', '铸铁', '机械密封', 'IP68', 'F', ARRAY['drainage', 'sewage', 'industrial'], ARRAY['sewage', 'slurry'], 60, 0, 100, 4500, 'CNY', true, 8, true, true),

('LVS-50-22', 'Lovato 潜水泵 50-22', 'Lovato', 'submersible', 'WQ', '潜水排污泵，适用于污水处理和排水', 25, 10, 22, 18, 4, 2900, 71, '380V', 50, 8.5, 0.84, 50, 50, 50, '400x400x620', '铸铁', '铸铁', '机械密封', 'IP68', 'F', ARRAY['drainage', 'sewage', 'industrial'], ARRAY['sewage', 'slurry'], 60, 0, 100, 5200, 'CNY', true, 6, true, true),

('LVS-65-15', 'Lovato 潜水泵 65-15', 'Lovato', 'submersible', 'WQ', '潜水排污泵，适用于污水处理和排水', 50, 20, 15, 10, 7.5, 2900, 73, '380V', 50, 15, 0.85, 65, 65, 70, '450x450x650', '铸铁', '铸铁', '机械密封', 'IP68', 'F', ARRAY['drainage', 'sewage', 'industrial'], ARRAY['sewage', 'slurry'], 60, 0, 100, 7800, 'CNY', true, 5, true, true),

('LVS-65-28', 'Lovato 潜水泵 65-28', 'Lovato', 'submersible', 'WQ', '潜水排污泵，适用于污水处理和排水', 50, 20, 28, 24, 11, 2900, 72, '380V', 50, 22, 0.84, 65, 65, 85, '450x450x700', '铸铁', '铸铁', '机械密封', 'IP68', 'F', ARRAY['drainage', 'sewage', 'industrial'], ARRAY['sewage', 'slurry'], 60, 0, 100, 10500, 'CNY', true, 4, true, true),

('LVS-80-15', 'Lovato 潜水泵 80-15', 'Lovato', 'submersible', 'WQ', '潜水排污泵，适用于污水处理和排水', 100, 40, 15, 10, 15, 2900, 74, '380V', 50, 30, 0.86, 80, 80, 110, '500x500x700', '铸铁', '铸铁', '机械密封', 'IP68', 'F', ARRAY['drainage', 'sewage', 'industrial'], ARRAY['sewage', 'slurry'], 60, 0, 100, 15000, 'CNY', true, 3, true, true),

('LVS-80-30', 'Lovato 潜水泵 80-30', 'Lovato', 'submersible', 'WQ', '潜水排污泵，适用于污水处理和排水', 100, 40, 30, 26, 22, 2900, 73, '380V', 50, 44, 0.85, 80, 80, 130, '500x500x750', '铸铁', '铸铁', '机械密封', 'IP68', 'F', ARRAY['drainage', 'sewage', 'industrial'], ARRAY['sewage', 'slurry'], 60, 0, 100, 22000, 'CNY', true, 2, true, true),

('LVS-100-15', 'Lovato 潜水泵 100-15', 'Lovato', 'submersible', 'WQ', '潜水排污泵，适用于污水处理和排水', 200, 80, 15, 10, 22, 2900, 75, '380V', 50, 44, 0.86, 100, 100, 150, '600x600x800', '铸铁', '铸铁', '机械密封', 'IP68', 'F', ARRAY['drainage', 'sewage', 'industrial'], ARRAY['sewage', 'slurry'], 60, 0, 100, 28000, 'CNY', true, 2, true, true),

('LVS-100-25', 'Lovato 潜水泵 100-25', 'Lovato', 'submersible', 'WQ', '潜水排污泵，适用于污水处理和排水', 200, 80, 25, 22, 37, 2900, 74, '380V', 50, 74, 0.85, 100, 100, 180, '600x600x850', '铸铁', '铸铁', '机械密封', 'IP68', 'F', ARRAY['drainage', 'sewage', 'industrial'], ARRAY['sewage', 'slurry'], 60, 0, 100, 45000, 'CNY', true, 1, true, true);

-- 插入性能曲线数据（示例）
INSERT INTO pump_performance_curves (pump_id, flow_rate, head, power, efficiency, npsh) VALUES
-- LVP-50-125
(1, 6.3, 20, 1.4, 68, 2.5),
(1, 8.0, 19.5, 1.45, 70, 2.8),
(1, 10.0, 19, 1.5, 72, 3.0),
(1, 12.5, 18, 1.55, 71, 3.2),

-- LVP-50-160
(2, 12.5, 32, 2.7, 73, 2.8),
(2, 16.0, 31, 2.85, 75, 3.0),
(2, 20.0, 30, 3.0, 75, 3.2),
(2, 25.0, 28, 3.15, 73, 3.5),

-- LVP-65-160
(3, 25, 32, 4.8, 74, 3.0),
(3, 32, 31, 5.1, 76, 3.2),
(3, 40, 30, 5.5, 76, 3.5),
(3, 50, 28, 5.8, 74, 3.8),

-- LVS-50-15
(18, 10, 18, 2.5, 68, 3.0),
(18, 15, 16, 2.8, 72, 3.2),
(18, 20, 14, 3.0, 72, 3.5),
(18, 25, 10, 3.1, 68, 4.0),

-- LVV-50-100
(11, 5, 18, 1.2, 68, 2.5),
(11, 6, 17, 1.3, 70, 2.7),
(11, 8, 15, 1.4, 72, 3.0),
(11, 10, 12, 1.5, 70, 3.2);

-- 显示插入的数据
SELECT '插入完成！水泵数量: ' || COUNT(*) AS info FROM pumps;
SELECT '性能曲线数据点数量: ' || COUNT(*) AS info FROM pump_performance_curves;
