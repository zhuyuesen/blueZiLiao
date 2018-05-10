//index.js
//获取应用实例
const app = getApp()
var temp = []

Page({
  data: {
		hasDevices: false,
		pageState: 'view', // 当为view时为查看已连接，当为searching时为搜索
		noticeText: '无设备',
		searchingstatus: false,
		devices: [],
		shock_uuid: '00002A06-0000-1000-8000-00805F9B34FB',
		shock_data: false,
  },
  //事件处理函数
	startSearch: function() {
		this.setData({
			pageState: 'searching'
		})
	},
	getBluetoothDevices: function () {
		wx.getBluetoothDevices({
			success: function (res) {
				console.log(res)
			},
		})
	},

	// 搜索蓝牙
	searchbluetooth: function () {
		var that = this
		this.setData({
			pageState: 'searching',
		})
		if (!that.data.searchingstatus) {
			this.setData({
				devices: []
			})
			wx.startBluetoothDevicesDiscovery({
				services: ["1809"],
				interval: "5000",
				allowDuplicatesKey: true,
				success: function (res) {
					console.log("开始搜索附近蓝牙设备", res)
					that.setData({
						searchingstatus: !that.data.searchingstatus
					})

					wx.onBluetoothDeviceFound(function (res) {
						var devices = res.devices
						console.log(devices)
						temp.push(devices)
						that.setData({
							devices: temp
						})
						var advertisData = devices[0].advertisData
						var manufacturer = that.buf2hex(advertisData)
						console.log('manufacturer: ', manufacturer)
						var ints = ""
						for (var i = 0; i < manufacturer.length; i++) {
							ints += manufacturer[i]
							if (i % 2 == 1)
								ints += ','
						}
						var manuArray = ints.split(',')
						console.log(manuArray) //["49", "50", "f3", "01", "07", "fa", "00", "00", ""]
						console.log('发现新蓝牙设备')
						console.log('设备id' + devices[0].deviceId)
						console.log('设备name' + devices[0].name)
					})
				}
			})
		} else {
			console.log(2222)
			wx.stopBluetoothDevicesDiscovery({
				success: function (res) {
					console.log("停止蓝牙搜索", res)
				}
			})
		}
	},
	buf2string: function (buffer) {
		var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
		var str = ''
		for (var i = 0; i < arr.length; i++) {
			str += String.fromCharCode(arr[i])
		}
		return str
	},
	buf2hex: function (buffer) {
		return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
	},
	// 连接设备
	createBLEConnection: function(e) {
		var that = this
		var deviceId = e.currentTarget.dataset.deviceId
		console.log(deviceId)
		wx.createBLEConnection({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
			deviceId: deviceId,
			success: function (res) {
				console.log("已连接", res)
				var deviceIdList = wx.getStorageSync('deviceIdList') || []
				deviceIdList.push(deviceId)
				wx.setStorageSync('deviceIdList', deviceIdList)
				wx.getBLEDeviceServices({
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
					deviceId: deviceId,
					success: function (res) {
						console.log('device services:', res.services)
						var servicesList = res.services
						that.setData({
							servicesList: servicesList
						})
						servicesList.forEach(function (value, index, array) {
							wx.getBLEDeviceCharacteristics({
								deviceId: deviceId,
								serviceId: value.uuid,
								success: function (res) {
									console.log(index + '、获取蓝牙设备所有的特征值', res)
									array[index].characteristics = res.characteristics
									that.setData({
										servicesList: servicesList
									})
									if (index == (array.length - 1)) {
										wx.setStorageSync('servicesList', servicesList)
										that.select_characteristics()
										
									}
								},
							})
						})
						console.log('结果是：', that.data.servicesList)
					}
				})
				that.setData({
					pageState: 'view',
					hasDevices: true
				})
				that.searchbluetooth()
			},
			fail: function (res) {
				console.log("连接失败", res)
			}
		})
	},
	// 断开设备
	closeBLEConnection: function (e) {

	},
	// 识别特征值
	select_characteristics: function () {
		var that = this
		var servicesList = this.data.servicesList
		var shock = {service: false, characteristic: false}
		servicesList.forEach(function (value, index, array) {
			array[index].characteristics.forEach(function (values, indexs, arrays) {
				if (values.uuid == that.data.shock_uuid) {
					console.log('找到震动控制特征值', values)
					shock.service = value
					shock.characteristic = values
					that.setData({
						shock_data: shock
					})
					wx.setStorageSync('shock_data', shock)
					
				}
			})
			if (index == array.length-1) {
				wx.redirectTo({
					url: '/pages/controler/controler',
				})
			}
		})
	},

	onLoad: function () {
		var that = this
		wx.openBluetoothAdapter({
			success: function (res) {
				console.log("初始化蓝牙适配器成功", res)
				
			},
			fail: function (res) {
				console.log("初始化蓝牙适配器失败", res)
				wx.showLoading({
					title: '蓝牙未开启',
					//mask: true
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
				if (res.discovering == true) {
					
				}
			} else if (res.available == false) {
				wx.showLoading({
					title: '蓝牙未开启',
					//mask: true
				})
			}
		})
  },
	onUnload: function () {
		var that = this
		// wx.closeBluetoothAdapter({
		// 	success: function (res) {
		// 		console.log(res)
		// 		that.setData({
		// 			isbluetoothready: false,
		// 			deviceconnected: false,
		// 			devices: [],
		// 			searchingstatus: false,
		// 			receivedata: ''
		// 		})
		// 	},
		// 	fail: function (res) {
		// 		wx.showModal({
		// 			title: '提示',
		// 			content: '请检查手机蓝牙是否打开',
		// 			success: function (res) {
		// 				that.setData({
		// 					isbluetoothready: false
		// 				})
		// 			}
		// 		})
		// 	}
		// })
	},
})
