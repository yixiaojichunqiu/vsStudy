var Clip = require("./Clip");

var color = require("../tool/color");

var _util = require("../core/util");

var isArrayLike = _util.isArrayLike;

/**
 * @module echarts/animation/Animator
 */
var arraySlice = Array.prototype.slice;

function defaultGetter(target, key) {
  return target[key];
}

function defaultSetter(target, key, value) {
  target[key] = value;
}
/**
 * @param  {number} p0
 * @param  {number} p1
 * @param  {number} percent
 * @return {number}
 */


function interpolateNumber(p0, p1, percent) {
  //插值数值
  return (p1 - p0) * percent + p0;
}
/**
 * @param  {string} p0
 * @param  {string} p1
 * @param  {number} percent
 * @return {string}
 */


function interpolateString(p0, p1, percent) {
  return percent > 0.5 ? p1 : p0;
}
/**
 * @param  {Array} p0 //点0 [100,100] 
 * @param  {Array} p1 //点1 [200,0]
 * @param  {number} percent//0
 * @param  {Array} out//[100,100]
 * @param  {number} arrDim//1
 */


function interpolateArray(p0, p1, percent, out, arrDim) {
  //插值数组
  var len = p0.length;

  if (arrDim === 1) {
    for (var i = 0; i < len; i++) {
      out[i] = interpolateNumber(p0[i], p1[i], percent);
    }
  } else {
    var len2 = len && p0[0].length;

    for (var i = 0; i < len; i++) {
      for (var j = 0; j < len2; j++) {
        out[i][j] = interpolateNumber(p0[i][j], p1[i][j], percent);
      }
    }
  }
} // 0是源数组 1是目标数组
// 做一些预处理 避免 数组0到1插值时出错


function fillArr(arr0, arr1, arrDim) {
  var arr0Len = arr0.length;
  var arr1Len = arr1.length;

  if (arr0Len !== arr1Len) {
    //如果前面的帧 和 最后一帧 数组数据长度不同
    // FIXME Not work for TypedArray
    var isPreviousLarger = arr0Len > arr1Len;

    if (isPreviousLarger) {
      // 前面的帧数据多的话 就丢弃掉多的
      arr0.length = arr1Len;
    } else {
      // 前面的帧数据少的话 就补齐 补的值和最后一帧相同
      for (var i = arr0Len; i < arr1Len; i++) {
        arr0.push(arrDim === 1 ? arr1[i] : arraySlice.call(arr1[i]));
      }
    }
  } // 处理 NaN 的情况


  var len2 = arr0[0] && arr0[0].length;

  for (var i = 0; i < arr0.length; i++) {
    if (arrDim === 1) {
      if (isNaN(arr0[i])) {
        arr0[i] = arr1[i];
      }
    } else {
      for (var j = 0; j < len2; j++) {
        if (isNaN(arr0[i][j])) {
          arr0[i][j] = arr1[i][j];
        }
      }
    }
  }
}
/**
 * @param  {Array} arr0
 * @param  {Array} arr1
 * @param  {number} arrDim
 * @return {boolean}
 */


function isArraySame(arr0, arr1, arrDim) {
  if (arr0 === arr1) {
    return true;
  }

  var len = arr0.length;

  if (len !== arr1.length) {
    return false;
  }

  if (arrDim === 1) {
    for (var i = 0; i < len; i++) {
      if (arr0[i] !== arr1[i]) {
        return false;
      }
    }
  } else {
    var len2 = arr0[0].length;

    for (var i = 0; i < len; i++) {
      for (var j = 0; j < len2; j++) {
        if (arr0[i][j] !== arr1[i][j]) {
          return false;
        }
      }
    }
  }

  return true;
}
/**
 * Catmull–Rom interpolate array
 * @param  {Array} p0
 * @param  {Array} p1
 * @param  {Array} p2
 * @param  {Array} p3
 * @param  {number} t
 * @param  {number} t2
 * @param  {number} t3
 * @param  {Array} out
 * @param  {number} arrDim
 */
//Catmull–Rom 曲线
//Centripetal Catmull–Rom spline


function catmullRomInterpolateArray(p0, p1, p2, p3, t, t2, t3, out, arrDim) {
  var len = p0.length;

  if (arrDim === 1) {
    for (var i = 0; i < len; i++) {
      out[i] = catmullRomInterpolate(p0[i], p1[i], p2[i], p3[i], t, t2, t3);
    }
  } else {
    var len2 = p0[0].length;

    for (var i = 0; i < len; i++) {
      for (var j = 0; j < len2; j++) {
        out[i][j] = catmullRomInterpolate(p0[i][j], p1[i][j], p2[i][j], p3[i][j], t, t2, t3);
      }
    }
  }
}
/**
 * Catmull–Rom interpolate number
 * @param  {number} p0
 * @param  {number} p1
 * @param  {number} p2
 * @param  {number} p3
 * @param  {number} t
 * @param  {number} t2
 * @param  {number} t3
 * @return {number}
 */


function catmullRomInterpolate(p0, p1, p2, p3, t, t2, t3) {
  var v0 = (p2 - p0) * 0.5;
  var v1 = (p3 - p1) * 0.5;
  return (2 * (p1 - p2) + v0 + v1) * t3 + (-3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
}

function cloneValue(value) {
  if (isArrayLike(value)) {
    var len = value.length;

    if (isArrayLike(value[0])) {
      var ret = [];

      for (var i = 0; i < len; i++) {
        ret.push(arraySlice.call(value[i]));
      }

      return ret;
    }

    return arraySlice.call(value);
  }

  return value;
}

function rgba2String(rgba) {
  rgba[0] = Math.floor(rgba[0]);
  rgba[1] = Math.floor(rgba[1]);
  rgba[2] = Math.floor(rgba[2]);
  return 'rgba(' + rgba.join(',') + ')';
}

function getArrayDim(keyframes) {
  var lastValue = keyframes[keyframes.length - 1].value; //最后一个

  return isArrayLike(lastValue && lastValue[0]) ? 2 : 1; //最后一个和最后一个的第0位置都是数组 返回2
} //keyframes [{time:0,value;[100,100]},{time:200,value;[200,0]}]
//animation*3
//keyframes 关键帧信息 time多少 value多少


function createTrackClip(animator, easing, oneTrackDone, keyframes, propName, forceAnimate) {
  var getter = animator._getter;
  var setter = animator._setter;
  var useSpline = easing === 'spline'; //几个关键帧
  //位移动画时传入两个位置时为2

  var trackLen = keyframes.length;

  if (!trackLen) {
    return;
  } // Guess data type


  var firstVal = keyframes[0].value; //取第一个关键帧的value 例如[100,100]

  var isValueArray = isArrayLike(firstVal); //第一个是不是数组

  var isValueColor = false;
  var isValueString = false; // For vertices morphing
  //如果第一个关键帧里value是数组 取最后一个关键帧 如果最后一个关键帧是数组 并且其第0个元素也是数组 返回2 否则返回1
  //所以arrDim 为0 代表关键帧value是个值
  //arrDim 为1 代表关键帧value是个数组
  //arrDim 为2 代表关键帧value是数组套数组

  var arrDim = isValueArray ? getArrayDim(keyframes) : 0; //是数组 返回getArrayDim(keyframes)

  var trackMaxTime; // Sort keyframe as ascending
  //关键帧 按time排序 time小的在前面 time小的先发生

  keyframes.sort(function (a, b) {
    return a.time - b.time;
  }); //最后一帧的时间 决定了总共动画的时长

  trackMaxTime = keyframes[trackLen - 1].time; // Percents of each keyframe
  //各个关键帧占总时间的比例数组

  var kfPercents = []; // Value of each keyframe 关键帧的值

  var kfValues = [];
  var prevValue = keyframes[0].value; //准备值

  var isAllValueEqual = true;

  for (var i = 0; i < trackLen; i++) {
    kfPercents.push(keyframes[i].time / trackMaxTime); // Assume value is a color when it is a string

    var value = keyframes[i].value; // Check if value is equal, deep check if value is array
    //比较这一帧和上一帧的value

    if (!(isValueArray && isArraySame(value, prevValue, arrDim) || !isValueArray && value === prevValue)) {
      isAllValueEqual = false;
    }

    prevValue = value; //记录上一次value
    // Try converting a string to a color array
    // 如果value是字符串 看看是否解析成颜色

    if (typeof value === 'string') {
      var colorArray = color.parse(value);

      if (colorArray) {
        value = colorArray;
        isValueColor = true;
      } else {
        isValueString = true;
      }
    }

    kfValues.push(value);
  } //AllValue和上次相同时 两个帧value一样 return掉


  if (!forceAnimate && isAllValueEqual) {
    return;
  } //最后一帧的 value


  var lastValue = kfValues[trackLen - 1]; // Polyfill array and NaN value
  // 遍历关键帧

  for (var i = 0; i < trackLen - 1; i++) {
    if (isValueArray) {
      fillArr(kfValues[i], lastValue, arrDim); //所有的数组数据 以最后一个关键帧里数据数量为基准
    } else {
      if (isNaN(kfValues[i]) && !isNaN(lastValue) && !isValueString && !isValueColor) {
        kfValues[i] = lastValue;
      }
    }
  }

  isValueArray && fillArr(getter(animator._target, propName), lastValue, arrDim); //动画位于100，100 目标 200，0 让animator._target也和最后一帧数据一致
  // Cache the key of last frame to speed up when 缓存以后一帧的frame 以便动画顺序播放时加速
  // animation playback is sequency

  var lastFrame = 0;
  var lastFramePercent = 0;
  var start;
  var w; //？

  var p0;
  var p1;
  var p2;
  var p3;

  if (isValueColor) {
    var rgba = [0, 0, 0, 0];
  } //animation*4
  //percent 是当前的时间百分比走到哪里了


  var onframe = function (target, percent) {
    // Find the range keyframes
    // kf1-----kf2---------current--------kf3
    // find kf2 and kf3 and do interpolation 当前在关键帧2和3之间 做插值
    var frame; // In the easing function like elasticOut, percent may less than 0

    if (percent < 0) {
      frame = 0;
    } else if (percent < lastFramePercent) {
      //待看TODO
      // Start from next key
      // PENDING start from lastFrame
      start = Math.min(lastFrame + 1, trackLen - 1);

      for (frame = start; frame >= 0; frame--) {
        if (kfPercents[frame] <= percent) {
          break;
        }
      } // PENDING really need to do this


      frame = Math.min(frame, trackLen - 2);
    } else {
      //每次比上次的大
      for (frame = lastFrame; frame < trackLen; frame++) {
        if (kfPercents[frame] > percent) {
          break;
        }
      }

      frame = Math.min(frame - 1, trackLen - 2);
    }

    lastFrame = frame; //缓存这次调用 算出的frame 和 percent

    lastFramePercent = percent; //kfPercents[frame + 1] 目标帧的percent kfPercents[frame] 上一帧的percent

    var range = kfPercents[frame + 1] - kfPercents[frame]; //两个关键帧之间的比例差 0.25

    if (range === 0) {
      return;
    } else {
      //现在走到了当前两帧之间的多少百分比了 w目前理解为t
      w = (percent - kfPercents[frame]) / range;
    } //所谓样条曲线(Spline Curves)是指给定一组控制点而得到一条曲线，曲线的大致形状由这些点予以控制，一般可分为插值样条和逼近样条两种，插值样条通常用于数字化绘图或动画的设计，逼近样条一般用来构造物体的表面。


    if (useSpline) {
      //spline是样条,是一种分段光滑的多项式,
      p1 = kfValues[frame];
      p0 = kfValues[frame === 0 ? frame : frame - 1];
      p2 = kfValues[frame > trackLen - 2 ? trackLen - 1 : frame + 1];
      p3 = kfValues[frame > trackLen - 3 ? trackLen - 1 : frame + 2];

      if (isValueArray) {
        catmullRomInterpolateArray(p0, p1, p2, p3, w, w * w, w * w * w, getter(target, propName), arrDim);
      } else {
        var value;

        if (isValueColor) {
          value = catmullRomInterpolateArray(p0, p1, p2, p3, w, w * w, w * w * w, rgba, 1);
          value = rgba2String(rgba);
        } else if (isValueString) {
          // String is step(0.5)
          return interpolateString(p1, p2, w);
        } else {
          value = catmullRomInterpolate(p0, p1, p2, p3, w, w * w, w * w * w);
        }

        setter(target, propName, value);
      }
    } else {
      if (isValueArray) {
        interpolateArray( //知道在哪两个关键帧之间 又知道在两个关键帧处于什么百分比 算出目前应该的值就行了
        kfValues[frame], kfValues[frame + 1], w, getter(target, propName), arrDim);
      } else {
        var value;

        if (isValueColor) {
          interpolateArray(kfValues[frame], kfValues[frame + 1], w, rgba, 1);
          value = rgba2String(rgba);
        } else if (isValueString) {
          // String is step(0.5)
          return interpolateString(kfValues[frame], kfValues[frame + 1], w);
        } else {
          value = interpolateNumber(kfValues[frame], kfValues[frame + 1], w);
        }

        setter(target, propName, value);
      }
    }
  }; //创建一个clip对象


  var clip = new Clip({
    target: animator._target,
    life: trackMaxTime,
    loop: animator._loop,
    delay: animator._delay,
    onframe: onframe,
    //传递一个闭包
    ondestroy: oneTrackDone
  });

  if (easing && easing !== 'spline') {
    clip.easing = easing; //clip的easing属性被赋值
  }

  return clip;
}
/**
 * @alias module:zrender/animation/Animator
 * @constructor
 * @param {Object} target
 * @param {boolean} loop
 * @param {Function} getter
 * @param {Function} setter
 */


var Animator = function (target, loop, getter, setter) {
  this._tracks = {};
  this._target = target;
  this._loop = loop || false;
  this._getter = getter || defaultGetter;
  this._setter = setter || defaultSetter;
  this._clipCount = 0;
  this._delay = 0;
  this._doneList = [];
  this._onframeList = [];
  this._clipList = [];
};

Animator.prototype = {
  /**
   * Set Animation keyframe
   * @param  {number} time 关键帧时间，单位是ms
   * @param  {Object} props 关键帧的属性值，key-value表示
   * @return {module:zrender/animation/Animator}
   */
  when: function (time
  /* ms */
  , props) {
    //when 方法
    var tracks = this._tracks;

    for (var propName in props) {
      if (!props.hasOwnProperty(propName)) {
        continue;
      }

      if (!tracks[propName]) {
        tracks[propName] = []; // Invalid value

        var value = this._getter(this._target, propName);

        if (value == null) {
          // zrLog('Invalid property ' + propName);
          continue;
        } // If time is 0
        //  Then props is given initialize value
        // Else
        //  Initialize value from current prop value


        if (time !== 0) {
          tracks[propName].push({
            time: 0,
            value: cloneValue(value)
          });
        }
      }

      tracks[propName].push({
        time: time,
        value: props[propName]
      });
    }

    return this;
  },

  /**
   * 添加动画每一帧的回调函数
   * @param  {Function} callback
   * @return {module:zrender/animation/Animator}
   */
  during: function (callback) {
    this._onframeList.push(callback);

    return this;
  },
  pause: function () {
    for (var i = 0; i < this._clipList.length; i++) {
      this._clipList[i].pause();
    }

    this._paused = true;
  },
  resume: function () {
    for (var i = 0; i < this._clipList.length; i++) {
      this._clipList[i].resume();
    }

    this._paused = false;
  },
  isPaused: function () {
    return !!this._paused;
  },
  _doneCallback: function () {
    // Clear all tracks
    this._tracks = {}; // Clear all clips

    this._clipList.length = 0;
    var doneList = this._doneList;
    var len = doneList.length;

    for (var i = 0; i < len; i++) {
      doneList[i].call(this);
    }
  },

  /**
   * Start the animation
   * @param  {string|Function} [easing]
   *         动画缓动函数，详见{@link module:zrender/animation/easing}
   * @param  {boolean} forceAnimate
   * @return {module:zrender/animation/Animator}
   */
  //animation*1
  start: function (easing, forceAnimate) {
    //start方法
    var self = this;
    var clipCount = 0;

    var oneTrackDone = function () {
      clipCount--;

      if (!clipCount) {
        self._doneCallback();
      }
    };

    var lastClip; //animation*2 动画属性遍历 例如有个position 则propName = "position"

    for (var propName in this._tracks) {
      if (!this._tracks.hasOwnProperty(propName)) {
        continue;
      }

      var clip = createTrackClip( //创建clip
      this, easing, oneTrackDone, this._tracks[propName], propName, forceAnimate);

      if (clip) {
        this._clipList.push(clip); //加入到_clipList


        clipCount++; // If start after added to animation

        if (this.animation) {
          this.animation.addClip(clip);
        }

        lastClip = clip;
      }
    } // Add during callback on the last clip


    if (lastClip) {
      var oldOnFrame = lastClip.onframe;

      lastClip.onframe = function (target, percent) {
        oldOnFrame(target, percent);

        for (var i = 0; i < self._onframeList.length; i++) {
          self._onframeList[i](target, percent);
        }
      };
    } // This optimization will help the case that in the upper application
    // the view may be refreshed frequently, where animation will be
    // called repeatly but nothing changed.


    if (!clipCount) {
      this._doneCallback();
    }

    return this;
  },

  /**
   * Stop animation
   * @param {boolean} forwardToLast If move to last frame before stop
   */
  stop: function (forwardToLast) {
    var clipList = this._clipList;
    var animation = this.animation;

    for (var i = 0; i < clipList.length; i++) {
      var clip = clipList[i];

      if (forwardToLast) {
        // Move to last frame before stop
        clip.onframe(this._target, 1);
      }

      animation && animation.removeClip(clip);
    }

    clipList.length = 0;
  },

  /**
   * Set when animation delay starts
   * @param  {number} time 单位ms
   * @return {module:zrender/animation/Animator}
   */
  delay: function (time) {
    this._delay = time;
    return this;
  },

  /**
   * Add callback for animation end 动画结束回调
   * @param  {Function} cb
   * @return {module:zrender/animation/Animator}
   */
  done: function (cb) {
    if (cb) {
      this._doneList.push(cb);
    }

    return this;
  },

  /**
   * @return {Array.<module:zrender/animation/Clip>}
   */
  getClips: function () {
    return this._clipList;
  }
};
var _default = Animator;
module.exports = _default;