// 真实项目数据
export const projects = [
  {
    id: 'daily-planner',
    name: '每日计划',
    nameEn: 'Daily Planner',
    slogan: '每一天，都是更好的自己。',
    description:
      '一款把日历、日程和待办放在同一个界面里的效率 App。用户可以在月视图里查看农历、节气、节假日和日程标记，也能快速进入当天时间轴安排会议、健身和个人计划。',
    background:
      '很多用户每天会在系统日历、提醒事项和备忘录之间来回切换：日期在一个地方，任务在另一个地方，真正要做什么反而不够清楚。每日计划的目标是把「今天」重新组织起来，让用户打开后先看到日期、当天安排和下一步行动。',
    features: [
      '月视图同时展示公历、农历、节气和节假日',
      '用彩色标记提示当天是否有日程、待办或重点事项',
      '选中日期后展示会议、健身等安排的时间轴',
      '支持回到今天、搜索日期和快速新增事件',
      '底部按日历、日程、待办、我的拆分主流程'
    ],
    challenges:
      '最需要打磨的是月历视图的信息密度：既要放下农历、节假日和事件标记，又不能让格子显得拥挤。另一个重点是日期切换后的日程联动，用户点选某一天时，下方列表必须稳定、清楚并且没有跳动感。',
    platform: 'iOS',
    tech: ['SwiftUI', 'Calendar API', 'Local Data', 'Notifications'],
    accent: '#c47a36',
    gradient: ['#f0d8bd', '#6f3d1f'],
    screens: ['月历', '日程', '待办'],
    links: { appstore: '#', github: '#', web: '' }
  },
  {
    id: 'today-menu',
    name: '今日菜单',
    nameEn: 'Today Menu',
    slogan: '想吃点什么，点一下就好。',
    description:
      '一款面向点餐场景的菜单 App。用户可以按荤菜、素菜、汤类、主食和饮品筛选菜品，在单列或双列视图中浏览图片，选择后通过底部汇总栏确认订单。',
    background:
      '点餐界面最重要的是降低选择成本：用户不应该在复杂分类和长列表里迷路，也不应该点完之后忘了自己选了什么。今日菜单把筛选、浏览、选择和确认放在同一条路径里，让点餐过程更接近日常习惯。',
    features: [
      '支持全部、荤菜、素菜、汤类、主食、饮品分类筛选',
      '单列和双列视图切换，适配快速浏览和精细查看',
      '菜品卡片展示实拍图、分类和今日可点状态',
      '选中菜品后即时显示勾选状态、数量角标和底部汇总',
      '固定确认栏展示已选数量，减少漏点和重复确认'
    ],
    challenges:
      '这个项目的难点在于列表密度和选择反馈。菜品图片必须足够大，名称、分类和按钮又不能互相挤压；同时底部确认栏需要在滚动中保持稳定，确保用户始终知道当前选择了几道菜。',
    platform: '移动端 App',
    tech: ['Responsive UI', 'State Management', 'Image Loading', 'Local Cache'],
    accent: '#c63a10',
    gradient: ['#fff5ec', '#c63a10'],
    screens: ['菜单', '分类筛选', '已选确认'],
    links: { appstore: '#', googleplay: '#', github: '#' }
  },
  {
    id: 'group-ledger',
    name: '群组记账',
    nameEn: 'Group Ledger',
    slogan: '多人账单，谁垫付、谁分摊，一眼看清。',
    description:
      '一款面向旅行、合租、聚餐和家庭场景的多人记账 App。它把群组账本、待处理金额、成员参与状态和结算入口集中在首页，帮助用户快速知道自己该付、该收还是已经结清。',
    background:
      '多人 AA 最麻烦的地方不是记金额，而是后续沟通：谁先垫付、谁还没给、这笔账是否结清，经常散落在聊天记录里。群组记账把每个账单放进对应群组，并用清晰的收支状态减少反复确认。',
    features: [
      '首页推荐当前最需要处理的账单和待付金额',
      '按旅行、合租、聚餐、家庭等场景管理群组账本',
      '区分我应付、我应收和已结清状态，金额一眼可读',
      '成员头像叠加展示参与人数和账单参与者',
      '支持加入群组、快速记一笔、结算记录和扫码加入'
    ],
    challenges:
      '多人账单的状态比单人记账复杂很多：同一笔账可能包含垫付人、参与人、部分结清和不同分摊比例。设计时重点处理了状态展示和入口优先级，让用户在首页就能判断下一步该做什么。',
    platform: '移动端 App',
    tech: ['Cloud Sync', 'Role & Group Logic', 'Local Cache', 'Invite Flow'],
    accent: '#2f7df6',
    gradient: ['#2f7df6', '#0f4ec8'],
    screens: ['首页', '群组账本', '结算记录'],
    links: { googleplay: '#', github: '#' }
  }
]

export function getProject(id) {
  return projects.find((p) => p.id === id)
}
