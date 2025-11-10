/*
 * @lc app=leetcode.cn id=94 lang=golang
 *
 * [94] 二叉树的中序遍历
 */

// @lc code=start
/**
 * Definition for a binary tree node.
 * type TreeNode struct {
 *     Val int
 *     Left *TreeNode
 *     Right *TreeNode
 * }
 */
func inorderTraversal(root *TreeNode) []int {

	results := []int{}
	stack   := []*TreeNode{}
    curr    := root

	

	for curr != nil || len(stack) > 0{

		for curr != nil{
			stack = append(stack, curr)
			curr = curr.Left
		}

		curr = stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		results = append(results, curr.Val)

		curr = curr.Right
		
	}


	return results

}
// @lc code=end

