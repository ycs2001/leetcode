/*
 * @lc app=leetcode.cn id=146 lang=golang
 *
 * [146] LRU 缓存
 */

// @lc code=start
type Node struct {
	key int
	val int
	prev *Node
	next *Node
}

type LRUCache struct {
	capacity int
	cache map[int]*Node
	head *Node
	tail *Node
}

func Constructor(capacity int) LRUCache {
	head := &Node{}
	tail := &Node{}
	head.next = tail
	tail.prev = head

	return LRUCache{
		capacity: capacity,
		cache: make(map[int]*Node),
		head:head,
		tail:tail,
	}

}

func (this *LRUCache) removeNode(node *Node) {

	node.prev.next = node.next
	node.next.prev = node.prev

}

func (this *LRUCache) addToFront(node *Node){

	node.prev = this.head
	node.next = this.head.next
	this.head.next.prev = node
	this.head.next = node

}


func (this *LRUCache) Get(key int) int {

	node, exists := this.cache[key]
	if !exists {
		return -1
	}

	this.removeNode(node)
	this.addToFront(node)

	return node.val

}

func (this *LRUCache) Put(key int, value int) {

	node, exists := this.cache[key]

	if !exists{
		newNode := &Node{
			key: key,
			val:value,
		} 
		this.addToFront(newNode)
		this.cache[key] = newNode
		
		if len(this.cache) > this.capacity{
			delete(this.cache, this.tail.prev.key)
			this.removeNode(this.tail.prev)
		}

	}else{
		node.val = value
		this.removeNode(node)
		this.addToFront(node)
	}

}


/**
 * Your LRUCache object will be instantiated and called as such:
 * obj := Constructor(capacity);
 * param_1 := obj.Get(key);
 * obj.Put(key,value);
 */
// @lc code=end
