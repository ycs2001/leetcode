/*
 * @lc app=leetcode.cn id=355 lang=golang
 *
 * [355] 设计推特
 */

// @lc code=start
type Twitter struct {

	timestamp int
	userTweets map[int][]struct{
		tweetId int
		time int
	}

	following map[int]map[int]bool

}

func Constructor() Twitter {
    return Twitter{
		timestamp: 0,
		userTweets: make(map[int][]struct{
							tweetId int
							time int
			}),
		following: make(map[int]map[int]bool),			
	}
}


func (this *Twitter) PostTweet(userId int, tweetId int)  {
    this.timestamp += 1
	tweet := struct {
		tweetId int
		time int
	}{tweetId, this.timestamp}
	this.userTweets[userId] = append(this.userTweets[userId],tweet)
}


func (this *Twitter) GetNewsFeed(userId int) []int {

	// take out of all user's own tweets
	tweets := this.userTweets[userId]
	// take out of all user's followees' tweets
	followees, ok := this.following[userId]
	if ok {
		for followeeId := range followees{
			tweets = append(tweets, this.userTweets[followeeId]...)
		}
	}
	//sort them by time in descending order
    sort.Slice(tweets, func(i, j int) bool{
		return tweets[i].time > tweets[j].time
	})

	results := []int{}

	for i, v := range tweets{
		if i < 10{
			results = append(results, v.tweetId)
		}
	}

	return results
}


func (this *Twitter) Follow(followerId int, followeeId int)  {
	//if we dont have any followees at first
	if this.following[followerId] == nil{
		this.following[followerId] = make(map[int]bool)
	}
    this.following[followerId][followeeId] = true
}


func (this *Twitter) Unfollow(followerId int, followeeId int)  {
	if _, ok := this.following[followerId]; ok{
		delete(this.following[followerId], followeeId)
	}
}


/**
 * Your Twitter object will be instantiated and called as such:
 * obj := Constructor();
 * obj.PostTweet(userId,tweetId);
 * param_2 := obj.GetNewsFeed(userId);
 * obj.Follow(followerId,followeeId);
 * obj.Unfollow(followerId,followeeId);
 */
// @lc code=end

