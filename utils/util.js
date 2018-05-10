const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 页面的跳转
// 在每个需要调用的页面使用以下方法
// toPage: function (e) {
// 	utils.toPage(e)
// },
const toPage = function (e) {
	var pageUrl = e.currentTarget.dataset.pageUrl
	var seqId = e.currentTarget.dataset.seqId
	var pageType = e.currentTarget.dataset.pageType
	var optionIndex = e.currentTarget.dataset.optionIndex
	wx.navigateTo({
		url: pageUrl + '?seqId=' + seqId + '&pageType=' + pageType + '&optionIndex=' + optionIndex
	})
}

module.exports = {
  formatTime: formatTime,
	toPage: toPage
}
