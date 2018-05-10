// pages/setting/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		tempArr: [],
		limitTempLow: 36.1, // 体温过低
		limitTempHigh: 37, // 体温过高
		highest: 50, // 阈值最大
		lowest: 0, // 阈值最小
  },

	// 最小值输入时存储
	getLimitTempLow: function (e) {
		var limitTempLow = e.detail.value
		this.setData({
			limitTempLow: limitTempLow
		})
		wx.setStorageSync('limitTempLow', limitTempLow)
	},
	// 最小值失焦时校验
	limitTempLowCheck: function (e) {
		var limitTempLow = e.detail.value
		var limitTempHigh = parseFloat(this.data.limitTempHigh)
		var lowest = this.data.lowest
		if (limitTempLow < lowest) {
			wx.showToast({
				title: '不能小于' + lowest +'℃',
				icon: 'loading'
			})
			limitTempLow = lowest
		}
		if (limitTempLow >= limitTempHigh) {
			wx.showToast({
				title: '必须小于最大值',
				icon: 'loading'
			})
			limitTempLow = limitTempHigh - 1
		}
		limitTempLow = parseFloat(limitTempLow)
		this.setData({
			limitTempLow: limitTempLow
		})
		wx.setStorageSync('limitTempLow', limitTempLow)
	},
	// 最大值输入时存储
	getLimitTempHigh: function (e) {
		var limitTempHigh = e.detail.value
		this.setData({
			limitTempHigh: limitTempHigh
		})
		wx.setStorageSync('limitTempHigh', limitTempHigh)
	},
	// 最大值失焦时校验
	limitTempHighCheck: function (e) {
		var limitTempHigh = e.detail.value
		var limitTempLow = parseFloat(this.data.limitTempLow)
		var highest = this.data.highest
		if (limitTempHigh > highest) {
			wx.showToast({
				title: '不能大于' + highest+'℃',
				icon: 'loading'
			})
			limitTempHigh = highest
		}
		if (limitTempHigh <= limitTempLow) {
			wx.showToast({
				title: '必须大于最小值',
				icon: 'loading'
			})
			limitTempHigh = limitTempLow + 1
		}
		limitTempHigh = parseFloat(limitTempHigh)
		this.setData({
			limitTempHigh: limitTempHigh
		})
		wx.setStorageSync('limitTempHigh', limitTempHigh)
	},
	// 尿湿开关 
	setHumiditySwitch: function (e) {
		var value = e.detail.value
		if (value == true) {
			value = '1'
		} else {
			value = '0'
		}
		wx.setStorageSync('humiditySoundSwitch', value)
	},
	// 体温开关 
	setTempSwitch: function (e) {
		var value = e.detail.value
		if (value == true) {
			value = '1'
		} else {
			value = '0'
		}
		wx.setStorageSync('tempSoundSwitch', value)
	},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		// 开关初始化
		var humiditySoundSwitch = wx.getStorageSync('humiditySoundSwitch')
		if (!humiditySoundSwitch) {
			humiditySoundSwitch = '1'
		}
		var tempSoundSwitch = wx.getStorageSync('tempSoundSwitch')
		if (!tempSoundSwitch) {
			tempSoundSwitch = '1'
		}
		this.setData({
			humiditySoundSwitch: humiditySoundSwitch,
			tempSoundSwitch: tempSoundSwitch,
		})

		// 阈值初始化
		var limitTempLow = wx.getStorageSync('limitTempLow')
		var limitTempHigh = wx.getStorageSync('limitTempHigh')
		if (!limitTempLow) {
			limitTempLow = 0
		}
		if (!limitTempHigh) {
			limitTempHigh = 50
		}
		this.setData({
			limitTempLow: limitTempLow,
			limitTempHigh: limitTempHigh
		})
		wx.setStorageSync('limitTempLow', limitTempLow)
		wx.setStorageSync('limitTempHigh', limitTempHigh)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})