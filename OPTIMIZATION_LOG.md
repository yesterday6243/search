# Optimization Log

## Usage Rule
- 每次开始修复/优化前，先快速检查本文件，避免同类问题回归。
- 每次完成修复/优化后，追加一条记录，写明：
  - 现象
  - 根因
  - 处理方案
  - 涉及文件

## Recent Records

### 2026-04-06 - 同分类拖拽换位临界回归修复
- 现象：
  - 前面的标签拖到后面的标签上，会落到“后面标签的前一个位置”。
  - `1` 拖到 `2` 时会回到原位，看起来没有变化。
- 根因：
  - 同分类拖拽时，目标索引在删除源项后再计算，导致前->后场景索引偏移。
- 处理方案：
  - 先计算目标索引，再执行删除与插入，统一同分类前后拖拽规则。
- 涉及文件：
  - `public/app.js`

### 2026-04-06 - 标签浮动导致顶部裁切修复（保留浮动）
- 现象：
  - 标签 hover 上浮时顶部被裁切，图标上沿会被截掉。
- 根因：
  - 分类容器在折叠状态使用了 `overflow: hidden`，而卡片 hover 使用负向位移。
- 处理方案：
  - 默认容器改为 `overflow: visible`。
  - 仅在折叠且可展开时启用裁切，并增加 2px 顶部安全空间与对应高度补偿。
- 涉及文件：
  - `public/styles.css`

### 2026-04-06 - 新增标签透明度设置（可同步）
- 现象：
  - 用户需要可调标签透明度，满足不同背景图下的视觉偏好。
- 根因：
  - 原有配置仅有背景透明度和搜索框高度，没有标签层透明度控制。
- 处理方案：
  - 新增 `tagOpacity` 设置项（35-100）。
  - 前端设置页新增滑动条，实时预览。
  - 后端新增字段默认值与校验，保证多设备同步一致。
- 涉及文件：
  - `public/index.html`
  - `public/app.js`
  - `public/styles.css`
  - `server.js`

### 2026-04-06 - 标签名自适应缩字号
- 现象：
  - 长标签名会溢出卡片或显示效果不稳定。
- 根因：
  - 统一固定字号无法兼容不同字符宽度与多语言长度。
- 处理方案：
  - 渲染后按卡片可用宽度逐级缩小字号（每次 1px），直到不溢出。
  - 仅在发生溢出时缩小，确保“在不溢出的前提下字号尽量大”。
  - 窗口尺寸变化后自动重算。
- 涉及文件：
  - `public/app.js`

### 2026-04-06 - 搜索框点击输入判定范围扩大
- 现象：
  - 搜索框可点击进入输入态的区域偏窄，用户容易点空。
- 根因：
  - 仅原生 input 命中才触发聚焦，容器空白区未接管交互。
- 处理方案：
  - 对搜索框容器增加 `pointerdown` 代理，点击容器空白即聚焦到输入框末尾。
- 涉及文件：
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - 标签拖动动画增强
- 现象：
  - 拖动标签时视觉反馈弱，看起来“没动画”。
- 根因：
  - 拖拽态仅有静态样式，缺少拖拽阶段的过渡与目标提示动画。
- 处理方案：
  - 增加拖拽态类名与卡片过渡。
  - 为目标卡片增加脉冲动画，提升拖拽过程可感知性。
- 涉及文件：
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - 分类上下拖拽重排
- 现象：
  - 仅支持分类内标签重排，不支持分类整体顺序调整。
- 根因：
  - 缺少分类级拖拽状态与插入规则。
- 处理方案：
  - 左侧分类块支持拖拽作为手柄。
  - 增加分类前/后插入提示线与临界索引处理，避免前后拖拽错位。
- 涉及文件：
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - 注册页用户数量提示移除
- 现象：
  - 注册弹窗展示“已注册用户 x/50”，不符合产品预期。
- 根因：
  - 客户端默认把后台用户数量回显在注册弹窗。
- 处理方案：
  - 隐藏并清空该提示区域，仅保留必要的注册结果提示。
- 涉及文件：
  - `public/app.js`
  - `public/index.html`

### 2026-04-06 - 设置页引擎/标签编辑左右对齐优化
- 现象：
  - 设置里引擎和标签编辑区左右列存在轻微不齐。
- 根因：
  - 网格项纵向对齐策略与字段标签高度不统一。
- 处理方案：
  - 统一网格项纵向对齐方式，统一字段标签区高度与按钮最小宽度。
- 涉及文件：
  - `public/styles.css`

### 2026-04-06 - 搜索框输入命中范围体验优化（二次）
- 现象：
  - 点击搜索框时，只有较窄区域能进入输入态。
- 根因：
  - 搜索容器未统一接管空白区域点击焦点。
- 处理方案：
  - 搜索容器监听 `pointerdown`，点击非按钮区域自动聚焦并把光标移动到末尾。
- 涉及文件：
  - `public/app.js`

### 2026-04-06 - 同分类标签拖拽临界判断回归修复（二次）
- 现象：
  - 同分类拖拽前后交换在部分路径再次出现“落到前一位”问题。
- 根因：
  - 删除源项后的插入索引做了多余的方向修正。
- 处理方案：
  - 同分类按目标原始索引插入，不再做重复偏移修正。
- 涉及文件：
  - `public/app.js`

### 2026-04-06 - 分类上下拖拽排序功能
- 现象：
  - 需要通过左侧分类块拖拽调整整类顺序。
- 根因：
  - 缺少分类级拖拽状态机和 before/after 落点规则。
- 处理方案：
  - 左侧分类块作为拖拽手柄。
  - 根据目标行上下半区判定 before/after，插入索引统一修正并增加可视化落点线。
- 涉及文件：
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - 拖拽动画降级为静态反馈
- 现象：
  - 拖拽时浮动、抓起、脉冲动画视觉过强。
- 根因：
  - 拖拽阶段加入了位移与脉冲 keyframes，和当前审美偏好不一致。
- 处理方案：
  - 去除拖拽浮动、抓起旋转、目标脉冲动画。
  - 保留最小化拖拽反馈（透明度与边框高亮）。
- 涉及文件：
  - `public/styles.css`

### 2026-04-06 - Search Bar Sticky-On-Scroll (Bing-like)
- Symptom:
  - Search bar kept moving out of viewport while scrolling down, making quick search inconvenient.
- Root cause:
  - Search area used normal flow layout without a sticky stop point.
- Fix:
  - Changed `.search-panel` to `position: sticky` with top offset.
  - Search bar now moves up at first and stops at the top once reached.
  - Added small vertical safe spacing for visual comfort.
- Files:
  - `public/styles.css`

### 2026-04-06 - Sticky Reliability Recheck (Crash Recovery Patch)
- Symptom:
  - After refresh/scroll, the search bar could still disappear, and first-row tags could be pushed to the top edge.
- Root cause:
  - Scroll container and sticky target were split (`.layout` scrolling with sticky stage offset), which made sticky behavior unstable in this layout.
- Fix:
  - Switched page scrolling back to `body` (`overflow-y: auto`).
  - Removed inner scrolling from `.layout` (`overflow: visible`).
  - Kept search area sticky and increased bottom safety spacing to avoid visual clipping while scrolling.
- Files:
  - `public/styles.css`

### 2026-04-06 - Sticky Safe Gap + History Scroll + Settings Quick Slider
- Symptom:
  - Search area could enter top status region while scrolling.
  - Tags visually overlapped right under the search box.
  - History list only rendered first 8 records, making saved local history hard to reuse.
  - Settings panel lacked a designed quick-scroll control on the right side.
- Root cause:
  - Sticky top offset did not reserve a fixed safe gap under the top bar.
  - No transition mask between sticky search area and tag grid.
  - History rendering hard-limited to 8 items in JS.
  - Settings relied on plain container scrolling only.
- Fix:
  - Introduced top bar sticky height and search safe-gap variables; search now stops below top bar.
  - Added a gradient mask under the sticky search area to remove hard overlap and create fade-out transition.
  - Removed JS 8-item render slice; history panel now supports internal scroll while keeping 8-row visible height.
  - Added a custom right-side draggable quick-scroll rail for settings.
- Files:
  - `public/styles.css`
  - `public/app.js`
  - `public/index.html`

### 2026-04-06 - Tag Fade Logic Switched To Position-Based Targets
- Symptom:
  - First visible row looked faded even before scrolling.
  - Fade was applied by category row, not by each visible tile position.
- Root cause:
  - Opacity calculation used `.category-row` top position and a wide early fade range.
- Fix:
  - Switched fade calculation to per-element targets (`.tag-card`, category name block, expand button).
  - Anchored fade line to actual search bar bottom.
  - Narrowed fade range and reduced hidden offset to avoid early wash-out on first row.
- Files:
  - `public/app.js`

### 2026-04-06 - Settings Layer Elevated To Top
- Symptom:
  - Settings modal could be visually overlapped by top/header layer in some scroll states.
- Root cause:
  - Global layering used relatively low z-index values for settings modal and scrim.
- Fix:
  - Raised settings drawer to highest UI layer.
  - Raised scrim above page content, and kept auth modal above settings when needed.
- Files:
  - `public/styles.css`

### 2026-04-06 - Icon Reliability + Engine Switch Flicker + Hover Float Restore
- Symptom:
  - 部分书签图标偶发加载失败，出现空白图标位。
  - 切换搜索引擎时右侧图标会出现闪一下的观感。
  - 标签 hover 上浮效果缺失。
  - 恢复上浮后需要避免折叠行顶部被裁切。
- Root cause:
  - 图标源链覆盖不足，且无最终兜底图标。
  - 引擎按钮图标未提前预热，首次切换可能触发重新加载。
  - 卡片 hover transform 被关闭。
  - 折叠态容器顶部安全间距不足，浮动时易被裁切。
- Fix:
  - 增强 favicon 源链（native ico/png + duckduckgo + google s2 + icon.horse + unavatar）。
  - 新增宽松 URL 解析（无协议时自动尝试 `https://`）。
  - 无可用源时使用内置 SVG 默认图标，避免空白。
  - 增加引擎按钮图标预热缓存，降低切换闪动。
  - 恢复标签 hover 上浮与阴影，并增加折叠态顶部安全空间避免溢出。
- Files:
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - Category Row Drop Logic Refined
- Symptom:
  - Dropping a category onto the middle of another category icon could place it after the target row when dragging downward.
  - The center drop zone was too broad because it only checked vertical position, not whether the pointer was actually over the category icon.
  - Center drop feedback used a horizontal line, which made the reorder hint look inconsistent with before/after insertion lines.
- Root cause:
  - `center` drop mapped to a direction-dependent insert index instead of consistently taking the target row slot.
  - Hit testing for `center` ignored pointer X position.
  - Center feedback reused line-based affordance instead of target-row highlighting.
- Fix:
  - Made `center` drop always insert into the hovered row position.
  - Limited `center` activation to the actual category icon center zone.
  - Switched center feedback from a full-width line to category icon highlighting, keeping before/after as single insertion lines.
- Files:
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - Category Drag Insert Slots Reworked
- Symptom:
  - Reordering categories still felt inconsistent near row boundaries.
  - The gap between two rows could visually show duplicated insertion lines.
  - Hovering the category icon itself did not clearly behave as a forbidden drop zone.
- Root cause:
  - Drop feedback still depended on per-row pseudo-elements instead of a single shared insertion slot.
  - Valid drop zones were inferred from row areas, not from explicit row-gap slots.
  - Pointer blocking on category icons was not aligned with the intended product interaction.
- Fix:
  - Reworked category drag detection around explicit inter-row insertion slots.
  - Added a single shared drop indicator centered in the gap, with thicker styling.
  - Blocked drops when the pointer is on a category icon, so the browser can show a forbidden cursor there.
  - Limited valid drop feedback to true gap zones and kept a single line per gap to avoid double-line artifacts.
- Files:
  - `public/app.js`
  - `public/styles.css`

### 2026-04-06 - Category Drag Outer Slot Range Expanded
- Symptom:
  - Dropping before the first row or after the last row could still fail when the pointer moved slightly beyond the original narrow edge capture zone.
- Root cause:
  - Outer insertion zones reused a relatively tight boundary compared with normal row-gap movement, so release events near the page edge could fall outside the valid slot.
- Fix:
  - Added a larger dedicated outer capture range for the first-row top slot and last-row bottom slot.
  - Expanded the stored-target fallback area to match the wider outer slots.
- Files:
  - `public/app.js`

### 2026-04-06 - Category Side Blocks Vertically Centered
- Symptom:
  - Left category labels and right action blocks were visually aligned to the top instead of centered against the full height of the tag grid.
- Root cause:
  - `.category-row` used `align-items: start`, so side columns did not center within taller multi-row content blocks.
- Fix:
  - Changed category row grid alignment to vertical centering so side blocks track the full row height.
- Files:
  - `public/styles.css`

### 2026-04-06 - Category Side Center Offset Compensated For Hover Safe Space
- Symptom:
  - On collapsed overflow rows, left category labels and right action blocks still looked slightly too high after vertical centering.
- Root cause:
  - The tag area reserved extra top-safe space for hover lift, so centering against the full row box biased the side columns upward relative to the visible tiles.
- Fix:
  - Added a row-level hover-safe-space variable for overflow rows.
  - Shifted left and right side columns down by half of that reserved top space, so their visual center matches the tile block center.
- Files:
  - `public/styles.css`

### 2026-04-06 - Category Side Blocks Anchored To First Row
- Symptom:
  - Left category labels and right-side action buttons moved vertically when a category expanded to multiple rows.
- Root cause:
  - Side columns still participated in full-row alignment, so expanding the middle content changed their vertical position.
- Fix:
  - Anchored side columns to the top of the row instead of centering against total expanded height.
  - Kept the hover-safe-space offset compensation so collapsed rows still look visually centered.
- Files:
  - `public/styles.css`

### 2026-04-06 - Category Side Offset Uses Full Hover Safe Space
- Symptom:
  - Side blocks still looked slightly too high because they were only shifted by half of the reserved top hover-safe space.
- Root cause:
  - Side columns are anchored to the first row, so the correct visual compensation is the full reserved top space, not half.
- Fix:
  - Changed left and right side block offset to use the full `--category-hover-safe-top` value.
- Files:
  - `public/styles.css`

### 2026-04-06 - Picsum Custom Seed Row Hidden By Default
- Symptom:
  - The custom seed input row was always visible in Picsum mode, even when a built-in seed preset was selected.
- Root cause:
  - Field visibility only depended on the background provider and did not distinguish preset mode from custom mode.
- Fix:
  - Show the preset selector for Picsum by default.
  - Only reveal the custom seed input row when the current seed does not match any built-in preset, including when the user selects the custom option.
- Files:
  - `public/app.js`

### 2026-04-06 - Removed Picsum Custom Placeholder Option
- Symptom:
  - The preset selector still showed a custom placeholder option, which made the control look redundant after hiding the custom input row by default.
- Root cause:
  - Preset rendering still injected an explicit custom option at the top of the list.
- Fix:
  - Removed the custom placeholder option from the preset selector.
  - Kept the custom seed input row behavior for non-preset seed values.
- Files:
  - `public/app.js`

- 2026-04-06: favicon source priority updated so page-level icons are tried before root-level favicons; added path-level favicon support and full-page Google s2 fallback to fix sites like matrix.tencent.com/ai-detect and aliyun.com.

- 2026-04-06: new user defaults now seed from app_state for every account, and the current synced user_state was promoted into app_state so future registrations inherit the cached icons, layout, and settings template.

- 2026-04-06: added shared server-side icon seed cache with query/promote APIs, preseeded current default engines and tags into app_icon_cache as data URLs, merged server icon seeds into localStorage on login/load, and made icon rendering prefer resolved local cache to stop repeated engine-menu reload flicker.

- 2026-04-07: fixed probabilistic icon reloads by rejecting HTML/error pages masquerading as image/x-icon in both server cache and localStorage cache, then reseeded previously poisoned hosts (douyin.com, chatglm.cn, qianwen.com, coze.com).

- 2026-04-07: rounded the active search-engine icon inside the search button without changing the outer button geometry.

- 2026-04-07: optimized applyState so background refresh and rotation only rerun when the background config changes, and added remote icon-source cooldowns to stop repeated retry flicker after transient favicon failures.

- 2026-04-07: fixed refresh-time background mismatch by removing the hard-coded CSS default remote image, bootstrapping the last persisted background URL in head before CSS paint, and persisting every resolved runtime background URL to localStorage.

- 2026-04-07: changed background persistence from raw URL-only storage to a URL+background-key snapshot so manual background switches survive refresh when the background config is unchanged, while scheduled rotation still resumes normally.

- 2026-04-07: added local authenticated state snapshots plus head-time UI variable bootstrap (search height, tag opacity, overlay opacity, last background) so refreshes render from cached settings/layout first and then reconcile with the server without search-bar size flicker.

- 2026-04-07: removed automatic polling sync, turned the top-right sync pill into a manual sync button, and updated save/status copy to reflect explicit cloud pulls instead of background auto-sync.
