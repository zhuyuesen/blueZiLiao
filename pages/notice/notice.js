// pages/notice/notice.js
Page({

  /**
   * 页面的初始数据
   */
	data: {
		delBtnWidth: 232, // 删除按钮宽度单位（rpx）
		list: [
			{
				txtStyle: "",
				title: '尿湿',
				noticeTime: '6月18日12:30',
				txt: "宝宝纸尿裤湿了，请快去帮宝宝纸尿裤，婴儿长期穿戴湿纸尿裤会让小屁屁变红哦。宝宝纸尿裤湿了，请快去帮宝宝纸尿裤，婴儿长期穿戴湿纸尿裤会让小屁屁变红哦。宝宝纸尿裤湿了，请快去帮宝宝纸尿裤，婴儿长期穿戴湿纸尿裤会让小屁屁变红哦。",
				iconClass: 'primary',
			},
			{
				txtStyle: "",
				title: '喂奶',
				noticeTime: '6月18日12:50',
				txt: "您已经三个小时没给宝宝喂奶啦，宝宝已经饿的哇哇大哭了，快去给宝宝喂奶吧。",
				iconClass: 'warn',
			}, 
			{
				txtStyle: "",
				title: '体温',
				noticeTime: '6月18日12:50',
				txt: "孩子体温出现异常，达到37.5度的高温，疑似发烧症状，请查看孩子身体是否健康",
				iconClass: 'info',
			},
			{
				txtStyle: "",
				title: '尿湿',
				noticeTime: '6月18日12:30',
				txt: "向左滑动可以删除",
				iconClass: 'primary',
			},
			{
				txtStyle: "",
				title: '喂奶',
				noticeTime: '6月18日12:50',
				txt: "圣诞老人是爸爸，顺着烟囱往下爬，礼物塞满圣诞袜，平安糖果一大把",
				iconClass: 'primary',
			},
			{
				txtStyle: "",
				title: '体温',
				noticeTime: '6月18日12:50',
				txt: "圣诞到来，元旦还会远吗？在圣诞这个日子里",
				iconClass: 'primary',
			},
			{
				txtStyle: "",
				title: '喂奶',
				noticeTime: '6月18日12:50',
				txt: "圣诞节(Christmas或Cristo Messa ),译名为“基督弥撒”。",
				iconClass: 'primary',
			},
			{
				txtStyle: "",
				title: '喂奶',
				noticeTime: '6月18日12:50',
				txt: "一年一度的圣诞节即将到来,姑娘们也纷纷开始跑趴了吧!",
				iconClass: 'primary',
			},
			{
				txtStyle: "",
				title: '喂奶',
				noticeTime: '6月18日12:50',
				txt: "圣诞节(Christmas或Cristo Messa ),译名为“基督弥撒”。",
				iconClass: 'primary',
			},
			{
				txtStyle: "",
				title: '喂奶',
				noticeTime: '6月18日12:50',
				txt: "你的圣诞节礼物准备好了吗?",
				iconClass: 'primary',
			},
			{
				txtStyle: "",
				title: '喂奶',
				noticeTime: '6月18日12:50',
				txt: "一年一度的圣诞节即将到来,姑娘们也纷纷开始跑趴了吧!",
				iconClass: 'primary',
			},
			{
				txtStyle: "",
				title: '喂奶',
				noticeTime: '6月18日12:50',
				txt: "圣诞到来，元旦还会远吗？",
				iconClass: 'primary',
			},
			{
				txtStyle: "",
				title: '喂奶',
				noticeTime: '6月18日12:50',
				txt: "记下这一刻的心情",
				iconClass: 'primary',
			},
		],
	},

	touchS: function (e) {
		if (e.touches.length == 1) {
			this.setData({
				//设置触摸起始点水平方向位置
				startX: e.touches[0].clientX
			});
		}
	},
	touchM: function (e) {
		if (e.touches.length == 1) {
			//手指移动时水平方向位置
			var moveX = e.touches[0].clientX;
			//手指起始点位置与移动期间的差值
			var disX = this.data.startX - moveX;
			var delBtnWidth = this.data.delBtnWidth
			var txtStyle = "";
			if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
				txtStyle = "left:0px";
			} else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
				txtStyle = "left:-" + disX + "px";
				if (disX >= delBtnWidth) {
					//控制手指移动距离最大值为删除按钮的宽度
					txtStyle = "left:-" + delBtnWidth + "px";
				}
			}
			//获取手指触摸的是哪一项
			var index = e.currentTarget.dataset.index;
			var list = this.data.list;
			list[index].txtStyle = txtStyle;
			//更新列表的状态
			this.setData({
				list: list
			});
		}
	},
	touchE: function (e) {
		if (e.changedTouches.length == 1) {
			//手指移动结束后水平位置
			var endX = e.changedTouches[0].clientX;
			//触摸开始与结束，手指移动的距离
			var disX = this.data.startX - endX;
			var delBtnWidth = this.data.delBtnWidth;
			//如果距离小于删除按钮的1/2，不显示删除按钮
			var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "px" : "left:0px";
			//获取手指触摸的是哪一项
			var index = e.currentTarget.dataset.index;
			var list = this.data.list;
			list[index].txtStyle = txtStyle;
			//更新列表的状态
			this.setData({
				list: list
			});
		}
	},
	//获取元素自适应后的实际宽度
	getEleWidth: function (w) {
		var real = 0;
		try {
			var res = wx.getSystemInfoSync().windowWidth;
			var scale = (750 / 2) / (w / 2);//以宽度750px设计稿做宽度的自适应
			// console.log(scale);
			real = Math.floor(res / scale);
			return real;
		} catch (e) {
			return false;
			// Do something when catch error
		}
	},
	initEleWidth: function () {
		var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
		this.setData({
			delBtnWidth: delBtnWidth
		});
	},
	//点击删除按钮事件
	delItem: function (e) {
		//获取列表中要删除项的下标
		var index = e.target.dataset.index;
		var list = this.data.list;
		//移除列表中下标为index的项
		list.splice(index, 1);
		//更新列表的状态
		this.setData({
			list: list
		});
	},

  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		this.initEleWidth()
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