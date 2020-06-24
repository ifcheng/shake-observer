import merge from './utils/merge'

export interface Config {
  /** 触发摇一摇动作的加速度差阈值，默认值`15` */
  threshold?: number
  /** 触发摇一摇动作的最小时间间隔(ms)，默认值`100` */
  interval?: number
  /** 是否在实例化后自行选择时机开启观测，默认值`false` */
  lazy?: boolean
}

const defaults: Required<Config> = {
  threshold: 15,
  interval: 100,
  lazy: false,
}

function warn(): void {
  console.warn('该设备不支持devicemotion事件，ShakeObserver无法正常工作')
}

class ShakeObserver {
  /** 设备是否支持`devicemotion`事件 */
  static workable = 'ondevicemotion' in window

  #lastX: number | null = null
  #lastY: number | null = null
  #lastZ: number | null = null
  #lastTime = Date.now()
  #observed = false
  config: Required<Config>

  constructor(
    public callback: (event: DeviceMotionEvent) => void,
    config: Config = {},
  ) {
    ShakeObserver.workable || warn()
    this.config = merge(defaults, config)
    this.config.lazy || this.observe()
  }

  #reset = (): void => {
    this.#lastTime = Date.now()
    this.#lastX = null
    this.#lastY = null
    this.#lastZ = null
  }

  #listener = (event: DeviceMotionEvent): void => {
    const current = event.accelerationIncludingGravity
    if (!current) return warn()
    if (this.#lastX === null && this.#lastY === null && this.#lastZ === null) {
      this.#lastX = current.x
      this.#lastY = current.y
      this.#lastZ = current.z
      return
    }

    const { interval, threshold } = this.config
    const deltaX = Math.abs(this.#lastX! - current.x!)
    const deltaY = Math.abs(this.#lastY! - current.y!)
    const deltaZ = Math.abs(this.#lastZ! - current.z!)
    if (
      Date.now() - this.#lastTime >= interval &&
      ((deltaX > threshold && deltaY > threshold) ||
        (deltaX > threshold && deltaZ > threshold) ||
        (deltaY > threshold && deltaZ > threshold))
    ) {
      this.callback(event)
      this.#lastTime = Date.now()
    }

    this.#lastX = current.x
    this.#lastY = current.y
    this.#lastZ = current.z
  }

  /** 开始监听`devicemotion`事件 */
  observe(): void {
    if (this.#observed) return
    this.#reset()
    window.addEventListener('devicemotion', this.#listener, false)
    this.#observed = true
  }

  /** 取消监听`devicemotion`事件 */
  disconnect(): void {
    window.removeEventListener('devicemotion', this.#listener, false)
    this.#observed = false
  }
}

export default ShakeObserver
