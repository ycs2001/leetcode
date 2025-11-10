/*
 * @lc app=leetcode.cn id=349 lang=golang
 *
 * [349] 两个数组的交集
 */

// @lc code=start
func intersection(nums1 []int, nums2 []int) []int {
    
	seen := map[int]bool{}
	res := []int{}
	sort.Ints(nums2)

	for _, num := range nums1{
		if !seen[num] {
			i := binarySearch(nums2, num)
			if i!=-1 {
				res = append(res, num)
				seen[num] = true
			}
		}
	}

	return res

}

func binarySearch(nums []int, target int) int{

	l, r := 0, len(nums) - 1

	for l<=r {
		midpoint := (l+r)/2
		if nums[midpoint] < target{
			l = midpoint + 1
		}else if nums[midpoint] > target{
			r = midpoint - 1
		}else {
			return midpoint
		}
	}
	return -1
}
// @lc code=end

