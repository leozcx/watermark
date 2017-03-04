let defaultOption = {
  id: 'watermark-1',
  width: 140,
  preventTamper: false,
  height: 100,
  text: 'watermark',
  font: '20px Times New Roman',
  rotateDegree: 30 * Math.PI / 180,
  style: {
    'pointer-events': 'none',
    width:'100%',
    height: '100%',
    top:0,
    left:0,
    position: 'fixed',
    'z-index':1000
  }
}
let container, observer, backgroundUrl

function remove() {
  var elem = document.getElementById(defaultOption.id);
  if(elem)
    elem.parentNode.removeChild(elem);
}
//create image base64 url via canvas
function createImageUrl(options) {
  var canvas = document.createElement('canvas');
  var text = options.text;
  canvas.width = options.width
  canvas.height = options.height
  var ctx = canvas.getContext('2d');
  ctx.shadowOffsetX = 2;     //X轴阴影距离，负值表示往上，正值表示往下
  ctx.shadowOffsetY = 2;     //Y轴阴影距离，负值表示往左，正值表示往右
  ctx.shadowBlur = 2;     //阴影的模糊程度
  // ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';    //阴影颜色
  ctx.font = options.font
  ctx.fillStyle = "rgba(204,204,204,0.45)"
  ctx.rotate(options.rotateDegree);
  ctx.translate(options.trax, options.tray);
  ctx.textAlign = 'left';
  ctx.fillText(text, 35, 32);    //实体文字
  return canvas.toDataURL('image/png')
}

function createContainer(options, forceCreate) {
  let oldDiv = document.getElementById(options.id)
  if(!forceCreate && oldDiv)
    return container
  let url = createImageUrl(options)
  var div = oldDiv ? oldDiv : document.createElement('div');
  div.id = options.id
  let parentEl = options.preventTamper ? document.body : (options.parentEl || document.body)
  if(typeof parentEl === 'string') {
    if(parentEl.startsWith('#'))
      parentEl = parentEl.substring(1)
    parentEl = document.getElementById(parentEl)
  }
  let rect = parentEl.getBoundingClientRect()
  options.style.left = (options.left || rect.left) + 'px'
  options.style.top = (options.top ||rect.top) + 'px'
  div.style.cssText = getStyleText(options)
  div.setAttribute('class', '')
  backgroundUrl =  'url(' + url + ') repeat top left';
  div.style.background = backgroundUrl
  !oldDiv && parentEl.appendChild(div)
  return div
}
function getStyleText(options) {
  let ret = '', style = options.style
  Object.keys(style).forEach((k) => {
    ret += k + ': ' + style[k] + ';'
  })
  return ret
}
function observe(options, observeBody) {
  let target = container
  observer = new MutationObserver(function(mutations) {
    observer.disconnect()
    container = createContainer(options, true)
    var config = { attributes: true, childList: true, characterData: true, subtree:true };
    observer.observe(target, config);
  });
  var config = { attributes: true, childList: true, characterData: true, subtree:true };
  observer.observe(target, config);

  //observe body element, recreate if the element is deleted
  var pObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if(m.type === 'childList' && m.removedNodes.length > 0) {
        let watermarkNodeRemoved = false
        for(let n of m.removedNodes) {
          if(n.id === options.id) {
            watermarkNodeRemoved = true
          }
        }
        observe(options, false)
      }
    })
  }); 
  pObserver.observe(document.body, {childList: true,subtree:true});
}

function init(options) {
  options = !options ? defaultOption : Object.assign({}, defaultOption, options)
  container = createContainer(options)
  options.preventTamper && observe(options, true)
}

export default init
