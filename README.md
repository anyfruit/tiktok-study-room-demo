# 班主任互动自习班 Demo

这个 demo 现在已经从“简单教室座位”升级成更像你截图那种：

- 大场景教室 / 自习室背景
- 24 个可占位座位
- 弹幕签到 / 入座
- 礼物触发：感谢播报、前排升级、点灯
- 25/5 番茄钟
- AI 班主任巡查 / 点名 / 催学习

路径：

`/Users/minipig/Agents/openclaw/state/workspace/demos/tiktok-study-room-demo`

## 文件结构

- `index.html` 页面结构
- `styles.css` 样式与大场景布局
- `app.js` 交互逻辑：入座、礼物、番茄钟、巡查

## 本地运行

```bash
cd /Users/minipig/Agents/openclaw/state/workspace/demos/tiktok-study-room-demo
python3 -m http.server 8017
```

打开：

- `http://127.0.0.1:8017`

## TikTok 能不能接 OBS？

### 结论
**能，但要分两条链路看：**

### 链路 A：OBS 直接推 TikTok（更爽，但不一定每个账号都有）
适用条件：
- 你的 TikTok 账号拿到了 LIVE access
- 你的账号/地区/场景里能拿到 **Server URL + Stream Key**

链路：
1. 互动网页 / 本地控制台 生成直播主画面
2. OBS 把网页作为 Browser Source 或窗口捕获
3. 在 TikTok 拿到 RTMP Server URL + Stream Key
4. OBS 直接推流到 TikTok

优点：
- 最接近完整自动链路
- 你能完全用 OBS 控场

缺点：
- **不是每个账号都稳定有 stream key 权限**
- 可能受地区、账号状态、TikTok 策略影响

### 链路 B：OBS → TikTok LIVE Studio（更稳，更官方）
适用条件：
- 你有 LIVE Studio access
- 你能登录 TikTok LIVE Studio

链路：
1. 互动网页 / 本地控制台 生成直播主画面
2. OBS 做合成场景
3. TikTok LIVE Studio 用窗口捕获 / 显示捕获 / 虚拟摄像头方式吃进 OBS 输出
4. LIVE Studio 推到 TikTok

优点：
- 更官方
- 对很多账号来说更现实

缺点：
- 比 OBS 直推多一层
- 某些启动 / 登录 / 确认步骤没法完全静默自动化

## 我推荐的完整直播链路

### 最推荐：浏览器场景 + 事件桥 + OBS + TikTok 推流

#### 1) 内容层
- 这个 demo 页面就是内容层
- 后面可以扩成正式前端
- 负责：座位、番茄钟、老师巡查、礼物播报

#### 2) 事件层
做一个本地事件桥（Node / Python 都行）：
- 接 TikTok gift / comment / like / follow event
- 把事件通过 WebSocket 发给前端页面
- 前端收到后更新座位和特效

#### 3) 合成层
OBS：
- Browser Source：直接吃本地前端页面
- 或者显示捕获整个浏览器窗口
- 这里还可以叠加音效、BGM、边框、字幕

#### 4) 推流层
优先顺序：
- **优先 A：OBS 直推 TikTok（如果有 stream key）**
- **回退 B：OBS → LIVE Studio → TikTok**

## 能不能做到“中间都不需要我参与”？

### 老实说：不能 100% 完全不要你
至少这几步通常需要你本人参与或确认：

1. **TikTok 账号登录**
- 可能有验证码、2FA、设备验证

2. **LIVE access 申请 / 审核**
- 这是平台权限，不是我本地能绕过去的

3. **Stream key / 推流权限获取**
- 如果账号没有开放，我不能凭空变出来

4. **首次开播前的人工确认**
- 标题、封面、分区、合规性，这些通常最好人工确认

5. **平台风控 / 内容审核**
- 无真人出镜、长时间低互动、像录播，都可能触发风控

### 但能高度自动化的部分很多
我能做到的自动化方向包括：
- 自动启动本地互动场景
- 自动启动事件桥
- 自动启动 OBS 场景配置
- 自动把 TikTok 事件映射成入座 / 点灯 / 巡查反馈
- 自动播报礼物感谢
- 自动番茄钟切换
- 自动巡查、点名、催学习

## 无真人出镜的最佳实践

你不想真人出镜，我建议这样做：

- 不做纯静态背景挂机
- 保留一个持续活动的 AI 班主任角标
- 始终有倒计时变化
- 有随机巡查和点名
- 有礼物/弹幕触发反馈
- 最好有轻微语音播报/TTS

这样更像“活直播”，不容易像录播死画面。

## 下一步建议

如果继续往实战走，应该是这条顺序：

1. 先确认你 TikTok 账号有没有 LIVE access
2. 确认能不能拿到 stream key
3. 如果不能，先走 LIVE Studio 链路
4. 再做本地事件桥，把真实 TikTok 评论/礼物接进来
5. 最后做一键启动脚本

## 任务状态

- **已完成**：demo 改版 + OBS / LIVE Studio 链路梳理
- **继续中**：真实 TikTok 事件桥还没接
- **阻塞**：TikTok 账号权限、登录和平台审核不能彻底无人化
