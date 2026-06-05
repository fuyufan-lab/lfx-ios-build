import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, WKScriptMessageHandler {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 注册 XHS 发布消息处理器（iOS 半自动：剪贴板 + deep link）
        if let vc = window?.rootViewController as? CAPBridgeViewController {
            vc.webView?.configuration.userContentController.add(self, name: "xhsPublisher")
        }
        return true
    }

    // WKScriptMessageHandler — 接收 JavaScript 的 window.webkit.messageHandlers.xhsPublisher.postMessage()
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "xhsPublisher",
              let body = message.body as? String,
              let data = try? JSONSerialization.jsonObject(with: body.data(using: .utf8)!) as? [String: Any] else {
            return
        }

        let clipboard = data["clipboard"] as? String ?? ""
        let scheme = data["scheme"] as? String ?? "xhsdiscover://home"

        // 复制到剪贴板
        if !clipboard.isEmpty {
            UIPasteboard.general.string = clipboard
        }

        // 跳转到小红书
        if let url = URL(string: scheme) {
            DispatchQueue.main.async {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
