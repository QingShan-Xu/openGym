# openGym 中文版

本 fork 默认使用简体中文，保留上游的多语言切换能力和数据格式。

## 汉化范围

- 复用上游的 2,258 条简体中文界面文案，维护全部 5,632 个动作的中文名称；明确误译与不自然直译已经过源文本复核并修正。
- 汉化原本仅提供英文的管理后台、邀请码、账号管理、操作日志和 AI 教练配置。
- 将登录、同步、密码验证等服务器错误转换为中文，保留原始错误码、HTTP 状态和响应数据。
- 首次打开默认使用中文，渲染前加载语言包；动作名称默认不附带英文原名。
- 日期、时间和数字使用中文区域格式；网页说明与 PWA 安装信息使用中文。
- 为全部 5,632 个动作提供中文简介。多数仍是依据名称、器械和肌群元数据生成的摘要，不应宣称已逐条翻译英文简介；本轮为 90 个不同动作结合英文简介和步骤撰写具体说明，并纠正模板中将拉伸、活动度练习等笼统写成力量训练的问题。

**动作名称按国内常用叫法维护，而不是逐词直译。** 2026-10-14 已对全库完成来源、结构和规则风险筛查，修正 219 个术语／名称和 319 个版本标签，并为 729 个动作补充可搜索的常用别名。没有给全库冠以“官方认证名称”；逐条专家审定尚未完成。详情与源文疑点见 [名称和描述核查记录](CHINESE-NAMES-REVIEW.md)。

**动作教学步骤已全部补齐：**保留上游已有的 1,324 项中文教学；当前助手结合动作名称、器械、肌群、简介及完整步骤，直接撰写并校对新增 4,308 项，总覆盖 5,632/5,632，待补项为 0。生成的前端中文教学已同步，不再因缺失中文教学而回退到英文。没有使用子代理、第三方翻译服务、离线机翻或另调模型 API，也未读取或处理媒体。文字以用户能理解并操作为目标，同时修正上下文明确的错误名称。原资料的缺失、冲突及未核实事项见 [教学任务记录](CHINESE-INSTRUCTIONS-WORK.md)，未冒充健身专业人员审核。实时数量以 `node scripts/catalogue/zh-instructions.mjs status` 为准。

官网营销页面、开发文档、用户自行填写的训练名称和第三方服务商原始诊断信息不属于本次界面汉化范围。

## 语言设置

新用户即使使用英文浏览器也会默认看到中文。已经明确选择其他语言的账号不会被强行改写。

- 用户切换：设置 → 单位与语言 → 语言。
- 实例覆盖：服务器 `.env` 中设置 `DEFAULT_LANG=zh`（简体）或 `DEFAULT_LANG=zh-TW`（繁体）。用户主动选择的语言优先于实例设置。
- 中文动作名的英文括注可在设置中重新开启。

## 本地运行

需要 Node.js 22.12+ 或满足当前 Vite 要求的更新版本。

```sh
cd api
npm ci --omit=optional
# 使用单独的本地数据目录，不影响已有实例。
DATA_DIR=/tmp/opengym-zh-data PORT=3000 ORIGIN=http://localhost:8080 npm start
```

另开终端：

```sh
cd frontend
npm ci
npm run dev -- --host 127.0.0.1
```

也可按上游自托管说明使用 `docker compose up --build`，确保构建本 fork 的源码，而非直接使用上游预构建镜像。

### 本地构建预览（含动作视频）

```sh
cd frontend
npm run build
npm run preview -- --host 127.0.0.1 --port 5178
```

`npm run preview` 会先使用仓库已有的媒体整理脚本，将动作图片与演示视频复制到 `dist/exercise-media/`，再启动预览服务。单独运行 `vite build` 只生成前端代码，不会附带这些资源；直接预览这样的目录会显示占位图。开发服务直接读取 `catalogue/media/`，Docker 和 GitHub Pages 则已有各自的媒体复制步骤。

打开 `http://127.0.0.1:5178/`，并保持预览进程运行。停止服务后，已经打开的页面可能仍显示缓存界面，但未缓存的视频无法加载。补齐资源并重启后，重新载入页面即可。

## 校验与维护

```sh
cd frontend
node scripts/check-locales.mjs
node scripts/check-source-strings.mjs --strict
TZ=UTC npm test -- --maxWorkers=4
npm run build
```

上游部分测试用例采用 UTC 固定日期，运行测试时设置 `TZ=UTC`，不影响应用按用户本地时区运行。Node.js 25 的内置 Web Storage 与测试用的 happy-dom 有冲突，测试时使用 `TZ=UTC NODE_OPTIONS=--no-experimental-webstorage npm test -- --maxWorkers=4`；无需修改系统配置。

中文后台及服务器错误补充包在 `frontend/src/operator-locales/zh.js`，通过现有 i18n 按需加载。动作译文的源文件在 `catalogue/i18n/zh.json`，不要直接编辑生成文件。补充元数据简介后，运行：

```sh
node scripts/catalogue/localize-zh-descriptions.mjs
node scripts/catalogue/build.mjs
```

2026-10-13 全量验收：5,632 项教学全覆盖；6,554 条目录（含变体）与生成一致性校验通过；完整前端测试 404 个文件、5,074 项全部通过，生产构建成功。原有 1,324 项教学步骤保留，新增 4,308 项的步骤数和数字与源文一致。

上游作者信息、许可证和资源声明均予以保留。
