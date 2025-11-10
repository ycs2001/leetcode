/*
 * @lc app=leetcode.cn id=359 lang=golang
 *
 * [359] 日志速率限制器
 */

// @lc code=start
type Logger struct {
	messageTimestamp map[string]int
}


func Constructor() Logger {
    return Logger{
		messageTimestamp: make(map[string]int),
	}
}


func (this *Logger) ShouldPrintMessage(timestamp int, message string) bool {
    lastTimestamp, exists := this.messageTimestamp[message]
	
	if !exists{
		this.messageTimestamp[message] = timestamp
		return true
	}

	if timestamp >= lastTimestamp + 10{
		this.messageTimestamp[message] = timestamp
		return true
	}

	return false

}


/**
 * Your Logger object will be instantiated and called as such:
 * obj := Constructor();
 * param_1 := obj.ShouldPrintMessage(timestamp,message);
 */
// @lc code=end

