// LazyLoad类
class LazyLoad {
  constructor () {
    this.scrollListenerFn = this.scrollListenerFn.bind(this)
    this.resizeListenerFn = this.resizeListenerFn.bind(this)
  }

  init (params) {
    this.initParams(params)
    if (!this.elements) return
    this.scrollTimer = null
    this.defaultImg && this.addDefaultImg()
    this.resizeListenerFn()
    window.addEventListener('scroll', this.scrollListenerFn)
    window.addEventListener('touchmove', this.scrollListenerFn)
    window.addEventListener(this.resizeEvt, this.resizeListenerFn)
  }
  // 初始化一些必要的参数
  initParams (params) {
    let elements = params.elements
    if (!elements.length) return
    this.newElementsDOMArr = Array.prototype.slice.call(elements, 0)
    // 如果是再次调用 init方法，则需要无需进行部分参数的初始化，以及需要清除之前的监听函数
    if (this.elements) {
      this.elements.length !== 0 && this.clearListener()
      this.elements = this.elements.concat(this.newElementsDOMArr)
      return
    }
    this.elements = this.newElementsDOMArr
    this.defaultImg = params.defaultImg
    this.distance = params.distance || 0
    this.tag = params.tag || 'data-src'
    this.frequency = params.frequency || 14
    this.isBg = params.isBg || false
    this.resizeEvt = 'onorientationchange' in window ? 'orientationchange' : 'resize'
    this.getWH()
  }

  scrollListenerFn () {
    if (this.scrollTimer) return
    this.scrollTimer = setTimeout(() => {
      this.scrollTimer = null
      this.isComeToLine()
    }, this.frequency)
  }

  resizeListenerFn () {
    this.getWH()
    this.isComeToLine()
  }
  // 判断是否达到懒加载的条件以决定是否进行懒加载的动作
  isComeToLine () {
    let len = this.elements.length
    let distance = this.distance
    let continueListener = false
    for (let i = 0; i < len; i++) {
      let ele = this.elements[i]
      // 说明已经懒加载过了
      if (!ele) continue
      continueListener = true
      let rect = ele.getBoundingClientRect()
      if ((rect.top > 0 && this.H + distance >= rect.top) || (rect.top < 0 && (rect.top + rect.height >= -this.distance))) {
        if ((rect.left > 0 && this.W + distance >= rect.left) || (rect.left < 0 && (rect.left + rect.width >= -this.distance))) {
          this.loadItem(ele)
          this.elements.splice(i, 1, null)
        }
      }
    }
    // 已经没有需要懒加载的元素了
    !continueListener && this.clearListener()
  }

  clearListener () {
    window.removeEventListener('scroll', this.scrollListenerFn)
    window.removeEventListener('touchmove', this.scrollListenerFn)
    window.removeEventListener(this.resizeEvt, this.resizeListenerFn)
  }
  // 懒加载图片
  loadItem (ele) {
    let imgUrl = ele.getAttribute(this.tag)
    imgUrl && (this.isBg ? ele.style.backgroundImage = 'url(' + imgUrl + ')' : ele.setAttribute('src', imgUrl))
  }
  // 添加默认图片或背景图
  addDefaultImg () {
    let newElements = this.newElementsDOMArr
    let len = newElements.length
    let isBg = this.isBg
    for (let i = 0; i < len; i++) {
      isBg ? newElements[i].style.backgroundImage = 'url(' + this.defaultImg + ')' : newElements[i].setAttribute('src', this.defaultImg)
    }
  }

  getWH () {
    this.W = document.documentElement.clientWidth || window.innerWidth
    this.H = document.documentElement.clientHeight || window.innerHeight
  }
}
