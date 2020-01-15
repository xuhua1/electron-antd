import { Notification, BrowserWindow } from 'electron'
/**
 * 发生接口发生错误时的处理
 * 注意这是运行在主进程中的方法,请不要使用 document api
 * @param err
 * @param sendData
 * @param options
 */
export function errorAction(err: any, sendData: any, options: RequestOptions) {
  const { code, message } = err
  const { errorType } = options

  $tools.log.error(`[request:${code}] [${errorType}]`, err)

  switch (code) {
    // 跳转到未登录页
    case 30000:
      // ...
      break

    // 无权限跳转
    case 30002:
      // ...
      break

    default:
      if (errorType === 'notification') {
        const n = new Notification({
          icon: $tools.APP_ICON,
          title: `Request Error: [${code}]`,
          body: message,
        })
        n.show()
      } else {
        $tools.createWindow('alert-modal', {
          modal: true,
          parent: BrowserWindow.getFocusedWindow() || undefined,
        })
      }
      break
  }
}
