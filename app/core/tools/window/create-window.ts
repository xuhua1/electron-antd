import path from 'path'
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { log } from '../log'
import routes, { RouterKey } from '@/src/auto-routes'

const { NODE_ENV, port, host } = process.env

/** 已创建的窗口列表 */
export const windowList: Map<RouterKey, BrowserWindow> = new Map()

/**
 * 通过 routes 中的 key(name) 得到 url
 * @param key
 */
export function getWindowUrl(key: RouterKey): string {
  const routePath = routes.get(key)?.path
  if (NODE_ENV === 'development') {
    return `http://${host}:${port}#${routePath}`
  } else {
    return `file://${path.join(__dirname, '../renderer/index.html')}#${routePath}`
  }
}

/**
 * 创建一个新窗口
 * @param key
 * @param options
 */
export function createWindow(key: RouterKey, options: BrowserWindowConstructorOptions = {}): BrowserWindow {
  const routeConf: RouteConfig | AnyObj = routes.get(key) || {}

  const activeWin = activeWindow(key)
  if (activeWin) return activeWin

  const win = new BrowserWindow({
    ...$tools.DEFAULT_WINDOW_CONFIG, // 默认新窗口选项
    ...routeConf.window, // routes 中的配置的window选项
    ...options, // 调用方法时传入的选项
  })

  const url = getWindowUrl(key)
  windowList.set(key, win)
  win.loadURL(url)

  if (routeConf.saveWindowBounds) {
    const lastBounds = $tools.settings.windowBounds.get(key)
    if (lastBounds) win.setBounds(lastBounds)
  }

  win.once('ready-to-show', () => {
    win.show()
    if (routeConf.openDevTools) win.webContents.openDevTools()
  })

  win.once('show', () => {
    log.info(`Window <${key}:${win.id}> url: ${url} is opened.`)
  })

  win.on('close', () => {
    if (routeConf.saveWindowBounds && win) {
      $tools.settings.windowBounds.set(key, win.getBounds())
    }
    windowList.delete(key)
    log.info(`Window <${key}:${win.id}> is closed.`)
  })

  return win
}

/**
 * 激活一个已存在的窗口, 成功返回 BrowserWindow 失败返回 false
 * @param key
 */
export function activeWindow(key: RouterKey): BrowserWindow | false {
  const win: BrowserWindow | undefined = windowList.get(key)

  if (win) {
    win.show()
    return win
  } else {
    return false
  }
}
