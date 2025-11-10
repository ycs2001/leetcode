/*
 * @lc app=leetcode.cn id=2 lang=golang
 *
 * [2] 两数相加
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func addTwoNumbers(l1 *ListNode, l2 *ListNode) *ListNode {

	acc := 0
	carry := 0
	digit := 0
	dummy := &ListNode{}
	curr := dummy

	for l1 != nil || l2 != nil || carry!=0{

		var val1 int
		var val2 int
		if l1 != nil {
			val1 = l1.Val
			l1 = l1.Next
		}
		if l2 != nil{
			val2 = l2.Val
			l2 = l2.Next
		}

		acc = val1 + val2 + carry
		digit = acc % 10
		carry = acc / 10

		curr.Next = &ListNode{Val:digit}
		curr = curr.Next
	}

	return dummy.Next
    
}
// @lc code=end

