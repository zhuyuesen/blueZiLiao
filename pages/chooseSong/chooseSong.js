// pages/chooseSong/chooseSong.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		songList: [
			{
				songName: '好日子',
				checked: true
			},
			{
				songName: '今天是个好日子',
			},
		]
  },

	// 切换歌曲选项
	radioChange: function (e) {
		var value = e.detail.value
	},
	// 切换图标
	changeIcon: function (e) {
		var index = e.currentTarget.dataset.index
		var songList = this.data.songList
		for (var i = 0; i < songList.length; i++) {
			songList[i].checked = false
		}
		songList[index].checked = true
		this.setData({
			songList: songList
		})
	},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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