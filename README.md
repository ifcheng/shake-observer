# ShakeObserver

基于devicemotion事件，提供监听设备摇动的能力

## 安装

```
$ npm install shake-observer
```

## 使用

```js
import ShakeObserver from 'shake-observer'

const observer = new ShakeObserver(e => {
  // do something
})

// 取消监听
observer.disconnect()
```

