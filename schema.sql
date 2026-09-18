-- 汇诚包装关联系统V3.0 产权交易竞价平台 · SQLite Schema
-- 表前缀: hc_sys_

CREATE TABLE IF NOT EXISTS hc_sys_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('ADMIN', 'BUSINESS', 'OPERATOR', 'DECIDER')),
    company_name TEXT,
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hc_sys_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hc_sys_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    listing_price REAL NOT NULL,
    listing_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'LISTING' CHECK(status IN ('LISTING', 'BIDDING', 'CLOSED', 'CANCELLED')),
    description TEXT,
    risk_factors TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hc_sys_bidders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    company_name TEXT NOT NULL,
    credit_code TEXT,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    margin_paid BOOLEAN DEFAULT FALSE,
    margin_payment_proof TEXT,
    qualification_status TEXT DEFAULT 'PENDING' CHECK(qualification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(asset_id) REFERENCES hc_sys_assets(id),
    FOREIGN KEY(user_id) REFERENCES hc_sys_users(id)
);

CREATE TABLE IF NOT EXISTS hc_sys_bid_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    bidder_id INTEGER NOT NULL,
    bid_amount REAL NOT NULL,
    bid_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'VALID' CHECK(status IN ('VALID', 'INVALID', 'WINNING')),
    FOREIGN KEY(asset_id) REFERENCES hc_sys_assets(id),
    FOREIGN KEY(bidder_id) REFERENCES hc_sys_bidders(id)
);

CREATE TABLE IF NOT EXISTS hc_sys_notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hc_sys_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES hc_sys_users(id)
);

-- 用户种子（密码哈希由 scripts/init-db.mjs 替换）
INSERT INTO hc_sys_users (username, password_hash, role, company_name, full_name) VALUES
('admin', 'PLACEHOLDER_ADMIN', 'ADMIN', '福建省产权交易中心', '系统管理员'),
('manager', 'PLACEHOLDER_MANAGER', 'BUSINESS', '福建省龙华药业有限责任公司', '业务主管李明'),
('operator', 'PLACEHOLDER_OPERATOR', 'OPERATOR', '福建省产权交易中心', '经办员王芳'),
('bidder', 'PLACEHOLDER_BIDDER', 'DECIDER', '潜在竞买人A公司', '竞买人张三');

INSERT INTO hc_sys_configs (key, value, description) VALUES
('bidding_start_time', '2026-09-09 10:00:00', '竞价开始时间'),
('bidding_end_time', '2026-09-14 17:00:00', '竞价结束时间'),
('margin_amount', '18954', '保证金金额（元）'),
('min_bid_increment', '100', '最小竞价加价幅度（元）'),
('official_system_url', 'https://biz.fjcqjy.com/#/login', '产权交易中心官方交易系统'),
('site_banner', '汇诚包装关联系统V3.0 挂牌价 ¥18,954 · 网络竞价进行中', '首页置顶公告摘要');

INSERT INTO hc_sys_assets (project_number, title, seller_name, listing_price, listing_date, end_date, status, description, risk_factors, location) VALUES
('GR2026FJ1000153-24', '汇诚包装关联系统V3.0', '福建省龙华药业有限责任公司', 18954.00, '2026-09-09', '2026-09-14', 'BIDDING',
 '本次转让活动通过福建省产权交易中心有限公司交易系统实施。标的为汇诚包装关联系统V3.0，以现状为准。竞买人应当在报名前对转让标的进行尽职调查（看样），并在充分调查的前提下报名参与竞价。',
 '{"tech_debt":"medium","license_expiry":"2027-01-01","hardware_included":false,"as_is":true,"disclaimer":"产权交易机构、转让方对转让标的品质和状况不作担保"}',
 '福建省福州市仓山区建新镇高宅路142号');

INSERT INTO hc_sys_bidders (asset_id, user_id, company_name, credit_code, contact_person, contact_phone, margin_paid, qualification_status) VALUES
((SELECT id FROM hc_sys_assets WHERE project_number = 'GR2026FJ1000153-24'),
 (SELECT id FROM hc_sys_users WHERE username = 'bidder'),
 '潜在竞买人A公司', '91350100MA8XXXXX0X', '张三', '13800138000', 1, 'APPROVED');

INSERT INTO hc_sys_bid_records (asset_id, bidder_id, bid_amount, bid_time) VALUES
((SELECT id FROM hc_sys_assets WHERE project_number = 'GR2026FJ1000153-24'),
 (SELECT id FROM hc_sys_bidders WHERE user_id = (SELECT id FROM hc_sys_users WHERE username = 'bidder')),
 19000.00, '2026-09-09 10:15:00'),
((SELECT id FROM hc_sys_assets WHERE project_number = 'GR2026FJ1000153-24'),
 (SELECT id FROM hc_sys_bidders WHERE user_id = (SELECT id FROM hc_sys_users WHERE username = 'bidder')),
 19100.00, '2026-09-09 11:30:00'),
((SELECT id FROM hc_sys_assets WHERE project_number = 'GR2026FJ1000153-24'),
 (SELECT id FROM hc_sys_bidders WHERE user_id = (SELECT id FROM hc_sys_users WHERE username = 'bidder')),
 19200.00, '2026-09-10 09:05:00');

INSERT INTO hc_sys_notices (title, content, is_pinned, published_at) VALUES
('关于汇诚包装关联系统V3.0挂牌转让的公告', '福建省龙华药业有限责任公司拟转让其持有的汇诚包装关联系统V3.0，挂牌价格18,954元人民币（含税），挂牌期自2026-09-09起5个工作日。交易方式为网络竞价。', 1, '2026-09-09 08:00:00'),
('竞买人报名与保证金缴纳须知', '竞买人须在公告截止当日17:00前通过交易系统或微信小程序完成线上报名并交纳交易保证金，否则视为报名无效。报名完成后通过资格审核的竞买人方可参与竞价。', 1, '2026-09-09 08:30:00'),
('现场看样预约安排', '标的存放于福建省福州市仓山区建新镇高宅路142号。竞买人可联系经办人员预约现场看样，放弃尽职调查均视为已全面行使知情权。', 0, '2026-09-09 09:00:00');

INSERT INTO hc_sys_messages (user_id, title, body, is_read) VALUES
((SELECT id FROM hc_sys_users WHERE username = 'bidder'), '资格审核通过', '您提交的竞买人资格申请已审核通过，保证金已确认到账，可参与网络竞价。', 0),
((SELECT id FROM hc_sys_users WHERE username = 'bidder'), '竞价提醒', '竞价将于挂牌期内进行，最小加价幅度为100元，请及时关注当前最高价。', 1);
