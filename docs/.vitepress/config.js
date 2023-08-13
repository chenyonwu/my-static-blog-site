export default {
  lang: 'zh-CN',
  title: 'my static blog site',
  description: 'a static website to preserve my blogs',
  themeConfig: {
    logo: 'vitepress-logo-mini.svg',
    nav: [
      {
        text: '前端',
        items: [
          { text: 'Vue3', link: '/front-end/vue3/index' },
          { text: 'VueRouter', link: '/front-end/vue-router/index' },
          { text: 'naive-ui', link: '/front-end/naive-ui/index' },
        ]
      },
      {
        text: '后端',
        items: [
          { text: 'JavaSE', link: '/back-end/javaSE/index' },
          { text: 'JavaWeb', link: '/back-end/java-web/index' },
          { text: 'Mysql', link: '/back-end/mysql/index' },
        ]
      },
      {
        text: '算法',
        items: [
          { text: '数据结构与算法', link: '/algorithm/data-structure-and-algorithm/index' },
          { text: '运筹优化算法', link: '/algorithm/or-algorithm/index' },
          { text: 'AI 算法', link: '/algorithm/ai-algorithm/index' },
        ]
      },
      {
        text: '科箭',
        items: [
          { text: 'qt-design 组件库', link: '/qt/qt-design/index' },
        ]
      },
      {
        text: '关于 vitepress',
        items: [
          { text: '指引', link: '/about-vitepress/guide/index' },
          { text: '配置', link: '/about-vitepress/reference/index' },
        ]
      },
      {
        text: '网络日志',
        link: '/inter-log/index',
      }
    ],
    sidebar: {
      '/about-vitepress/guide/': [
        {
          text: '指引',
          items: [
            { text: '首页', link: '/about-vitepress/guide/' },
          ]
        },
        {
          text: '引言',
          items: [
            { text: '快速开始', link: '/about-vitepress/guide/blogs/getting-started' },
            { text: '路由', link: '/about-vitepress/guide/blogs/routing' },
            { text: '发布', link: '/about-vitepress/guide/blogs/deploy' },
          ]
        },
        {
          text: '网页编写',
          items: [
            { text: 'Markdown 扩展', link: '/about-vitepress/guide/blogs/markdown-extensions' },
            { text: '静态资源处理', link: '/about-vitepress/guide/blogs/asset-handling' },
            { text: '网页格式设置', link: '/about-vitepress/guide/blogs/frontmatter' },
            { text: '在 Markdown 中使用 Vue 语法', link: '/about-vitepress/guide/blogs/using-vue-in-markdown' },
            { text: '国际化', link: '/about-vitepress/guide/blogs/i18n' },
          ]
        },
        {
          text: '自定义风格',
          items: [
            { text: '使用自定义主题', link: '/about-vitepress/guide/blogs/using-a-custom-theme' },
            { text: '继承默认主题', link: '/about-vitepress/guide/blogs/extending-the-default-theme' },
            { text: '构建数据流', link: '/about-vitepress/guide/blogs/buildTime-data-loading' },
            { text: '服务端渲染', link: '/about-vitepress/guide/blogs/ssr-compatibility' },
            { text: 'CMS 连接', link: '/about-vitepress/guide/blogs/connecting-to-a-cms' },
          ]
        },
      ],
      '/about-vitepress/reference/': [
        {
          text: '配置',
          items: [
            { text: '首页', link: '/about-vitepress/reference/' },
            { text: '网站配置', link: '/about-vitepress/reference/blogs/site-config' },
            { text: '网页配置', link: '/about-vitepress/reference/blogs/frontmatter-config' },
            { text: '运行时 API', link: '/about-vitepress/reference/blogs/runtime-api' },
            { text: '脚手架', link: '/about-vitepress/reference/blogs/cli' },
          ]
        },
        {
          text: '默认主题',
          items: [
            { text: '概览', link: '/about-vitepress/reference/blogs/default-theme/overview' },
            { text: '导航栏', link: '/about-vitepress/reference/blogs/default-theme/nav' },
            { text: '侧边栏', link: '/about-vitepress/reference/blogs/default-theme/sidebar' },
            { text: '主页', link: '/about-vitepress/reference/blogs/default-theme/home-page' },
            { text: '网页底部', link: '/about-vitepress/reference/blogs/default-theme/footer' },
            { text: '标识', link: '/about-vitepress/reference/blogs/default-theme/badge' },
            { text: '团队页面', link: '/about-vitepress/reference/blogs/default-theme/team-page' },
            { text: '前后页链接', link: '/about-vitepress/reference/blogs/default-theme/prev-or-next-links' },
            { text: '编辑链接', link: '/about-vitepress/reference/blogs/default-theme/edit-link' },
            { text: '更新时间戳', link: '/about-vitepress/reference/blogs/default-theme/last-updated-timestamp' },
            { text: '搜索框', link: '/about-vitepress/reference/blogs/default-theme/search' },
            { text: '广告卡片', link: '/about-vitepress/reference/blogs/default-theme/carbon-ads' },
          ]
        }
      ],
    },
    siteTitle: 'my static blog site',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/chenyonwu' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    },
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    docFooter: {
      prev: 'Pagina prior',
      next: 'Proxima pagina'
    }
  },
  markdown: {
    theme: 'material-theme-palenight',
    lineNumbers: true,
    anchor: {
      slugify(str) {
        return encodeURIComponent(str)
      }
    }
  },
  vite: {
    server: {
      host: true,
      port: 10087,
    }
  },
  vue: {

  },

}