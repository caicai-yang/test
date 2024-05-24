import vue from '@vitejs/plugin-vue'
import viteSvgIcons from 'vite-plugin-svg-icons'
import path from 'path'
import { defineConfig } from 'vite'
import dotenv from 'dotenv'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
// 支持 setup 语法糖中设置 name, inheritAttrs 属性
import vueSetupExtend from 'vite-plugin-vue-setup-extend-plus'
// 在正式打包的时候，可以把这两行代码放开
// import Components from 'unplugin-vue-components/vite'
// import { ArcoResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ mode }) => {
  const dotenvConfig = dotenv.config({ path: `./.env.${mode}` })
  const dotenvObj = dotenvConfig.parsed
  return {
    base: dotenvObj?.BUILD_PATH || '/',
    build: {
      outDir: dotenvObj?.BUILD_OUT_DIR || 'dist',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          }
        }
      }
    },
    plugins: [
      vue(),
      viteSvgIcons({
        iconDirs: [path.resolve(process.cwd(), 'src/icons')],
        symbolId: 'icon-[dir]-[name]'
      }),
      vueJsx(),
      vueSetupExtend(),
      AutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/ // .md
        ],
        // dts: './auto-imports.d.ts',
        imports: ['vue', 'vue-router'],
        // eslint报错解决
        eslintrc: {
          enabled: true
        },
        resolvers: []
      })
      // 在正式打包的时候，可以把这三行代码放开
      // Components({
      //   resolvers: [ArcoResolver()],
      // }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "src/styles/variables.less";`,
          modifyVars: {},
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      alias: [
        {
          find: '@/',
          replacement: path.resolve(process.cwd(), 'src') + '/'
        }
      ]
    },
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false
    },
    server: {
      open: true,
      host: '0.0.0.0',
      port: 8080,
      // force: true,
      hmr: true, // 禁用或配置 HMR 连接(热更新是否开启)
      cors: true, // 为开发服务器配置 CORS , 默认启用并允许任何源
      https: false, // 是否启用 http 2
      proxy: {
        // TODO 暂时只转发'/sys/'，后续其他模块再另行处理
        // '/sys/': {
        //   target: loadEnv(mode, process.cwd()).VITE_BASE_HOST,
        //   changeOrigin: true
        //   // rewrite: path => path.replace(loadEnv(mode, process.cwd()).VITE_BASE_API, '')
        // }
      }
    }
    // optimizeDeps: {
    //   include: [
    //     'vue',
    //     'lodash',
    //     '@arco-design/web-vue',
    //     '@arco-design/web-vue/es/icon',
    //     'pinia',
    //     'vue-router',
    //   ],
    // },
  }
})
