import re 
#required for natural sorting
def atoi(text):
	return int(text) if text.isdigit() else text 
#required for natural sort
def natural_keys(text):
	return [ atoi(c) for c in re.split('(\d+)',text)]

