/*
 * @lc app=leetcode.cn id=43 lang=golang
 *
 * [43] 字符串相乘
 */

 // strconv.Itoa(i int) string - int to string
// var result strings.Builder result.WriteByte(byte('0' + prod % 10))	
// @lc code=start
func multiply(num1 string, num2 string) string {

	if num1 == "0" || num2 == "0"{
		return "0"
	}

	res := "0"

	for i := len(num1) - 1; i>=0; i--{

		digit := int(num1[i] - '0')
		temp := multiplyBydigit(num2, digit)

		shift := len(num1)-1-i
		for j:=0; j<shift; j++{
			temp += "0"
		}

		res = addTwoString(res, temp)

	}

	return res
    
}

func multiplyBydigit(num string, digit int) string{
	if digit == 0 {
		return "0"
	}

	var result strings.Builder

	carry := 0

	for i:= len(num) -1; i>=0; i-- {
		y := int(num[i] - '0')
		prod := y * digit + carry
		result.WriteByte(byte('0' + prod % 10))
		carry = prod / 10
	}

	if carry > 0 {
		result.WriteByte(byte('0' + carry))
	}

	return reverse(result.String())

}

func addTwoString(num1 string, num2 string) string{

	carry := 0
	m, n := len(num1)-1, len(num2)-1
	var result strings.Builder

	for m>=0 || n>=0 || carry>0{

		var val1 int
		if m>=0 {
			val1 = int(num1[m] - '0') 
			m -= 1
		}
		var val2 int
		if n>=0{
			val2 = int(num2[n] - '0')
			n -= 1
		}

		acc := val1 + val2 + carry
		digit := acc % 10
		carry = acc / 10

		result.WriteByte(byte('0' + digit))

		
		

	}
	
	return reverse(result.String())

}

func reverse(s string) string{

	runes := []rune(s)
	for i,j := 0, len(runes)-1;i<j; i,j = i+1, j-1{
		runes[i], runes[j] = runes[j], runes[i]
	}

	return string(runes)

}



// @lc code=end

