// pages/controler/controler.js
import utils from '../../utils/util.js'
import NTC_DATA from '../../data/NTC_DATA.js'
Page({

  /**
   * 页面的初始数据
   */
	data: {
		humidityWarn: 0,// 尿量次数计数
		humidityWarnLimit: 120, // 尿量再次报警时间，单位秒
		tempWarn: 0,// 尿量次数计数
		tempWarnLimit: 120, // 体温再次报警时间，单位秒
		humidity_warning_switch: true, // 尿量报警开关
		temp_wraning_switch: true, // 温度报警开关
		limitTempLow: 36.1, // 体温过低
		limitTempHigh: 37, // 体温过高
		NTC_DATA: [],
  },

	// 页面跳转
	toPage: function (e) {
		utils.toPage(e)
	},

  //视频播放
  onWebView() {
    console.log('跳转视频播放！');
    wx.navigateTo({
      url: `../vedio/vedio`
    })
  },

	// 灯光强弱
	lightChange: function (e) {
		var value = e.detail.value
		this.shock_control(value)
	},
	// 一键启动
	quickRun: function (e) {
		console.log(e)
	},

	// 小米手环震动控制
	shock_control: function (e) {
		var that = this
		var strength = e.currentTarget.dataset.strength
		var deviceIdList = wx.getStorageSync('deviceIdList')
		var shock_data = wx.getStorageSync('shock_data')
		console.log(shock_data)
		let buffer = new ArrayBuffer(1)
		let dataView = new DataView(buffer)
		dataView.setUint8(0, strength)
		wx.writeBLECharacteristicValue({
			deviceId: deviceIdList[0],
			serviceId: shock_data.service.uuid,
			characteristicId: shock_data.characteristic.uuid,
			value: buffer,
			success: function(res) {
				console.log('震动命令发送成功', res)
			},
		})
	},
	// 有序数组二分法查找
	binarySearch: function (arr, num) {
		var left = 0;
		var right = arr.length - 1;

		while (left <= right) {
			var middle = Math.floor((right + left) / 2);
			if (right - left <= 1) {
				break;
			}
			var val = arr[middle];
			if (val == num) {
				return middle;
			}
			else if (val > num) {
				left = middle;
			}
			else {
				right = middle;
			}
		}

		var leftValue = arr[left];
		var rightValue = arr[right];
		return Math.abs(num - rightValue) > Math.abs(num - leftValue) ? left : right;
	},
	// 温度处理
	temperature: function (data) {
		var NTC_DATA = this.data.NTC_DATA
		var S = parseInt(data, 16) // S 为接收到的温度数据（16进制转十进制）
		console.log(S)
		var RT = (50 * S) / (4096 - S) // 根据原公式换算得求RT公式
		console.log("RT:", RT)
		var dataArray = []
		for (var item in NTC_DATA) {
			dataArray[item] = NTC_DATA[item].rt
		}
		var index = this.binarySearch(dataArray, RT)
		var temp = NTC_DATA[index].temp
		return temp
	},
	// buf2hex: function (buffer) {
	// 	return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
	// },
	// ArrayBuffer转16进度字符串示例
	buf2hex: function(buffer) {
		var hexArr = Array.prototype.map.call(
			new Uint8Array(buffer),
			function (bit) {
				return ('00' + bit.toString(16)).slice(-2)
			}
		)
  	return hexArr.join('');
	},
	// 搜索蓝牙
	searchbluetooth: function () {
		var that = this
		wx.startBluetoothDevicesDiscovery({
			services: ["1809"],
			interval: "1000", //每一秒获取一次数据
			allowDuplicatesKey: true,
			success: function (res) {
				console.log("开始搜索附近蓝牙设备", res)

				wx.onBluetoothDeviceFound(function (res) {
					var devices = res.devices
					var advertisData = devices[0].advertisData
					var manufacturer = that.buf2hex(advertisData).toUpperCase()
					console.log('manufacturer: ', manufacturer)
					var ints = ""
					for (var i = 0; i < manufacturer.length; i++) {
						ints += manufacturer[i]
						if (i % 2 == 1)
							ints += ','
					}
					var manuArray = ints.split(',')
					// console.log(manuArray) // 实例：["49", "50", "F3", "01", "07", "FA", "00", "00", ""]
					if (manuArray[0] == "49" && manuArray[1] == "50" && manuArray[2] == "F3") {
						// 前三个字节，公司代码正确
						if (manuArray[3] == "01") {
							// 第四个字节，产品编码正确

							// 第五六字节，温度数值处理
							var temp = that.temperature(manuArray[4] + manuArray[5])
							var limitTempHigh = that.data.limitTempHigh
							var limitTempLow = that.data.limitTempLow
							var tempFlag = temp < limitTempLow || temp > limitTempHigh // 体温是否异常
							var tempWarn = that.data.tempWarn
							console.log(temp)
							console.log("tempFlag: ", tempFlag, ", tempWarn: ", tempWarn)
							const innerAudioContext = wx.createInnerAudioContext()
							if (tempFlag == true) {
								tempWarn ++
								if (that.data.temp_wraning_switch == true) {
									that.setData({
										temp_wraning_switch: false,
										tempWarn: tempWarn
									})
									var count = 3 // 循环播放次数
									innerAudioContext.autoplay = true
									innerAudioContext.obeyMuteSwitch = false
									innerAudioContext.src = '/imgs/bbtiwen.mp3'
									innerAudioContext.onPlay(() => {
										console.log('宝宝温度异常')
										console.log(count, "次播放")
									})
									innerAudioContext.onEnded(() => {
										count--
										if (count > 0){
											innerAudioContext.play()
										} else {
											innerAudioContext.destroy()
										}
									})
									var tempStr = ""
									if (temp == 30) {
										tempStr = "低于30"
									} else if (temp == 45) {
										tempStr = "高于45"
									} else {
										tempStr = temp
									}
									//弹出提示框
									wx.showModal({
										title: '提示',
										showCancel: false,
										content: '宝宝体温异常了，目前体温为： ' + tempStr + '℃',
										success: function (res) {
											if (res.confirm) {
												console.log('用户点击确定');
												// 停止播放警报
												innerAudioContext.stop()
												innerAudioContext.destroy()
												// 关闭开关
												that.setData({
													temp_wraning_switch: false
												})
											}
										}
									})
								} else {
									that.setData({
										tempWarn: tempWarn
									})
								}
								if (tempWarn >= that.data.tempWarnLimit) {
									that.setData({
										tempWarn: 0,
										temp_wraning_switch: true
									})
								} 
							} else {
								that.setData({
									tempWarn: 0,
									temp_wraning_switch: true
								})
							}

							// 第八个字节，湿度，00为干爽，01为湿润
              console.log("manuArray[7]:", manuArray[7]);
              console.log(manuArray[7] == "00");
							if (manuArray[7] == "01") {
								// 若取到01湿润，则计数加一
								var humidityWarn = that.data.humidityWarn
                humidityWarn++

								var humiditySwitch = that.data.humidity_warning_switch             
								console.log("humidityWarn:", humidityWarn, ", humiditySwitch:", humiditySwitch);
								// 次数为5，并且尿量报警开关开着
								const innerAudioContext = wx.createInnerAudioContext()
								if (humidityWarn >= 5 && humiditySwitch == true) {
									// 计数为5，则播放警报
									that.setData({
										humidity_warning_switch: false
									})
									var count = 3 // 循环播放次数
									innerAudioContext.autoplay = true
									innerAudioContext.obeyMuteSwitch = false
									innerAudioContext.src = '/imgs/bbniao.mp3'
									innerAudioContext.onPlay(() => {
										console.log('宝宝尿了')
										console.log(count, "次播放")
									})
									innerAudioContext.onEnded(() => {
										count--
										if (count > 0) {
											innerAudioContext.play()
										} else {
											innerAudioContext.destroy()
										}
									})
									innerAudioContext.onEnded(() => {
										count-- 
										if (count > 0) {
											innerAudioContext.play()
										} else {
											innerAudioContext.stop()
										}
									})
									 
                  //弹出提示框
                  wx.showModal({
										title: '提示',
										showCancel: false,
                    content: '宝宝尿尿了',
                    success: function (res) {
                      if (res.confirm) {
												console.log('用户点击确定');
												// 停止播放警报
												// innerAudioContext.stop()
												// innerAudioContext.destroy()
												backgroundAudioManager.stop()
												// 关闭开关
												that.setData({
													humidity_warning_switch: false
												})
                      }
                    }
                  })

								} else if (humidityWarn >= that.data.humidityWarnLimit) {
									that.setData({
										humidityWarn: 0,
										humidity_warning_switch: true
									})
								} else {
									that.setData({
										humidityWarn: humidityWarn
									})
								}
							} else if (manuArray[7] == "00") {
								// 若取到00干爽，则重置计数并打开开关
								that.setData({
									humidityWarn: 0,
									humidity_warning_switch: true
								})
							}

						}
					}
				})
			}
		})
		
	},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		var that = this
		this.setData({
			NTC_DATA: NTC_DATA
		})
		// wx.openBluetoothAdapter({
		// 	success: function (res) {
		// 		console.log("初始化蓝牙适配器成功", res)
		// 		that.searchbluetooth()
		// 	},
		// 	fail: function (res) {
		// 		console.log("初始化蓝牙适配器失败", res)
		// 		wx.showLoading({
		// 			title: '蓝牙未开启',
		// 			mask: true
		// 		})
		// 	}
		// })
		// wx.onBluetoothAdapterStateChange(function (res) {
		// 	console.log("蓝牙适配器状态变化", res)
		// 	that.setData({
		// 		isbluetoothready: res.available,
		// 		searchingstatus: res.discovering
		// 	})
		// 	if (res.available == true) {
		// 		wx.hideLoading()
		// 		that.searchbluetooth()
		// 		if (res.discovering == true) {

		// 		}
		// 	} else if (res.available == false) {
		// 		wx.showLoading({
		// 			title: '蓝牙未开启',
		// 			mask: true
		// 		})
		// 	}
		// })
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
		wx.stopBluetoothDevicesDiscovery({
			success: function (res) {
				console.log("停止蓝牙搜索", res)
			}
		})
		wx.closeBluetoothAdapter({
			success: function (res) {
				console.log(res)
			}
		})
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