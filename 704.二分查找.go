/*
 * @lc app=leetcode.cn id=704 lang=golang
 *
 * [704] 二分查找
 */

// @lc code=start
// First, we take two ends of the array as our initial boundaries. Then we  calculate the midpoint between them and compare the value at that midpoint with the target value.
// if the midpoint value is smaller than the target, we move the left boundary to the midpoint with the target value.
// if the midpoint value is larger than the target value, we move the right boundary to the midpoint.
// we repeat this process until the left and right boundaries meet, indicating that we have found the position of the target or where should we insert the value
// Trap2
//
func search(nums []int, target int) int {

	l, r := 0, len(nums)-1

	for l <= r{

		midpoint := (l+r)/2

		if nums[midpoint] < target {
			l = midpoint + 1
		}else if nums[midpoint] > target {
			r = midpoint - 1
		}else{
			return midpoint
		}
	}

	return -1
    
}
// @lc code=end

