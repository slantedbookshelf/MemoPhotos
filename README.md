# MemoPhotos

MemoPhotos 是一个面向摄影爱好者的本地优先摄影成长平台。它把灵感、拍摄记录、作品档案与六维复盘串成一个完整闭环。

## 已实现

- 作品档案画廊，支持关键词、主题和点评状态筛选
- 摄影日记新增、编辑、删除与多图上传
- 拍摄时间、地点、器材参数、标签和故事记录
- 18 张内置摄影灵感卡，支持分类、随机、待拍和完成状态
- 本地模拟 AI 六维点评，结果会关联并保存到日记
- 拍摄数量、主题分布与复盘提示统计
- IndexedDB 本地持久化
- JSON 数据导出与恢复
- 响应式布局、深色模式、键盘焦点与减少动效适配

## 运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 技术栈

- Vue 3 + Vite
- Vue Router
- Pinia
- Dexie / IndexedDB
- Phosphor Icons
- 原生 CSS 设计系统

## 数据与接口说明

当前版本是可直接运行的本地 MVP：

- 照片会以 Data URL 形式存入浏览器 IndexedDB。
- AI 点评为本地结构化演示，不会上传照片，也不会消耗模型额度。
- 示例照片放在 `public/photos`，均已转为 WebP。

正式接入时，建议按项目文档将上传替换为阿里云 OSS STS 直传，并把 AI 调用放在 Serverless 代理中。不要把 OSS 密钥或 AI API Key 放入前端代码。
