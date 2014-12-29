/*****************************************************
  WSKeeper & NManager class
	
	WSKeeper manages the WebSocket connection. If network goes offline, it retry.
	NManager manages the notifications. It provides simpler method to create simple notifications.
	
	You can skip to Main Code and start coding.
	
	Reference
	 - https://developer.chrome.com/apps/notifications
	
 *****************************************************/

function WSKeeper(wsUri, wsProtocol, handler) {
	var websocket = null;
	var doclose = false;
	var connect = function() {
		disconnect();
		doclose = false;
		websocket = new WebSocket(wsUri, wsProtocol); 
		websocket.onopen = function(evt) { onOpen(evt) }; 
		websocket.onclose = function(evt) { onClose(evt) }; 
		websocket.onmessage = function(evt) { onMessage(evt) }; 
		websocket.onerror = function(evt) { onError(evt) }; 
	}
	var disconnect = function() {
		doclose = true;
		websocket && websocket.close && websocket.close();
	}
	function onOpen(evt) {	//connected
	}  
	function onClose(evt) { //disconnected
		if (!doclose)
			connect();
	}  
	function onMessage(evt) { 
		var o = JSON.parse(evt.data);
		handler(o);
	}  
	function onError(evt) { //error
	}
	
	connect();
	return {
		websocket:	websocket,
		connect:	connect,
		disconnect:	disconnect
	} 
}
function NManager(prefix) {
	var nurl={}, nbtns={}, ncounter=0;
	function id() {
		return prefix + (ncounter++);
	}
	function create(title, message, options) {
		var nid = id();
		var opts = {
			type: "basic",
			title: title,
			message: message,
			iconUrl: "icon128.png"
		};
		nurl[nid] = options.url;
		nbtns[nid] = options.buttons;
		if (options.buttons) {
			opts.buttons = [];
			for(var i=0;i<options.buttons.length;i++) {
				opts.buttons[i] = {title: options.buttons[i].title};
				options.buttons[i].iconUrl && (opts.buttons[i].iconUrl=options.buttons[i].iconUrl);
			}
		}
		chrome.notifications.create(
			nid, 
			opts, 
			function(notificationId){}
		);
		return nid;
	}
	function remove(notificationId) {
		chrome.notifications.clear(notificationId,function(){});
		delete nurl[notificationId];
		delete nbtns[notificationId];
	}
	chrome.notifications.onClicked.addListener(function(notificationId){
		if (nurl.hasOwnProperty(notificationId)) {
			nurl[notificationId] && window.open(nurl[notificationId]);
			remove(notificationId);
		}
	});
	chrome.notifications.onButtonClicked.addListener(function(notificationId, index){
		if (nbtns.hasOwnProperty(notificationId)) {
			var b = nbtns[notificationId][index];
			b.url && window.open(b.url);
			(typeof(b.onclick)=='function') && b.onclick(notificationId, index);
			remove(notificationId);
		}
	});
	return {
		create:	create,
		remove: remove
	}
}

///////////////////////////////////////////////////
// # Main Code
///////////////////////////////////////////////////

var nman = new NManager("sample-prefix-");	//prefix must be unique
var ws = new WSKeeper(
	"ws://lab.laobubu.net:8000",	//websocket url
	"json-message",					//websocket protocol
	function onMessage(obj) {		//websocket JSON message handler
		var options = {
			url:	"",	//(optional) Click-to-open URL
			buttons: [	//(optional) button
				{title: "Button1",	onclick: function(notificationId, index){alert("Hello from message #"+nid)} },
				{title: "Button2", 	url: "http://laobubu.net"}	//button item: onclick or url
			]
		};
		var nid = nman.create(obj.title, obj.data, options);
	}
);
