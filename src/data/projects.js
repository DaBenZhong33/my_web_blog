// 占位项目数据 —— 之后替换为你的真实 APP 信息即可
export const projects = [
  {
    id: 'memento',
    name: '拾光日记',
    nameEn: 'Memento',
    slogan: '把每一天，写成一页故事。',
    description:
      '一款极简图文日记 App。没有社交、没有信息流，只有你和今天。支持照片、心情标签与时光机回顾。',
    background:
      '市面上大多数日记应用都在做社交和内容推荐，我只是想找一个安静的地方记录生活。于是花了三个周末做了拾光日记——打开即写，写完即走。',
    features: [
      '打开即写的极简编辑器，支持图文混排',
      '心情标签与天气自动记录',
      '时光机：随机回顾那年今日',
      'iCloud 同步，数据完全私有',
      '夜间模式与多款纸张主题'
    ],
    challenges:
      '最大的挑战是富文本编辑器在 SwiftUI 下的性能优化，长日记滚动时的卡顿问题最终通过自绘 TextKit 2 排版管线解决。',
    platform: 'iOS',
    tech: ['SwiftUI', 'SwiftData', 'CloudKit', 'TextKit 2'],
    accent: '#6798ff',
    gradient: ['#2b3a5e', '#141824'],
    screens: ['日记流', '编辑器', '时光机'],
    links: { appstore: '#', github: '#', web: '' }
  },
  {
    id: 'focus-isle',
    name: '番茄岛',
    nameEn: 'Focus Isle',
    slogan: '专注 25 分钟，种出一座岛。',
    description:
      '把番茄钟做成一场养成游戏：每一次专注都会在你的小岛上种下植物，分心则会让岛屿枯萎。支持跨设备同步专注数据。',
    background:
      '我试过十几个番茄钟 App，坚持下来的没有一周。后来我意识到问题不在计时，而在反馈——专注需要即时的、看得见的奖励。番茄岛把游戏化做到了极致。',
    features: [
      '番茄钟 + 岛屿养成玩法，30+ 种可解锁植物',
      '严格模式：切出 App 即判定分心',
      '专注热力图与周报统计',
      'iOS / Android 双端数据同步',
      '白噪音与翻页时钟主题'
    ],
    challenges:
      '双端同步的冲突合并是最难的部分，最终采用基于 CRDT 的增量同步方案，弱网环境下也能保证数据不丢。',
    platform: 'iOS / Android',
    tech: ['Flutter', 'Riverpod', 'Flame', 'Supabase'],
    accent: '#e0b84d',
    gradient: ['#4a3d1e', '#1c1a12'],
    screens: ['专注中', '我的岛屿', '统计'],
    links: { appstore: '#', googleplay: '#', github: '#' }
  },
  {
    id: 'oneledger',
    name: '一本账',
    nameEn: 'OneLedger',
    slogan: '三秒记一笔，账目清清楚楚。',
    description:
      '一款主打「快」的记账 App：启动即记账，三秒完成一笔。自动归类、预算提醒、多账本，全部离线可用。',
    background:
      '记账失败的理由只有一个：太麻烦。一本账把记账路径压缩到三步以内，没有开屏广告，没有理财推荐，回归记账本身。',
    features: [
      '三秒快速记账流程，支持模板',
      '自动分类与月度预算提醒',
      '多账本：个人 / 家庭 / 旅行',
      '完全离线，数据本地加密',
      '年度账单可视化报告'
    ],
    challenges:
      '为了在千元机上也能做到秒开，我把首屏渲染管线重写了一遍，冷启动时间从 1.8s 压到 400ms。',
    platform: 'Android / iOS',
    tech: ['Kotlin Multiplatform', 'Compose', 'SQLDelight', 'MPChart'],
    accent: '#7dd3a8',
    gradient: ['#1e3a2c', '#121a15'],
    screens: ['快速记账', '统计', '年度账单'],
    links: { googleplay: '#', github: '#' }
  }
]

export function getProject(id) {
  return projects.find((p) => p.id === id)
}
