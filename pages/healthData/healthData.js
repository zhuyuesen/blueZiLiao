// pages/healthData/healthData.js
var wxCharts = require('../../utils/wxcharts-min.js');
var columnChart = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
		selectIndex: 'temperature',
		healthData: [
			{
				dataType: 'temperature',
				dataTitle: '体温',
				unit: '单位：摄氏度℃',
				dataDate: '2017年11月21日',
				intro: {
					introTitle: '异常体温',
					introData: [
						{
							icon: '/imgs/temperature_high.png',
							title: '过高',
							data: '37.9℃'
						},
						{
							icon: '/imgs/temperature_low.png',
							title: '过低',
							data: '36.1℃'
						},
					],
					label: '宝宝体温出现过高或者过低都是异常现象，人体体温应该维持在36.3-37.2℃之间。如发现宝宝的体温高于或者低于这个正常值，应迅速咨询医生获取专业的建议',
				},
			},
			{
				dataType: 'breath',
				dataTitle: '呼吸',
				unit: '单位：次/分钟',
				dataDate: '2017年11月21日',
				intro: {
					introTitle: '异常速率',
					introData: [
						{
							icon: '/imgs/breath_high.png',
							title: '过高',
							data: '68'
						},
						{
							icon: '/imgs/breath_low.png',
							title: '过低',
							data: '无'
						},
					],
					label: '宝宝体温出现过高或者过低都是异常现象，人体体温应该维持在36.3-37.2℃之间。如发现宝宝的体温高于或者低于这个正常值，应迅速咨询医生获取专业的建议',
				},
			},
			{
				dataType: 'sleep',
				dataTitle: '睡眠',
				unit: '',
				dataDate: '2017年11月21日',
				intro: {
					introTitle: '睡眠分析',
					introData: [
						{
							icon: '/imgs/sleep_high.png',
							title: '深睡眠',
							data: '2小时'
						},
						{
							icon: '/imgs/sleep_low.png',
							title: '浅睡眠',
							data: '3小时'
						},
					],
					label: '宝宝体温出现过高或者过低都是异常现象，人体体温应该维持在36.3-37.2℃之间。如发现宝宝的体温高于或者低于这个正常值，应迅速咨询医生获取专业的建议',
				},
			},
			{
				dataType: 'urineVolume',
				dataTitle: '尿尿',
				unit: '',
				dataDate: '2017年11月21日',
				intro: {
					introTitle: '',
					introData: [],
					label: '',
				},
			},
		]
  },

	// 切换选项卡
	changeIndex: function (e) {
		var that = this
		var index = e.currentTarget.dataset.dataType
		this.setData({
			selectIndex: index
		})
		if (index == 'temperature') {
			this.getTempArr(function (data) {
				columnChart.updateData({
					categories: data.time,
					series: [{
						name: '温度',
						data: data.temp,
					}]
				});
			})
		} else if (index == 'urineVolume') {
			this.getHumidityArr()
		}
	},
	// 初始化柱状图
	initColumnChart: function (parme) {
		var temp = parme.temp
		var time = parme.time
		
		let windowWidth = 320;
		try {
			let res = wx.getSystemInfoSync();
			windowWidth = res.windowWidth;
			// console.log(windowWidth)
		} catch (e) {
			console.log(e)
			// do something when get system info failed
		}
		// console.log(windowWidth)
		columnChart = new wxCharts({
			canvasId: 'columnCanvas',
			type: 'column',
			categories: time,
			series: [{
				name: '温度',
				data: temp
			}],
			animation: false,
			yAxis: {
				format: function (val) {
					return val;
				}
			},
			width: windowWidth-windowWidth*(68/750),
			height: 200,
			legend: false,
		});
	},
	getTempArr: function (cb) {
		var tempArr = wx.getStorageSync('tempArr') || []
		var length = tempArr.length
		console.log('tempArr: ' + tempArr)
		// if (length > 10) 
		// 	length = 10
		var time = []
		var temp = []
		var parme = {}
		for (var i = 0; i < length; i++) {
			temp.push(tempArr[i].temp)
			time.push(tempArr[i].time)
		}
		parme['temp'] = temp
		parme['time'] = time
		typeof cb == "function" && cb(parme)
	},
	getHumidityArr: function () {
		var humidityArr = wx.getStorageSync('humidityArr') || []
		this.setData({
			humidityArr: humidityArr
		})
	},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		wx.showToast({
			title: '加载中…',
			icon: 'loading',
			mask: true,
		})
		var that = this
		this.getTempArr(function (data) {
			that.initColumnChart(data)
		})
		var myDate = new Date()
		this.setData({
			today: myDate.getFullYear() + '-' + (myDate.getMonth()+1) + '-' + myDate.getDate()
		})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
		wx.hideLoading()
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