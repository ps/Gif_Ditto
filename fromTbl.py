import json
import requests
import sys
import os
import datetime
from pprint import pprint

url = 'http://api.tumblr.com/v2/tagged'

f = open('%s/time.txt' % os.getcwd())
lastTime = f.readlines()
lastTime = lastTime[0].rstrip()
f.close()
print lastTime
params = dict(
	tag='people gif',
	before=lastTime,
	api_key="GzY9sZJhvcYlPl8am5HD0hmNw6Uf76wtZ7nVRmzEDKGf7Vato7"
)

resp = requests.get(url=url, params=params)
#print resp.content

data = json.loads(resp.content)
#print data['post-url']

#print( data['response'][0]['photos'][0]['original_size']['url'])


for i in data['response']:
	#print i['photos']
	#pprint(i)
	
	print(datetime.datetime.fromtimestamp(int(i['timestamp'])).strftime('%Y-%m-%d %H:%M:%S'))
	
	try:
		newTime = lastTime
		picUrl = i['photos'][0]['original_size']['url']
		newTime = i['timestamp']
		print "about to download"
		r = requests.get(picUrl)
		print "about to create gif"
		f = open('%s/new_gif/ng.gif' % (os.getcwd()), 'w')
		print "writing to gif"
		f.write(r.content)

		f.close()
		print "done download"
		print "New time %s" % newTime
		os.remove('%s/time.txt' % os.getcwd())
		print "about to open"
		f = open('%s/time.txt' % os.getcwd(), 'w')
		print "about to write"
		f.write('%i' % newTime)
		print "wrote time"
		f.close()
		break
	except:
		print "no photo"

	

print len(data['response'])
#for i in data:
#	print i
