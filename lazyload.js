// LazyLoad类
class LazyLoad {
  constructor (params) {
    this.params = params
    this.scrollListenerFn = this.scrollListenerFn.bind(this)
    this.resizeListenerFn = this.resizeListenerFn.bind(this)
  }

  init () {
    this.initParams()
    if (!this.elements) {
      return
    }
    this.scrollTimer = null
    this.defaultImg && this.addDefaultImg()
    this.resizeListenerFn()
    window.addEventListener('scroll', this.scrollListenerFn)
    window.addEventListener('touchmove', this.scrollListenerFn)
    window.addEventListener('resize', this.resizeListenerFn)
  }
  // 初始化一些必要的参数
  initParams () {
    let params = this.params
    let elements = params.elements
    let elementsDOMArr = typeof elements === 'string' ? Array.prototype.slice.call(document.querySelectorAll(elements), 0) : Array.prototype.slice.call(elements, 0)
    if (!elementsDOMArr.length) return
    // 如果是再次调用 init方法，则需要无需进行部分参数的初始化，以及需要清除之前的监听函数
    if (this.elements) {
      this.elements.length !== 0 && this.clearListener()
      this.elements = elementsDOMArr
      return
    }
    this.elements = elementsDOMArr
    this.defaultImg = params.defaultImg
    this.distance = params.distance || 0
    this.tag = params.tag || 'data-src'
    this.frequency = params.frequency || 14
    this.isBg = params.isBg || false
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
    let hasload = []
    let loadIndex
    for (let i = 0; i < len; i++) {
      let ele = this.elements[i]
      let rect = ele.getBoundingClientRect()
      if ((rect.top > 0 && this.H + distance >= rect.top) || (rect.top < 0 && (rect.top + rect.height >= -this.distance))) {
        if ((rect.left > 0 && this.W + distance >= rect.left) || (rect.left < 0 && (rect.left + rect.width >= -this.distance))) {
          this.loadItem(ele)
          hasload.push(i)
        }
      }
    }
    while (typeof (loadIndex = hasload.pop()) !== 'undefined') {
      this.elements.splice(loadIndex, 1)
    }
    // 已经没有需要懒加载的元素了
    this.elements.length === 0 && this.clearListener()
  }

  clearListener () {
    window.removeEventListener('scroll', this.scrollListenerFn)
    window.removeEventListener('touchmove', this.scrollListenerFn)
    window.removeEventListener('resize', this.resizeListenerFn)
  }
  // 懒加载图片
  loadItem (ele) {
    let imgUrl = ele.getAttribute(this.tag)
    imgUrl && (this.isBg ? ele.style.backgroundImage = 'url(' + imgUrl + ')' : ele.setAttribute('src', imgUrl))
  }
  // 添加默认图片或背景图
  addDefaultImg () {
    let elements = this.elements
    let len = elements.length
    let isBg = this.isBg
    for (let i = 0; i < len; i++) {
      isBg ? elements[i].style.backgroundImage = 'url(' + this.defaultImg + ')' : elements[i].setAttribute('src', this.defaultImg)
    }
  }

  getWH () {
    this.W = document.documentElement.clientWidth || window.innerWidth
    this.H = document.documentElement.clientHeight || window.innerHeight
  }
}

// 上面的 LazyLoad就是实现懒加载的类，下面是使用此类的简单示例，配合文件中的 lazyload.html可查看效果
let lazy = new LazyLoad({elements: '.img', distance: 50, tag: 'data-src', frequency: 14, isBg: true, defaultImg: 'https://dummyimage.com/200x200/ff0ff0&text=666'})
lazy.init()

document.getElementById('btn').onclick = () => {
  lazy.init()
}