export const dreamingPeonyDetail = {
  introduction: {
    lead:
      "《游园惊梦》是一部基于昆曲《牡丹亭》重新创作的沉浸式 VR 叙事电影。玩家化作杜丽娘的幽魂，穿行于闺房、花园与梅花观，在空间中寻找并触发散落的记忆碎片，逐渐拼合她关于梦、情与生死的故事。",
    body: [
      "作品以空间氛围、声音设计与情绪沉浸为核心，采用碎片化叙事结构，让故事随着玩家的探索逐步展开。昆曲《牡丹亭》的唱段被融入环境与叙事声音之中，与不同空间的情绪共同构成听觉线索，将传统戏曲从舞台上的观看关系带入可以行走、寻找与聆听的虚拟空间。",
      "项目希望以当代 VR 媒介重新连接中国传统文化与年轻观众，也面向对昆曲、沉浸式叙事和实验数字媒介感兴趣的体验者，在本土文化的基础上寻找新的观看与讲述方式。",
    ],
  },
  role: {
    label: "我的职责",
    value: "叙事设计 · 声音设计",
  },
  poster: {
    src: "/media/work/dreaming-the-peony-pavilion-project-poster.jpg",
    alt: "Dreaming The Peony Pavilion 游园惊梦项目海报",
    caption: "PROJECT POSTER",
    year: "2026",
    width: 2629,
    height: 3508,
  },
  spatialNarrative: {
    lead: "让记忆成为可以进入的空间。",
    body:
      "我们将杜丽娘的记忆拆解并分布在不同空间中，让玩家通过探索和触发物件主动发现故事。我参与将三个主要场景组织成不同的情感阶段：闺房承载压抑与向往，花园对应情感的苏醒，梅花观逐渐走向记忆与情感的高潮。空间由此成为叙事的一部分，玩家的移动顺序也决定了故事被理解的过程。",
    hint: "自由进入不同记忆空间",
    spaces: [
      { title: "闺房", titleEn: "Boudoir", emotion: "压抑 · 向往", placement: "boudoir" },
      { title: "花园", titleEn: "Garden", emotion: "萌动 · 觉醒", placement: "garden" },
      {
        title: "梅花观",
        titleEn: "Plum Blossom Nunnery",
        emotion: "还魂 · 重逢",
        placement: "nunnery",
      },
    ],
  },
  soundDesign: {
    lead: "让声音成为空间里的叙事线索",
    intro:
      "声音设计围绕《牡丹亭》中“梦”的核心意象展开，以漂浮、朦胧、边界模糊的听觉质感连接现实、梦境与记忆。部分氛围音乐由 Suno 辅助制作，并结合环境声与空间声音构成不同场景的情绪与叙事线索。昆曲也被放入虚拟空间，让玩家在行走和聆听中逐渐进入杜丽娘的情感世界。",
    chapters: [
      {
        title: "冥府",
        subtitle: "声音建立空间与方向",
        quotes: ["荒唐啊荒唐，想世人哪有一梦而亡之理"],
        body:
          "低沉风声与环绕的鬼魂声首先建立冥府氛围，随后背后的锣鼓引导玩家转身面向大殿，同时呼应传统戏曲的开场。判官的唱词从其方位传来，将声音方向、身体转向与审判情境连接起来。",
      },
      {
        title: "闺房与花园",
        subtitle: "声音外化情绪",
        quotes: ["可知我一生爱好是天然", "不到园林，怎知春色如许"],
        body:
          "闺房以煮茶、鸟扑腾与窗外微风形成更封闭的声音空间，昆曲唱段回应杜丽娘对自由与情感的向往。进入花园后，流水、鸟鸣和更流动的声音打开空间，唱段伴随春景出现，让听觉变化对应情感的萌动。",
      },
      {
        title: "梅花观",
        subtitle: "声音引导叙事前进",
        quotes: ["情不知所起，一往而深"],
        body:
          "昆曲唱段将情感逐渐推向高潮。钟声与诵经引向还魂，喜鹊与振翅声连接成亲记忆，风铃则带领玩家继续寻找拾画与梦中相见的片段。声音既指引探索方向，也让不同记忆片段按情绪逐渐展开。",
      },
    ],
  },
  download: {
    systemLabel: "WINDOWS · VR",
    label: "DOWNLOAD WINDOWS BUILD",
    href: "https://pan.baidu.com/s/1BJOj2QuCPcZHwVKvXKPsIQ?pwd=zfcy",
    platform: "百度网盘",
    code: "zfcy",
    instructions: ["解压后运行 VRstudy.exe。", "体验需连接 VR 头显与手柄控制器。"],
    controls: [
      { control: "左摇杆", action: "移动" },
      { control: "右摇杆", action: "转向" },
      { control: "手柄射线", action: "寻找并指向可交互物件" },
      { control: "Trigger", action: "触发物件与记忆片段" },
    ],
  },
} as const;
