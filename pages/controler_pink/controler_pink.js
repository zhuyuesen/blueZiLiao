// pages/controler/controler.js
import utils from '../../utils/util.js'
import NTC_DATA from '../../data/NTC_DATA.js'
Page({

  /**
   * 页面的初始数据
   */
	data: {
		humidityWarn: 0,// 一级尿量次数计数（换尿布）
		humiditySecWarn: 0, // 二级尿量次数计数
		humidityWarnLimit: 120, // 尿量再次报警时间，单位秒
		tempWarn: 0,// 尿量次数计数
		tempWarnLimit: 120, // 体温再次报警时间，单位秒
		humidity_warning_switch: true, // 尿量报警开关
		temp_wraning_switch: true, // 温度报警开关
		limitTempLow: 36.1, // 体温过低
		limitTempHigh: 37, // 体温过高
		NTC_DATA: [], // RT数据源
		tempStr: '0', // 温度字符串
		humidityData: 0, // 尿量参数 0为绿 1为黄 2为红
		keepTempCount: 60, // 维护数组所需计数
		keepTempLimit: 60, // 维护数组统计频率（单位秒）
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
			services: ["FFF0"],
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
					var humiditySoundSwitch = wx.getStorageSync('humiditySoundSwitch')
					if (!humiditySoundSwitch) {
						humiditySoundSwitch = '1'
					}
					var tempSoundSwitch = wx.getStorageSync('tempSoundSwitch')
					if (!tempSoundSwitch) {
						tempSoundSwitch = '1'
					}
					console.log('humiditySoundSwitch:', humiditySoundSwitch, 'tempSoundSwitch:', tempSoundSwitch)
					var manuArray = ints.split(',')
					// console.log(manuArray) // 实例：["49", "50", "F3", "01", "07", "FA", "00", "00", ""]
					if (manuArray[0] == "49" && manuArray[1] == "50" && manuArray[2] == "F3") {
						// 前三个字节，公司代码正确
						if (manuArray[3] == "01") {
							// 第四个字节，产品编码正确

							// 第五六字节，温度数值处理
							var temp = that.temperature(manuArray[4] + manuArray[5]) // 取得温度数据
							var limitTempHigh = wx.getStorageSync('limitTempHigh')
							var limitTempLow = wx.getStorageSync('limitTempLow')
							var tempFlag = temp < limitTempLow || temp > limitTempHigh // 体温是否异常
							var tempWarn = that.data.tempWarn
							// 温度展示字符串拼接
							var tempStr = temp
							// if (temp == 30) {
							// 	tempStr = "低于30"
							// } else if (temp == 45) {
							// 	tempStr = "高于45"
							// } else {
							// 	tempStr = temp
							// }
							that.setData({
								tempStr: tempStr
							})
							console.log(temp)
							console.log("tempFlag: ", tempFlag, ", tempWarn: ", tempWarn)

							// 本地维护温度数组(10个)
							var keepTempCount = that.data.keepTempCount
							if (keepTempCount >= that.data.keepTempLimit) {
								var tempArr = wx.getStorageSync('tempArr') || []
								// tempArr.shift()
								var length = tempArr.length
								if (length >= 10)
									tempArr.shift()
								var parme = {}
								var myDate = new Date()
								parme["temp"] = temp
								parme["time"] = myDate.getHours() + ':' + myDate.getMinutes();
								tempArr.push(parme)
								// tempArr.unshift({ temp: 30, time: '' })
								wx.setStorageSync('tempArr', tempArr)
								that.setData({
									keepTempCount: 0
								})
							} else {
								keepTempCount ++
								that.setData({
									keepTempCount: keepTempCount
								})
							}

							// 若温度异常
							const innerAudioContext = wx.createInnerAudioContext()
							if (tempFlag == true) {
								tempWarn ++
								if (that.data.temp_wraning_switch == true) {
									that.setData({
										temp_wraning_switch: false,
										tempWarn: tempWarn
									})
									if (tempSoundSwitch == '1') {
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

							// 第八个字节，湿度，00为干爽，01-04为尿了，09为该换尿布
              console.log("manuArray[7]:", manuArray[7]);
              console.log(manuArray[7] == "00");

							var humidityArr = wx.getStorageSync('humidityArr') || []
							console.log('humidityArrBefore: ', humidityArr)

							var preData = wx.getStorageSync('preData')
							
							if (manuArray[7] == "09") {
								// 若取到09该换尿布，则计数加一（计数功能取消）
								// var humidityWarn = that.data.humidityWarn
                // humidityWarn++

								// 红绿灯切换为红灯
								that.setData({
									humidityData: 2
								})

								var humiditySwitch = that.data.humidity_warning_switch             
								// console.log("humidityWarn:", humidityWarn, ", humiditySwitch:", humiditySwitch);
								// 次数为5，并且尿量报警开关开着（计数功能取消）
								// if (humidityWarn >= 5 && humiditySwitch == true) {
								// 新数据与旧数据不同时，即有变化时
								if (manuArray[7] != preData) {
									// 计数为5，则播放警报
									that.setData({
										humidity_warning_switch: false
									})
									if (humiditySoundSwitch == '1') {
										var count = 3 // 循环播放次数
										const innerAudioContext = wx.createInnerAudioContext()
										innerAudioContext.autoplay = true
										innerAudioContext.obeyMuteSwitch = false
										innerAudioContext.src = '/imgs/bbhuanniaobu.mp3'
										innerAudioContext.onPlay(() => {
											console.log('宝宝该换纸尿布了')
											console.log(count, "次播放")
										})
										innerAudioContext.onEnded(() => {
											count--
											if (count > 0) {
												innerAudioContext.play()
											} else {
												innerAudioContext.stop()
												innerAudioContext.destroy()
											}
										})
									}
									 
                  //弹出提示框
                  wx.showModal({
										title: '提示',
										showCancel: false,
                    content: '宝宝该换纸尿布了',
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

									// 本地维护尿量数组
									console.log("记一次尿量！")
									var parme = {}
									var myDate = new Date()
									var length = humidityArr.length
									parme["time"] = myDate.getHours() + ':' + myDate.getMinutes()
									parme["operation"] = "尿尿"
									if (length >= 10) {
										console.log("超过10啦！")
										humidityArr.shift()
									}
									humidityArr.push(parme)
									console.log('humidityArrAfter: ', humidityArr)
									wx.setStorageSync('humidityArr', humidityArr)

								} else {
									that.setData({
										humiditySecWarn: 0,
										// humidityWarn: humidityWarn
									})
								}
							} else if (manuArray[7] == "01" || manuArray[7] == "02" || manuArray[7] == "03" || manuArray[7] == "04") {
								// 若取到01-04，则计数加一（计数功能取消）
								// var humiditySecWarn = that.data.humiditySecWarn
								// humiditySecWarn++

								// 红绿灯切换为黄灯
								that.setData({
									humidityData: 1
								})

								var humiditySwitch = that.data.humidity_warning_switch
								// console.log("humiditySecWarn:", humiditySecWarn, ", humiditySwitch:", humiditySwitch);
								// 次数为5，并且尿量报警开关开着（计数功能取消）
								// if (humiditySecWarn >= 5 && humiditySwitch == true) {
								// 新数据与旧数据不同时，即有变化时
								if (manuArray[7] != preData) {
									// 计数为5，则播放警报
									that.setData({
										humidity_warning_switch: false
									})
									if (humiditySoundSwitch == '1') {
										var count = 3 // 循环播放次数
										const innerAudioContext = wx.createInnerAudioContext()
										innerAudioContext.autoplay = true
										innerAudioContext.obeyMuteSwitch = false
										innerAudioContext.src = '/imgs/bbniao.mp3'
										innerAudioContext.onPlay(() => {
											console.log('宝宝尿尿了')
											console.log(count, "次播放")
										})
										innerAudioContext.onEnded(() => {
											count--
											if (count > 0) {
												innerAudioContext.play()
											} else {
												innerAudioContext.stop()
												innerAudioContext.destroy()
											}
										})
									}

									//弹出提示框
									wx.showModal({
										title: '提示',
										showCancel: false,
										content: '宝宝尿尿了',
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

									// 本地维护尿量数组
									console.log("记一次尿量！")
									var parme = {}
									var myDate = new Date()
									var length = humidityArr.length
									parme["time"] = myDate.getHours() + ':' + myDate.getMinutes()
									parme["operation"] = "尿尿"
									if (length >= 10) {
										console.log("超过10啦！")
										humidityArr.shift()
									}
									humidityArr.push(parme)
									console.log('humidityArrAfter: ', humidityArr)
									wx.setStorageSync('humidityArr', humidityArr)

								} 
								// else if (humiditySecWarn >= that.data.humidityWarnLimit) {
								// 	that.setData({
								// 		humiditySecWarn: 0,
								// 		humidity_warning_switch: true
								// 	})
								// } 
								else {
									that.setData({
										humidityWarn: 0,
										// humiditySecWarn: humiditySecWarn
									})
								}
							} else if (manuArray[7] == "00") {
								// 若取到00干爽，则重置计数并打开开关
								that.setData({
									humidityData: 0,
									humidityWarn: 0,
									humiditySecWarn: 0,
									humidity_warning_switch: true
								})
								// 换尿布时数据记录
								if (preData == "09") {
									// 本地维护尿量数组
									console.log("记一次换尿布！")
									var parme = {}
									var myDate = new Date()
									var length = humidityArr.length
									parme["time"] = myDate.getHours() + ':' + myDate.getMinutes()
									parme["operation"] = "换尿布"
									if (length >= 10) {
										console.log("超过10啦！")
										humidityArr.shift()
									}
									humidityArr.push(parme)
									console.log('humidityArrAfter: ', humidityArr)
									wx.setStorageSync('humidityArr', humidityArr)

								}
							}

							wx.setStorageSync('preData', manuArray[7])

						}
					}
				})
			}
		})
		
	},
	// 蓝牙设备初始化
	initBluetooth: function () {
		var that = this
		wx.openBluetoothAdapter({
			success: function (res) {
				console.log("初始化蓝牙适配器成功", res)
				that.searchbluetooth()
			},
			fail: function (res) {
				console.log("初始化蓝牙适配器失败", res)
				wx.showLoading({
					title: '蓝牙未开启',
					mask: true
				})
			}
		})
		wx.onBluetoothAdapterStateChange(function (res) {
			console.log("蓝牙适配器状态变化", res)
			that.setData({
				isbluetoothready: res.available,
				searchingstatus: res.discovering
			})
			if (res.available == true) {
				wx.hideLoading()
				that.searchbluetooth()
				if (res.discovering == true) {

				}
			} else if (res.available == false) {
				wx.showLoading({
					title: '蓝牙未开启',
					mask: true
				})
			}
		})
	},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		var that = this
		// 获取数据源
		this.setData({
			NTC_DATA: NTC_DATA
		})
		// 蓝牙初始化
		this.initBluetooth()

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