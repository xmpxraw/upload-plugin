// # 基于codovra的图片上传插件
// # 请注意，ios端浏览器 强制依赖 fastclick，请确认初始化前引入 fastclick 安装包并且初始化fastclick成功
// # 否则会出现点击延迟 或者 点击无效的情况
// ########## 参数说明 ############
// # $parent 初始化父元素 =====================================>格式：Object $('xx')
// # imgLength 允许上传的最大图片数量 默认为9=====================>格式：Number 1,2,3
// # sourceType 选择相片的方式 默认相册 + 拍照====================>格式：Array ['camera', 'album']
// # hasUploadImgLocalId 旧有的图片的localid====================>格式： Array [1,2,3] 如果没有可传 null 
// # hasUploadImgServerId 旧有的图片 hasUploadImgServerId=======>格式： Array [1,2,3] 如果没有可传 null 
function uploadImg($parent, imgLength, sourceType, hasUploadImgLocalId, hasUploadImgServerId) {
  var _this = this
  // 按钮元素
  _this.$upload_list_item = $('<div class="imgContainerLi" style="z-index: 9;width: 30%;height: 4rem;margin-left:2%;margin-top: .5rem;float: left;border: 1px solid #dedede;border-radius: .1rem;position:relative;"><img src="" class="showImg" style="display: none;width: 100%;height: 100%;position: absolute;left: 0;top: 0;"><img src="/html/images/project__add.png" alt="" class="addImg" style="width: 2rem;height: 2rem;position:absolute;left: 50%;margin-left: -1rem;margin-top: 1rem;"><span class="delete" style="display: none;width: 1rem;height: 1rem;line-height: 1rem;position: absolute;right: -.4rem;top: -.4rem;z-index: 99;border: 1px solid #dedede;border-radius: 50%;text-align: center;background: red;color: #fff;">x</span></div>')
  _this.sourceType = sourceType || ['camera', 'album'] // 选择相片的方式 默认相册 + 拍照
  _this.$parent = $parent // 初始化父元素 
  _this.uploadIndex = 0 //  上传索引值
  _this.imgLength = imgLength || 9 // 总可上传数量
  _this.uploadLoadCount = _this.imgLength // 剩余可上传数量
  _this.localIds = null //存储 刻多瓦 返回的本地id
  _this.parentEle = null //放 img list 的父级元素
  _this.serverIdArr = [] //存储 serverid 的数组
  _this.hasUploadImgLocalId = hasUploadImgLocalId || [] // 旧有的图片 localid 
  _this.hasUploadImgServerId = hasUploadImgServerId || [] // 旧有的图片 hasUploadImgServerId 
  $parent.append(_this.$upload_list_item)
  _this.addEvt() // 初始化事件
}
// 添加事件
uploadImg.prototype.addEvt = function (e) {
  var _this = this,
    $addImg = '.' + _this.$parent.attr('class') + ' .addImg',
    $deleteBtn = '.' + _this.$parent.attr('class') + ' .delete'
  $(document).on('click', $addImg, function (e) {
    _this.chooseImage(e)
  })
  $(document).on('click', $deleteBtn, function (e) {
    _this.deleteImage(e)
  })
  _this.initHasUploadImg()
}
// 设置之前旧有的已上传的图片
uploadImg.prototype.initHasUploadImg = function () {
  var _this = this, domStr = ''
  if (_this.hasUploadImgLocalId.length === 0) {
    console.log("请注意=======》_this.hasUploadImgLocalId 长度为0，即是无旧有的 localid 图片")
    return
  }
  if (_this.hasUploadImgLocalId.length > _this.imgLength) {
    console.log("请注意=======》_this.hasUploadImgLocalId 长度 > 参数中可上传长度")
    return
  }
  if (_this.hasUploadImgServerId.length === 0) {
    console.log("请注意=======》_this.hasUploadImgServerId 长度为0，即是无旧有的 hasUploadImgServerId 图片")
    return
  }
  if (_this.hasUploadImgServerId.length > _this.imgLength) {
    console.log("请注意=======》_this.hasUploadImgServerId 长度 > 参数中可上传长度")
    return
  }
  console.log(_this.$parent.find('.imgContainerLi'))
  for (var i in _this.hasUploadImgLocalId) {
    domStr += '<div class="imgContainerLi" style="z-index: 9;width: 30%;height: 4rem;margin-left:2%;margin-top: .5rem;float: left;border: 1px solid #dedede;border-radius: .1rem;position:relative;"><img src="' + _this.hasUploadImgLocalId[i] + '" class="showImg" style="width: 100%;height: 100%;position: absolute;left: 0;top: 0;"><img src="/html/images/project__add.png" alt="" class="addImg" style="width: 2rem;height: 2rem;position: absolute;left: 50%;margin-left: -1rem;margin-top: 1rem;display: none;"><span class="delete" style="width: 1rem;height: 1rem;line-height: 1rem;position: absolute;right: -.4rem;top: -.4rem;z-index: 99;border: 1px solid #dedede;border-radius: 50%;text-align: center;background: red;color: #fff;">x</span></div>'
  }
  for (var i in _this.hasUploadImgServerId) {
    _this.serverIdArr.push(_this.hasUploadImgServerId[i])
  }
  _this.$parent.find('.imgContainerLi').before(domStr)
  _this.parentEle = _this.$parent.find('.imgContainerLi:last')
  _this.isHideUploadItem()

}
// 选择图片
uploadImg.prototype.chooseImage = function (e) {
  var _this = this,
    $target = $(e.currentTarget),
    $targetPrev = $target.prev(),
    $targetNext = $target.next()
  wx.chooseImage({
    count: _this.uploadLoadCount, // 默认9
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: _this.sourceType, // 可以指定来源是相册还是相机，默认二者都有 ['camera', 'album']
    success: function (res) {
      var localIds = res.localIds // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
      // 多张图片 or 一张图片
      if (typeof (localIds) != 'object') {
        _this.localIds = [localIds]
      } else {
        _this.localIds = localIds
      }
      _this.uploadImage()
      _this.parentEle = $target.parent()
    },
    error: function (data) {
      console.log('error' + data)
    }
  })
}
// 设置已选择图片
uploadImg.prototype.setListImgSrc = function (localIdsData) {
  var domStr = '',
    _this = this
  for (var i in localIdsData) {
    domStr += '<div class="imgContainerLi" style="z-index: 9;width: 30%;height: 4rem;margin-left:2%;margin-top: .5rem;float: left;border: 1px solid #dedede;border-radius: .1rem;position:relative;"><img src="' + localIdsData[i] + '" class="showImg" style="width: 100%;height: 100%;position: absolute;left: 0;top: 0;"><img src="/html/images/project__add.png" alt="" class="addImg" style="width: 2rem;height: 2rem;position: absolute;left: 50%;margin-left: -1rem;margin-top: 1rem;display: none;"><span class="delete" style="width: 1rem;height: 1rem;line-height: 1rem;position: absolute;right: -.4rem;top: -.4rem;z-index: 99;border: 1px solid #dedede;border-radius: 50%;text-align: center;background: red;color: #fff;">x</span></div>'
  }
  _this.parentEle.before(domStr)
  _this.isHideUploadItem()
}
// 上传图片
uploadImg.prototype.uploadImage = function () {
  var _this = this,
    currentIndex
  wx.uploadImage({
    localId: _this.localIds[_this.uploadIndex], // 需要上传的图片的本地ID，由chooseImage接口获得
    isShowProgressTips: 1, // 默认为1，显示进度提示
    success: function (res) {
      var serverId = res.serverId // 返回图片的服务器端ID
      console.log(serverId, '==========serverId')
      _this.serverIdArr.push(res.serverId)
      // 当前索引 index
      currentIndex = Number(_this.uploadIndex) + 1
      if (currentIndex === _this.localIds.length) {
        _this.setListImgSrc(_this.localIds)
        _this.uploadIndex = 0
      } else {
        _this.uploadIndex++
        _this.uploadImage()
      }
      console.log(_this.serverIdArr, '==========_this.serverIdArr')
      return _this.serverIdArr
    }
  })
}
// 删除上传图片
uploadImg.prototype.deleteImage = function (e) {
  if (confirm('图片删除后无法恢复，确定要删除该图片？')) {
    var _this = this,
      $target = $(e.currentTarget),
      targetType = $target.parent().attr('data-type'),
      $deleteIndex = Number($target.parent().index()) - 1
    $target.parent().remove()
    _this.serverIdArr.splice($deleteIndex, 1)
    _this.isHideUploadItem()
    return _this.serverIdArr
  }
  console.log(_this.serverIdArr, '=========>this.serverIdArr')
}
// 判断是否超出 length
uploadImg.prototype.isHideUploadItem = function (e) {
  var _this = this
  if (_this.serverIdArr.length >= _this.imgLength) {
    _this.parentEle.hide()
  } else {
    _this.parentEle.show()
  }
  // 计算剩余上传数量
  _this.uploadLoadCount = _this.imgLength - _this.serverIdArr.length
}
