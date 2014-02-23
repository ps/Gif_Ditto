import os
import re 
import sys
import commands
import Image
from human_sort import *

#required for natural sorting
#def atoi(text):
#	return int(text) if text.isdigit() else text 
#required for natural sort
#def natural_keys(text):
#	return [ atoi(c) for c in re.split('(\d+)',text)]
#removes and renames generated frames
def remove_gif_frames(files, directory, remove=True):
	d=1
	c=1
	for i in files:
		if d==1 and remove:
			#remove the frame
			os.remove('%s/%s' % (directory,i) )
			d=0
		else:
			im_dir = '%s/%s' % (directory,i)
			im = Image.open(im_dir)
			im = im.convert('L')
			im.save(im_dir)
			#rename the frame
			os.rename(im_dir, '%i.png' % c)
			c = c+1
			d=1
			
#given 'gif' file to be processed
gifName = 'test.gif'

#get current path
curPath = os.getcwd()

#properly splits gif with imagemagic
print "Converting into png's"
commands.getstatusoutput(('convert -coalesce %s output/targ.png' % gifName))

outFol = '%s/output' % curPath
#go into the output folder to rename/remove frames
os.chdir(outFol)

files = [f for f in os.listdir('.') if os.path.isfile(f)]
files.sort(key=natural_keys)

if len(files) <= 20:
	remove_gif_frames(files, outFol, False)

while len(files)>20:
	print "Shrinking frame amount"
	remove_gif_frames(files, outFol)
	files = [f for f in os.listdir('.') if os.path.isfile(f)]
	files.sort(key=natural_keys)


print "Done. Final frame count: %s" % len(files)
