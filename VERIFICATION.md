# Hero 第六版检查记录

2026-09-24。本轮只做 position refinement + scroll interaction。本次消息未附可访问的新标注图片，因此依据用户明确给出的区域、坐标范围和三角构图说明定位，没有沿用旧标注图推测新区域。

## 实现

- Identity：left 12.5vw，top 41vh。
- Education：right 10.5vw，top 59vh。
- Practice：left 51vw，top 24vh；左对齐，不做 viewport 精确居中。
- 手机断点仅同步位置关系：Identity left 8vw/top 41vh；Education left 12vw/right 8vw/top 62vh；Practice left 18vw/top 23vh/max-width 74vw。字号不变。
- Scroll Hint 改为 type=button，aria-controls=work；原有字体、字距、bottom 30px、整体信息层位置保持，清除默认按钮边框、背景、padding。
- Hover 仅 opacity .7 → 1；使用原有 focus-visible 轮廓。
- onClick 先 stopPropagation，然后 document.getElementById("work").scrollIntoView({behavior:"smooth",block:"start"})。
- Hero 的既有 clickable 判断也会排除 button，不触发 umbrella toggle；pointer/focus 继续复用导航的伞淡出与圆珠光标保留逻辑。
- page.tsx 在 Hero 后增加空白 section#work，100svh，背景颜色沿用 visual.background；仅作未来作品区域的锚点，没有 Project cards 或作品内容。
- 没有 wheel 监听、scroll lock、scroll snap、location 跳转或 reload。

## 三种 Desktop 排版检查

| 视口 | Identity 左/上 | Education 左/上 | Practice 左/上 |
|---|---|---|---|
| 1440×900 | 180 / 369 | 849.0 / 531 | 734.4 / 216 |
| 1728×1117 | 216 / 458.0 | 1037.5 / 659.0 | 881.3 / 268.1 |
| 1920×1080 | 240 / 442.8 | 1209.4 / 637.2 | 979.2 / 259.2 |

均无水平溢出，三个块不碰撞，教育第二行 span 同基线，没有拆成第三行。导航保持原位置。已恢复正常预览尺寸。

## 浏览器交互检查

1440×900，OPEN 状态：

- Tab 聚焦 Scroll Hint：伞 opacity=0，圆珠光标 opacity=1，系统 cursor=none。
- Enter：scrollY 从 0 到 900，#work.top=0，伞 state 保持 open。
- Space：同样到达 scrollY=900、#work.top=0，伞 state 保持 open。
- 鼠标点击：读到中间 scrollY=411，随后 scrollY=900，证实存在滚动过程而非瞬移。伞 state 保持 open，入口上伞 opacity=0、光标 opacity=1。
- 原生滚轮可返回 Hero；1920×1080 另行向下滚动，最终 scrollY=1080、#work.top=0。
- 最终控制台 error / warn 查询为空。

## 保护范围

SHA-256 校验未变：
- src/lib/curtain.ts
- src/lib/scene.ts
- src/components/hero/LineCurtain.tsx
- src/components/hero/BeadRain.tsx
- src/components/hero/Umbrella.tsx
- src/components/hero/Navigation.tsx
- src/components/hero/DropletCursor.tsx
- src/components/hero/Hero.tsx
- src/hooks/useHeroScene.ts

visual 配置整体 deepEqual，包括 text、layers、curtain、beads、umbrella、cursor、background。CSS 逐规则核对确认信息字体、字重、行距、整体 opacity、z-index、导航样式、粒子图层均未改变。只改位置、Scroll Hint 按钮交互和空白滚动目标。

## 构建

pnpm typecheck 通过；最终 pnpm build 通过。物理逻辑无修改，本轮没有新增或反复运行物理单元测试；重点通过实际浏览器验证布局、键盘、鼠标与滚轮交互。

## 修改文件

- src/config/hero.ts：仅三个信息块的位置。
- src/components/hero/HeroInfo.tsx：Scroll Hint 原生按钮及滚动处理。
- src/app/page.tsx：空白下一屏 target。
- src/app/globals.css：按钮默认样式清除、轻微 hover、目标高度、移动端位置。
- DESIGN.md、README.md、VERIFICATION.md：更新范围与检查记录。

停在当前版本，不开发 Projects 内容或进行 text-depth 实验。
