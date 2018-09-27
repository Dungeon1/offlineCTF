import random
import time

#	23.10.2017, 12:29:47
#	no russian language

class Feistel:

	#encryption text
	def enc_feistel(text, k):
		if(len(text) % 2 != 0):
			text+="." 	#it added point so that it would be the even length the line
		bytes_text = [bin(i)[2:] for i in text.encode()]
		for i in range(0,len(bytes_text)): #we add conversely “0”, since bin rejects first “0”
			if len(bytes_text[i])<7: 	#2**8 - 1 = max int english language+punctuation+number
				bytes_text[i] = ((7-len(bytes_text[i]))*'0')+bytes_text[i] #add '0' forward
		x1 = ''.join(bytes_text[0:int(len(bytes_text)/2)])
		x2 = ''.join(bytes_text[int(len(bytes_text)/2):])
		y1 = x2
		f = bin(int(bin(int(x1,2)^int(k,2))[2:],2))[2:] #f = x1 XOR k
		y2 = bin(int(f,2)^int(x2,2))[2:] #y2 = f XOR x2
		if (len(y2) < len(y1)):
			y2 = str((len(y1) - len(y2))*'0') + str(y2)
		y = ' '.join(str(x2)+str(y2)).split(' ')
		y = ([''.join((y)[n:n+7]) for n in range(0,len(y),7)])
		for i in range(0,len(y)):
			if len(y[i])<7:
				y[i] = ((7-len(y[i]))*'0')+y[i]
		y = ''.join([chr(int(i,2)) for i in y])
		return y


	#generate key, key must be length 50% of the text
	def gen_k(text, seed):
		random.seed(seed)
		bytes_text = [bin(i)[2:] for i in text.encode()]
		for i in range(0,len(bytes_text)): #we add conversely “0”, since bin rejects first “0”
			if len(bytes_text[i])<7: #2**8 - 1 = max int english language+punctuation+number
				bytes_text[i] = ((7-len(bytes_text[i]))*'0')+bytes_text[i]
		x1 = ''.join(bytes_text[0:int(len(bytes_text)/2)])
		return bin(random.randint(2**(len(x1)-1), 2**(len(x1))))[2:]

if __name__ == '__main__' :
	txt = flag
	# seed = default
	for i in range(0,16):
		k = Feistel.gen_k(txt,seed)
		seed = int(k,2)
		txt = Feistel.enc_feistel(txt,k)

	print(txt)

# txt = 'S9wS&DNfD{jq^8>w!oMj2p|JD'


