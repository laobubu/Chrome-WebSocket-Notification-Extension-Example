Chrome-WebSocket-Notification-Extension-Example
===============================================

## 说明

一个简单的 Chrome 结合 WebSocket 的通知功能扩展

请结合[《自制简单的 WebSocket 服务器 + Chrome 通知推送插件》](http://note.laobubu.net/archives/websocket-server-and-chrome-notification-extension/) 一文食用。

其中使用的 WebSocket 测试服务器来自 [http://lab.laobubu.net/ws_create.html](http://lab.laobubu.net/ws_create.html) 。

其中准备了简单的 `WSKeeper` 类来创建自动重连的 WebSocket 连接，以及 `NManager` 类来创建和管理通知。

## 偷懒方案

你可以直接使用这个扩展，然后修改成你自己的通知扩展。具体操作如下：

1. 修改 `manifest.json` 中的地址
2. 修改 `background.js` 中在 `Main Code` 以下的代码
3. 修改图标

## 大概是文档

### WSKeeper类

创建自动重连的 WebSocket 连接，具体用法如下：
```
var ws = new WSKeeper(
	"ws://lab.laobubu.net:8000",	//websocket url
	"json-message",					//websocket protocol
	function onMessage(obj) {		//websocket JSON message handler
		//handle JSON object
	}
);
```

如果要断开连接，使用 `ws.disconnect()` 即可。

### NManager类

负责创建和管理通知。
```
var nman = new NManager("sample-prefix-");	//prefix must be unique
```

或者清除一条通知
```
nman.remove(notificationId)
```

使用这个类可以简单粗暴地创建文字通知。这个函数返回的是通知的 ID
```
nman.create("标题", "文字内容", {})
```

也可以玩一些花样：
```
var options = {
	url:	"",	//(可选) 点击提醒时自动打开的 URL
	buttons: [	//(可选) 按钮，数组
		{title: "Button1",	onclick: function(notificationId, index){alert("Hello from message #"+nid)} },
		{title: "Button2", 	url: "http://laobubu.net"}
		//一个按钮对象必须有 title （按钮文字）
		//可选 iconUrl 表示按钮图标 URL
		//可选 onclick 即按钮被按下时的回调函数，或者 url 表示按钮被按下时打开的 URL
	]
};
nman.create(obj.title, obj.data, options);
```