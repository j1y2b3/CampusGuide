import type { ActionCard, EntryAccess, EntryProvider, KnowledgeEntry } from '../types'

/**
 * 办事知识库。
 * 合规说明：只收录公开可查的办事路径与规则，不含需要登录才能获取的个人数据。
 * 迁移说明：换学校 = 换这份数据 + 一组 URL，前端代码零改动。
 *
 * access 字段是本项目最关键的信息：学生真正的痛点是"知道叫什么也进不去"。
 * 来源与核实情况见 docs/CHORES.md，未核实的条目 verified=false。
 */
export const kb: KnowledgeEntry[] = [
  // ── 寝室 · 生活 ───────────────────────────────────────────────
  {
    school: 'hdu',
    id: 'life.dorm.repair',
    category: '生活 / 寝室',
    triggers: ['报修', '坏了', '修一下', '漏水', '停电', '没水', '东西坏了', '应急报修'],
    title: '寝室设施报修',
    summary: '寝室设施或物品损坏时走后勤报修；情况紧急直接打应急报修电话。',
    entry: {
      channel: '杭电后勤生活（微信公众号）→ 网上报修',
      access: 'wechat',
      provider: 'hdu',
      note: '公众号内操作，浏览器无对应网页'
    },
    steps: [
      '先判断是否紧急：漏电、大面积漏水直接打应急报修 86878623',
      '微信搜「杭电后勤生活」并关注',
      '进入网上报修，填写楼栋、房间号与故障描述',
      '可拍照上传，方便师傅判断需要的工具',
      '记录工单号，等待师傅电话联系上门时间'
    ],
    materials: ['楼栋 + 房间号', '故障描述', '现场照片（建议）'],
    sla: '一般 48 小时内响应；紧急情况直接打电话',
    source: {
      title: '宿舍门告示《住宿服务指南》第 2 项',
      note: '应急报修电话 86878623'
    },
    verified: true
  },
  {
    school: 'hdu',
    id: 'life.dorm.electricity',
    category: '生活 / 寝室',
    triggers: ['电费', '电量', '欠费', '跳闸', '充电费', '寝室电', '断电', '没电了'],
    title: '寝室电费查询与充值',
    summary: '寝室是智能电表、先充值后用电，欠费会直接停电。',
    entry: {
      channel: '杭电助手 · 寝室电费查询',
      url: 'https://neo.hduhelp.com/navigation/electric-bind',
      access: 'login',
      provider: 'hduhelp'
    },
    steps: [
      '先查当前余额，确认是否已欠费',
      '核对楼栋与房间号绑定是否正确（首次需要绑定）',
      '在线充值，留意到账可能有几分钟延迟',
      '充值后仍断电，检查是否跳闸，或联系值班室复位'
    ],
    materials: ['楼栋 + 房间号', '支付账户'],
    sla: '线上充值通常几分钟内到账',
    source: { title: '宿舍门告示《住宿服务指南》第 3 项', note: '该查询服务由杭电助手提供' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'life.dorm.hot-water',
    category: '生活 / 寝室',
    triggers: ['热水', '洗澡', '没热水', '淋浴', '水不热', '几点有热水', '浴室'],
    title: '寝室洗浴热水',
    summary: '热水由集中供热供应，高楼层寝室要先放一会儿水才会出热水。',
    entry: {
      channel: '杭电后勤生活（微信公众号）→ 洗浴热水 → 公寓洗澡',
      access: 'wechat',
      provider: 'hdu'
    },
    steps: [
      '确认是否在供热时段内（以当学期通知为准）',
      '楼层较高的寝室先放约一小会儿水，淋浴头才会出热水',
      '供热时段内仍无热水，走报修流程',
      '紧急情况联系公寓热水报修'
    ],
    materials: ['手机（公众号内的洗浴入口）'],
    sla: '供热时段与报修电话每学期可能调整',
    source: { title: '宿舍门告示《住宿服务指南》第 4 项', note: '供热时段请以当学期通知为准' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'life.dorm.water-order',
    category: '生活 / 寝室',
    triggers: ['订水', '没水了', '桶装水', '送水', '饮水机', '水票'],
    title: '订桶装水',
    summary: '饮水机要先到水站办理，之后才能在线订桶装水。',
    entry: {
      channel: '杭电后勤生活（微信公众号）→ 要订水',
      access: 'wechat',
      provider: 'hdu',
      note: '饮水机需先到水站线下办理'
    },
    steps: [
      '没有饮水机的寝室，先到水站办理并缴纳押金领取机器',
      '关注「杭电后勤生活」，进入「要订水」',
      '选择寝室与数量下单，一般次日配送到寝室门口',
      '长时间不用时注意空桶回收与押金退还规则'
    ],
    materials: ['寝室号', '饮水机（没有需先办理）', '支付账户'],
    sla: '一般次日配送',
    source: { title: '宿舍门告示《住宿服务指南》第 6 项', note: '咨询电话 86919287' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'life.dorm.laundry',
    category: '生活 / 寝室',
    triggers: ['洗衣机', '洗衣服', '洗衣房', '甩干', '烘干'],
    title: '使用楼内洗衣机',
    summary: '寝室内有自助洗衣机，有偿使用，水电费自理。',
    entry: { channel: '寝室楼内自助洗衣机（现场扫码或刷卡）', access: 'none', provider: 'hdu' },
    steps: [
      '把衣物放入空机，确认没有遗留物品',
      '按机器提示扫码或刷卡支付并选择模式',
      '结束后及时取走衣物，避免占用影响他人'
    ],
    materials: ['衣物', '手机（扫码）或校园卡'],
    source: { title: '宿舍门告示《住宿服务指南》第 7 项' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'life.dorm.ac',
    category: '生活 / 寝室',
    triggers: ['空调', '租空调', '装空调', '遥控器', '押金', '空调费'],
    title: '空调租赁',
    summary: '寝室空调需要按年租赁，另缴遥控器押金，电费自理。',
    entry: {
      channel: '「尼好校园」小程序或「尼普顿智慧生活」公众号',
      access: 'wechat',
      provider: 'vendor',
      note: '第三方运营，非学校系统'
    },
    steps: [
      '确认寝室是否已有空调，没有则需要租赁',
      '在小程序/公众号选择：杭州电子科技大学 → 对应园区 → 楼栋寝室号',
      '按页面提示完成租赁并缴纳押金',
      '保存租赁协议，退租时凭协议办理'
    ],
    materials: ['寝室号', '支付账户'],
    sla: '价格以当年租赁协议为准',
    source: { title: '宿舍门告示《住宿服务指南》第 5 项', note: '联系电话 400-000-7723' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'life.dorm.clean-score',
    category: '生活 / 寝室',
    triggers: ['内务', '卫生分', '查寝', '寝室检查', '内务分'],
    title: '内务 / 卫生分值查询',
    summary: '寝室卫生检查结果可在公众号内自助查询。',
    entry: {
      channel: '杭电后勤生活 → 智慧服务 → 公寓管理 → 学生卫生',
      access: 'wechat',
      provider: 'hdu'
    },
    steps: ['关注「杭电后勤生活」', '进入 智慧服务 → 公寓管理 → 学生卫生', '查看本寝室历次检查结果'],
    materials: ['寝室信息'],
    source: { title: '宿舍门告示《住宿服务指南》第 8 项' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'life.dorm.duty-room',
    category: '生活 / 寝室',
    triggers: ['宿管', '值班室', '忘带钥匙', '借钥匙', '借工具', '针线包', '应急药'],
    title: '找值班室（借钥匙 / 工具 / 应急药）',
    summary: '本楼值班室可借钥匙与小工具，并配有应急药箱可无偿使用。',
    entry: { channel: '本楼值班室（现场）', access: 'none', provider: 'hdu' },
    steps: [
      '直接到本楼一层值班室找宿管',
      '借钥匙或工具需登记，说明用途与归还时间',
      '需要药品可取用应急药箱，用后告知宿管补充',
      '也可办理离返校登记、代收留言等事务'
    ],
    materials: ['校园卡或学生证（借物登记）'],
    source: { title: '宿舍门告示《住宿服务指南》第 1 项' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'life.repair-shop',
    category: '生活 / 寝室',
    triggers: ['修车', '自行车', '修伞', '修鞋', '电动车坏了', '便民服务'],
    title: '便民服务点（修车 / 修伞 / 修鞋）',
    summary: '生活区有便民服务点，可修非机动车、雨伞和鞋。',
    entry: { channel: '生活区 10 号北楼便民服务点', access: 'none', provider: 'hdu' },
    steps: ['把需要维修的物品带到生活区 10 号北楼', '现场咨询价格与工期', '取件时确认维修效果'],
    materials: ['需维修的物品'],
    source: { title: '宿舍门告示《住宿服务指南》第 9 项', note: '联系电话 18158422843' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'life.activity-space',
    category: '生活 / 寝室',
    triggers: ['活动室', '借场地', '开会', '社团活动', '自习空间', '架空层'],
    title: '学生活动空间',
    summary: '生活区有多处书院与共享空间可供学生活动使用。',
    entry: { channel: '各书院 / 公寓管理方（现场申请）', access: 'none', provider: 'hdu' },
    steps: [
      '就近选择：集贤居（11 号北楼）、守正书院（10 号南楼）、求新书院（5 号北楼）、休读广场（22 号楼南广场）',
      '向对应书院或公寓管理方咨询借用条件',
      '登记使用时间与用途，使用后恢复原状'
    ],
    materials: ['活动方案（部分场地需要）'],
    source: { title: '宿舍门告示《住宿服务指南》第 10 项', note: '借用流程未核实，以现场要求为准' },
    verified: false
  },

  // ── 体育 ─────────────────────────────────────────────────────
  {
    school: 'hdu',
    id: 'sport.sunrun',
    category: '体育 / 乐跑',
    triggers: ['阳光乐跑', '阳光长跑', '跑步', '打卡', '跑几次', '刷脸', '乐跑没算上'],
    title: '阳光乐跑（阳光长跑）',
    summary: '体育课考核项，刷脸开始与结束，未在终点刷脸则该次无效。',
    entry: {
      channel: '阳光长跑网站 / 杭电体联小程序',
      url: 'https://sportmeta.hdu.edu.cn/sunrun_web/',
      access: 'login',
      provider: 'hdu',
      note: '首次必须先在此网页改密码，才能登录小程序'
    },
    steps: [
      '首次使用：先打开网页端，账号与初始密码都是学号，改掉初始密码',
      '之后用「杭电体联」公众号的小程序登录',
      '到任一场地刷脸开始（一次只能选一个场地，换场地需重新刷脸）',
      '跑步过程手机保持亮屏、小程序在前台',
      '结束时务必在终点终端刷脸，否则该次不计'
    ],
    materials: ['学号', '手机', '校园卡'],
    sla: '数据异常需在 2 天内反馈，否则不予处理',
    source: {
      title: '《2026-2027年第一学期校园阳光乐跑说明》',
      note: '距离、时段、评分每学期调整，以当学期通知为准'
    },
    verified: true
  },
  {
    school: 'hdu',
    id: 'sport.health-class',
    category: '体育 / 乐跑',
    triggers: ['保健班', '体育保健课', '免修体育', '受伤', '不能上体育课', '保健课'],
    title: '体育保健班申请',
    summary: '因健康原因无法正常上体育课时申请保健班，成绩最高 65 分。',
    entry: {
      channel: '智慧杭电 → 校务服务网 → 《体育保健课申请表》',
      access: 'login',
      provider: 'hdu',
      note: '第 5-8 周改为从体育教学部网站下载表格'
    },
    steps: [
      '第 1-4 周：智慧杭电 → 校务服务网 → 在线填写申请表',
      '由学院出具健康情况说明（无固定模板，需签字盖章）后上传',
      '按流程完成审批，审批通过约 3 个工作日后在约课平台选课',
      '第 5-8 周（当学期有体育课者）：从体育教学部网站下载表格，到体育教科办选课',
      '注意不可跨校区选课，选课时间不能与其他课程冲突'
    ],
    materials: ['《体育保健课申请表》', '学院签字盖章的健康情况说明'],
    sla: '第 1-4 周申请；有体育课者可延至第 8 周',
    source: {
      title: '体育教学部通知',
      note: '保健班不需参加阳光乐跑，成绩最高 65 分'
    },
    verified: true
  },
  {
    school: 'hdu',
    id: 'sport.venue',
    category: '体育 / 场馆',
    triggers: ['体育馆', '约场地', '羽毛球', '乒乓球', '场馆', '订场地', '爽约'],
    title: '预约体育场馆（场馆速约）',
    summary: '场馆预约只能在杭电钉内完成，浏览器打不开。',
    entry: {
      channel: '杭电钉（钉钉）→ 场馆速约',
      url: 'https://sportmeta.hdu.edu.cn/book/dingtalk/',
      access: 'dingtalk',
      provider: 'hdu',
      note: '浏览器打开会卡在登录；统一身份认证入口实测 502'
    },
    steps: [
      '打开杭电钉，找到「场馆速约」应用',
      '选择运动类型与场馆，再选日期与时间段',
      '提交预约；团队预约需在 10 分钟内邀请至少 1 名同伴',
      '按预约时间到场，开始前 10 分钟至结束可刷脸或扫码入场'
    ],
    materials: ['杭电钉', '人脸或预约二维码'],
    sla: '取消需提前 1 小时；一周取消 4 次或爽约 2 次将暂停预约 30 天',
    source: { title: '场馆速约系统页面规则说明', note: '规则取自系统前端文案' },
    verified: true
  },

  // ── 第二课堂 ─────────────────────────────────────────────────
  {
    school: 'hdu',
    id: 'social.second-class',
    category: '第二课堂',
    triggers: ['第二课堂', '二课', '素拓', '志愿', '志愿时长', '积分', '星级', '讲座', '美育'],
    title: '第二课堂（青春杭电）',
    summary: '活动报名、志愿时长、积分与星级都在「青春杭电」，只能在微信内使用。',
    entry: {
      channel: '微信服务号「青春杭电」→ 第二课堂',
      url: 'https://erke.hdu.edu.cn/weixin/',
      access: 'wechat',
      provider: 'hdu',
      note: '走微信静默授权，外部浏览器无法登录'
    },
    steps: [
      '关注微信服务号「青春杭电」',
      '从菜单进入「第二课堂」',
      '在首页看「本周志愿」与「精选活动」，进入详情报名',
      '活动有报名截止时间与人数上限，额满无法报名',
      '到场后在系统内签到，签到记录进入「已签到的活动」'
    ],
    materials: ['微信', '学号（首次进入自动绑定）'],
    sla: '报名受截止时间与人数上限限制',
    source: { title: '青春杭电第二课堂平台功能', note: '部分模块显示"开发中"' },
    verified: true
  },

  // ── 教务 ─────────────────────────────────────────────────────
  {
    school: 'hdu',
    id: 'academic.timetable',
    category: '教务 / 课表',
    triggers: ['课表', '什么课', '在哪上课', '教室', '下节课', '调课'],
    title: '查看课表',
    summary: '个人课表在杭电助手里看，教务系统里也能查。',
    entry: {
      channel: '杭电助手 · 个人课表',
      url: 'https://neo.hduhelp.com/schedule',
      access: 'login',
      provider: 'hduhelp'
    },
    steps: [
      '打开杭电助手并登录',
      '进入个人课表，确认当周课表（注意调课通知）',
      '需要看全校开课情况可查「全校课程查询」'
    ],
    materials: ['学号'],
    source: { title: '校务服务网服务清单' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'academic.empty-room',
    category: '教务 / 自习',
    triggers: ['空教室', '自习', '哪有位置', '找教室', '空闲教室', '没地方自习'],
    title: '查空闲教室自习',
    summary: '按周次、星期、节次查各教学楼空闲教室，考试周前很实用。',
    entry: {
      channel: '杭电助手 · 空闲教室',
      url: 'https://neo.hduhelp.com/navigation/empty-classroom',
      access: 'login',
      provider: 'hduhelp'
    },
    steps: [
      '打开空闲教室页面',
      '选择周次、星期与节次',
      '选择教学楼查看各层空闲情况',
      '点具体教室可看该教室当天课表'
    ],
    materials: ['学号'],
    source: { title: '校务服务网服务清单', note: '该服务由杭电助手提供' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'academic.leave',
    category: '教务 / 学籍',
    triggers: ['请假', '事假', '病假', '离校', '请假条', '出入校'],
    title: '请假与出入校申请',
    summary: '请假走线上「上课请假」，离返校走「出入校申请」。',
    entry: {
      channel: '学工平台 · 上课请假',
      url: 'https://skl.hdu.edu.cn/index.html#/setting/leave',
      access: 'login',
      provider: 'hdu'
    },
    steps: [
      '确认请假天数对应的审批层级',
      '填写事由、起止时间、去向与联系方式',
      '病假附医院证明，事假说明具体原因',
      '离校与返校分别提交「出入校申请」',
      '返校后按规定销假'
    ],
    materials: ['请假申请', '证明材料（病假）'],
    source: { title: '校务服务网服务清单 + 学生手册考勤规定' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'academic.psych',
    category: '教务 / 心理',
    triggers: ['心理咨询', '心理', '压力大', '咨询预约', '情绪'],
    title: '心理咨询预约',
    summary: '心理中心可在线预约咨询，有需要时不用自己扛。',
    entry: {
      channel: '学工平台 · 心理咨询',
      url: 'https://skl.hdu.edu.cn/psy.html',
      access: 'login',
      provider: 'hdu'
    },
    steps: ['打开心理咨询页面', '按提示完成预约（可选择时间与咨询师）', '按约定时间到心理中心'],
    materials: ['学号'],
    source: { title: '校务服务网服务清单' },
    verified: false
  },
  {
    school: 'hdu',
    id: 'academic.fitness-test',
    category: '教务 / 体育',
    triggers: ['体测', '体质测试', '体测成绩', '体测没过'],
    title: '体质测试成绩查询',
    summary: '体测成绩可在线上自助查询。',
    entry: {
      channel: '体质测试成绩查询',
      url: 'https://fitness.hdu.edu.cn/h5/7/score-result',
      access: 'login',
      provider: 'hdu'
    },
    steps: ['打开查询页面并登录', '查看各项目成绩与总分', '不合格的关注补测通知'],
    materials: ['学号'],
    source: { title: '校务服务网服务清单' },
    verified: false
  },

  // ── 图书馆 ───────────────────────────────────────────────────
  {
    school: 'hdu',
    id: 'library.opac',
    category: '图书馆',
    triggers: ['借书', '有没有这本书', '馆藏', '索书号', '查书', '在架', '可以借几本'],
    title: '查某本书在不在馆',
    summary: '书目检索系统不用登录就能查，能看到馆藏复本与可借数量。',
    entry: {
      channel: '图书馆书目检索系统',
      url: 'https://opac.hdu.edu.cn/opac/presearch.php',
      /** 带书名时会自动拼成检索链接 */
      access: 'none',
      provider: 'hdu',
      note: '无需登录，可直接查看馆藏与借阅状态'
    },
    urlTemplate: 'https://opac.hdu.edu.cn/opac/openlink.php?strSearchType=title&strText={q}',
    steps: [
      '在检索框输入书名或作者，按题名检索',
      '看「馆藏复本 / 可借复本」判断能否借到',
      '记下索书号，到对应书库按号取书',
      '自助借还机刷校园卡借出，注意借期',
      '临近到期可在图书馆网站续借，被预约时无法续期'
    ],
    materials: ['书名或作者', '校园卡', '索书号'],
    sla: '借期与续借次数以图书馆规定为准',
    source: { title: '图书馆书目检索系统', url: 'https://lib.hdu.edu.cn', note: '实测可按书名检索' },
    verified: true
  },
  {
    school: 'hdu',
    id: 'library.seat',
    category: '图书馆',
    triggers: ['座位', '占座', '预约座位', '图书馆没位置', '研讨间'],
    title: '图书馆座位 / 研讨间预约',
    summary: '考试周座位紧张，需要提前在系统预约并按时签到。',
    entry: {
      channel: '图书馆空间预约系统',
      url: 'https://hdu.huitu.zhishulib.com/Content/Index/startUp',
      access: 'login',
      provider: 'vendor'
    },
    steps: [
      '在预约系统选择馆区、日期与时段',
      '到馆后在规定时间内签到，超时未签到会被释放',
      '离开较久时主动释放座位，避免被记违规',
      '多次违约可能限制后续预约'
    ],
    materials: ['校园卡 / 学号'],
    source: { title: '图书馆空间预约系统' },
    verified: false
  },

  // ── 校园服务 ─────────────────────────────────────────────────
  {
    school: 'hdu',
    id: 'campus.card',
    category: '校园卡',
    triggers: ['校园卡', '一卡通', '卡丢了', '挂失', '补卡', '余额', '消费记录'],
    title: '校园卡挂失与补办',
    summary: '卡丢了先线上挂失冻结余额，再补办新卡。',
    entry: {
      channel: '杭电助手 · 一卡通',
      url: 'https://neo.hduhelp.com/navigation/card',
      access: 'login',
      provider: 'hduhelp'
    },
    steps: [
      '立即线上挂失，冻结卡内余额',
      '确认找不到再补办，找回可解挂',
      '带证件到一卡通服务中心办理补卡',
      '补卡后部分门禁需重新同步'
    ],
    materials: ['身份证 / 学生证', '补卡工本费'],
    source: { title: '校务服务网服务清单' },
    verified: false
  },
  {
    school: 'hdu',
    id: 'campus.lost-found',
    category: '校园服务',
    triggers: ['失物招领', '丢了东西', '捡到', '丢东西'],
    title: '失物招领',
    summary: '捡到或丢了东西都可以在失物招领平台登记与查找。',
    entry: {
      channel: '失物招领平台',
      url: 'https://swzl.hdu.edu.cn/web_app/',
      access: 'login',
      provider: 'hdu'
    },
    steps: ['打开失物招领平台', '丢东西就按类别查找，捡到东西就登记', '线下领取时按平台提示携带证件'],
    materials: ['学号', '物品特征描述'],
    source: { title: '校务服务网服务清单' },
    verified: false
  },
  {
    school: 'hdu',
    id: 'campus.network',
    category: '校园网',
    triggers: ['校园网', '上网', 'wifi', '网速慢', '断网', '网络报修'],
    title: '校园网使用与报修',
    summary: '上网有问题先看是不是账号或设备问题，再走网络报修。',
    entry: {
      channel: '网络报修（信息技术中心）',
      url: 'https://smops.hdu.edu.cn/',
      access: 'login',
      provider: 'hdu'
    },
    steps: [
      '先确认是单设备问题还是整片区域问题',
      '检查账号是否欠费或在线设备数超限',
      '仍不通再提交网络报修，写清楼栋与房间号'
    ],
    materials: ['学号', '设备信息'],
    source: { title: '校务服务网服务清单 + 信息技术中心' },
    verified: false
  }
]

/** 发给模型时使用的精简索引，只给判断所需字段，降低 token 消耗与幻觉空间 */
export function kbIndexForPrompt(entries: KnowledgeEntry[]) {
  return entries.map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    triggers: e.triggers
  }))
}

/** 入口打开方式的展示文案 */
export const ACCESS_LABEL: Record<EntryAccess, string> = {
  none: '浏览器可直接打开',
  login: '需统一身份认证登录',
  dingtalk: '只能在杭电钉内打开',
  wechat: '只能在微信内打开',
  alipay: '为支付宝设计，浏览器体验差',
  mobile: '建议手机端打开'
}

export const PROVIDER_LABEL: Record<EntryProvider, string> = {
  hdu: '学校系统',
  hduhelp: '杭电助手提供',
  vendor: '第三方服务'
}

/** 从提问里抽书名/关键词，用来把检索链接填好 */
export function extractTarget(query: string): string | undefined {
  const quoted =
    query.match(/《([^》]{1,40})》/) ||
    query.match(/[“"']([^”"']{1,40})[”"']/) ||
    query.match(/想(?:去|要)?(?:借|找|看|查)\s*([^\s，。？,?]{2,30})/)
  const raw = quoted?.[1]?.trim()
  if (!raw) return undefined
  // 去掉常见疑问尾巴
  return raw.replace(/(这本|那本|的书|吗|呢|呀|吧|可以借几本|有没有)$/g, '').trim() || undefined
}

export function toActionCard(entry: KnowledgeEntry, query = '', reason?: string): ActionCard {
  const target = extractTarget(query)
  const resolvedUrl = target
    ? entry.urlTemplate?.replace('{q}', encodeURIComponent(target))
    : entry.entry.url

  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    category: entry.category,
    steps: entry.steps,
    materials: entry.materials,
    sla: entry.sla,
    entry: {
      ...entry.entry,
      url: resolvedUrl ?? entry.entry.url
    },
    source: entry.source,
    verified: entry.verified,
    reason
  }
}