from images2gif import writeGif
from PIL import Image
import os
import sys
from human_sort import *

orig = os.getcwd()
p_out = '%s/output' % os.getcwd()
print p_out
os.chdir(p_out)
file_names = (fn for fn in os.listdir('.') if fn.endswith('.png'))

files = []
for f in file_names:
	files.append(f)
files.sort(key=natural_keys)

for f in files:
	print f

#['animationframa.png', 'animationframb.png', 'animationframc.png', ...] "

images = [Image.open(fn) for fn in files]

print writeGif.__doc__
# writeGif(filename, images, duration=0.1, loops=0, dither=1)
#    Write an animated gif from the specified images.
#    images should be a list of numpy arrays of PIL images.
#    Numpy images of type float should have pixels between 0 and 1.
#    Numpy images of other types are expected to have values between 0 and 255.


#images.extend(reversed(images)) #infinit loop will go backwards and forwards.

filename = "%s/gif_replica.gif" % orig
writeGif(filename, images, duration=0.2)
#54 frames written
#
#Process finished with exit code 0
