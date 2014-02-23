Gif Ditto
=========

HackTCNJ 2014

A creative way to replicate a Tumblur gif

#Issues:
- There are some cases when it waits for users who have disconnected. We should have a time out of 60 seconds

#TODO:
- Decide on how to go from scene to scene [hard-code for now, add tumblr later]
- If a user disconnects, if there are any users waiting for an image then send them the image

#Thoughts
- Should we store scene data or fetch and process each time there is a new scene?
- Add request to take another photo
- Add timer to snapshot
- After a scene is finished, make sure they do not interfere with the following scene
