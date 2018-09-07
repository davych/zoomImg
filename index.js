'use strict';
/**
 * @param  
 * target 目标图片的原生dom对象
 * @param
 * options 标准定制化配置项目
 * ----
 *      @param
 *          coverWidth  遮罩层宽度， coverIndex 遮罩层层叠层级， mapIndex 目标层叠层级， srcImg 原始图片
 */
function zoomIndex(target, options) {
    if(!target) {
        throw new Error('need dom element');
        return 
    }
    if(!options.srcImg)  {
        throw new Error('need srcImg');
        return 
    }
    var self = this;
    var defaultOptions = {
        coverWidth: 100,
        coverIndex: 1000,
        mapIndex:1000,
        srcImg:'',
    }
    this.options = Object.assign(defaultOptions, options);
    target.onload  = function() {
       self.init(target);
    }

    return this;
}

zoomIndex.prototype.init = function(target) {
    this.target = target;
    // document.scrollingElement.scrollTop
    this.targetPosition = {
        x: this.target.x,
        y: this.getTargetY()
    }
    this.targetStyle = {
        w: this.target.width,
        h: this.target.height
    }
    /**@description 设置覆盖区域box */
    this.setCoverBox();

    /**@description 设置映射区域box */
    this.setMapBox();

    /**@description 初始化事件 */
    this.setEventHandler();

    return this;
}
zoomIndex.prototype.getTargetY = function() {
    return document.scrollingElement?this.target.offsetTop - document.scrollingElement.scrollTop:this.target.y
}
zoomIndex.prototype.setCoverBox = function() {
    // 根据target 计算 coverHeight
    this.coverHeight = (this.targetStyle.h*this.options.coverWidth)/this.targetStyle.w;
    this.coverStyle = {
        left: this.targetPosition.x + 'px', 
        top: this.targetPosition.y + 'px', 
        // display: 'none',
        width: this.options.coverWidth + 'px', 
        height: this.coverHeight + 'px', 
        pointerEvents: 'none',
        backgroundImage:"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAMAAABFaP0WAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAGUExURT1uzv///62t27cAAAACdFJOU/8A5bcwSgAAABBJREFUeNpiYGBkYGQECDAAAA0ABMZIs2EAAAAASUVORK5CYII=)",
        opacity: '.5',
        zIndex: this.options.coverIndex,
        position: 'fixed'
    };
    this.coverSpan = document.createElement("span"); 
    document.body.append(this.coverSpan);
    // this.target.parentNode.append(this.coverSpan);
    this.setStyle(this.coverSpan, this.coverStyle);
}
zoomIndex.prototype.setMapBox = function() {
    this.mapStyle = {
        left: this.targetPosition.x + this.targetStyle.w + 20 + 'px', 
        top: this.targetPosition.y + 'px', 
        display: 'none',
        width: this.targetStyle.w + 'px', 
        height:  this.targetStyle.h + 'px', 
        pointerEvents: 'none',
        backgroundColor: 'red',
        overflow:'hidden',
        zIndex: this.options.mapIndex,
        position: 'fixed'
    };
    this.mapSpan = document.createElement("span"); 
    document.body.append(this.mapSpan);
    this.setStyle(this.mapSpan, this.mapStyle);
    this.mapImg = document.createElement("img"); 
    this.mapImg.setAttribute('src', this.options.srcImg);
    this.mapSpan.append(this.mapImg);
    this.imgStyle = {
        position: 'absolute',
        left: 0,
        top: 0,
    }
    // 计算coverWidth占用img的比例，计算出srcImg的大小
    this.srcWidth = (this.targetStyle.w*this.targetStyle.w)/this.options.coverWidth;
    this.srcHeight = (this.targetStyle.h*this.targetStyle.h)/this.coverHeight;
    this.imgStyle.width = this.srcWidth + 'px';
    this.imgStyle.height = this.srcHeight + 'px';
    this.setStyle(this.mapImg, this.imgStyle);
}
zoomIndex.prototype.fresh = function(options) {
    Object.assign(this.options, options);
}
zoomIndex.prototype.setEventHandler = function() {
    // 鼠标移动
    var self = this;
    this.target.onmousemove = function(e) {
        self.mapImg.src = self.options.srcImg;
        var curLeft = e.x - self.options.coverWidth/2;
        var curTop = e.y - self.coverHeight/2;
        if(curLeft < self.target.x) curLeft = self.target.x
        if(curLeft > (self.target.x + self.targetStyle.w - self.options.coverWidth)) curLeft = self.target.x + self.targetStyle.w - self.options.coverWidth;
        if(curTop < self.getTargetY()) curTop = self.getTargetY()
        if(curTop > (self.getTargetY() + self.targetStyle.h - self.coverHeight)) curTop = self.getTargetY() + self.targetStyle.h - self.coverHeight
        self.setStyle(self.coverSpan, {left: curLeft + 'px', top: curTop + 'px', display: 'inline-block'});
        // 计算 w和h的比列
        var wRatio = self.targetStyle.w/self.srcWidth;
        var hRatio = self.targetStyle.h/self.srcHeight;
        var mapImgLeft = (curLeft - self.target.x)/wRatio;
        var mapImgTop = (curTop - self.getTargetY())/hRatio;
        self.setStyle(self.mapImg, {left: -mapImgLeft + 'px', top: -mapImgTop + 'px'});
        self.setStyle(self.mapSpan, {top: self.getTargetY() + 'px', left: self.target.x + self.targetStyle.w + 20 + 'px', display: 'inline-block'});
    }
    this.target.onmouseout = function(e) {
        self.setStyle(self.coverSpan, {display: 'block'});
        self.setStyle(self.mapSpan, {display: 'none'});
    }
}

zoomIndex.prototype.setStyle = function(dom, style) {
    for(var k in style) {
        dom.style[k] = style[k];
    }
}

// 兼容 commonjs
if(typeof(module) !== 'undefined') {
    if(typeof(module.exports) !== 'undefined') { 
        module.exports = zoomIndex;
    }
}
