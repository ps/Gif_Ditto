/*
The server should keep track of what scene is currently being recreated.
Each connection will be responsible for their image until uploaded. Maybe add a time limit.
*/

var app = require('http').createServer(handler),
exec = require("child_process").exec,
io = require('socket.io').listen(app),
//ws = require("websocket-server"),
fs = require("fs"),
url = require("url"),
qs = require('querystring'),
port = process.env.PORT || 5000,
curScene = 1,
imagesAvailable,//boolean array of whether or not image is available (note - images start at 1)
numUploaded = 0,
maxScene = 0;

//determine the number of scenes
maxScene = 2; //fs.readdirSync("scenes").length;

app.listen(port);
console.log("HTTP server listening on port " + port);

function nextScene(first){
	if(!first){
		curScene++;
		curImage = 1;
	}
	if(curScene > maxScene){
		curScene = 1;
	}
	//determine the max images for this scene
	exec("rm -rf scenes/" + curScene + "_submissions/*");
	var numImages = fs.readdirSync("scenes/" + curScene).length;
	imagesAvailable = new Array(numImages);
	for(var i = 0; i < imagesAvailable.length; i++){
		imagesAvailable[i] = true;
	}
	numUploaded = 0;
}

function handler(req, resp){
	var r_url = url.parse(req.url);
	if(r_url.pathname.substring(1) === "saveimage"){
		var body = "";
		req.on('data', function (data) {
			if(body.length > 1e6){
				req.connection.destroy();
			}
            body += data;
        });
        req.on('end', function () {
            var POST = qs.parse(body);
            // use POST
           	if(POST.hasOwnProperty("imgData") && POST.hasOwnProperty("imgNum")){
	            var base64Data = POST.imgData.replace(/^data:image\/png;base64,/,"");
				fs.writeFile( "scenes/" + curScene + "_submissions/" + POST.imgNum + ".png", base64Data, 'base64', function(err) {
				  console.log(err);
				});
				resp.writeHead(200, {"Content-Type" : "text/plain"});
				resp.write("SUCCESS");
				resp.end();
			}
			else{
				resp.writeHead(200, {"Content-Type" : "text/plain"});
				resp.write("ERROR");
				resp.end();
			}
        });
		
	}
	else if(r_url.pathname === "/")
	{
		resp.writeHead(200, {"Content-Type" : "text/html"});
		var clientui = fs.readFileSync("index.html");
		resp.write(clientui);
		resp.end();
	}
	else{
		var filename = r_url.pathname.substring(1),
		type;

		switch(filename.substring(filename.lastIndexOf(".") + 1)){
			case "html":
			case "htm":
			type = "text/html; charset=UTF-8";
			break;
			case "js":
			type = "application/javascript; charset=UTF-8";
			break;
			case "css":
			type = "text/css; charset=UTF-8";
			break;
			case "svg":
			type = "image/svg+xml";
			break;
			case "png":
			type= "image/png";
			break;
			case "jpg":
			type= "image/jpg";
			break;
			default:
			type = "application/octet-stream";
			break;
		}

		fs.readFile(filename, function(err, content){
			if(err){
				resp.writeHead(404, {
					"Content-Type" : "text/plain; charset=UTF-8"
				});
				resp.write(err.message);
				resp.end();
			}
			else{
				resp.writeHead(200, {
					"Content-Type" : type
				});
				resp.write(content);
				resp.end();
			}
		});
	}
}

//may need to add some securing to prevent thread accidents in the following method later

function imageRequest(sk){
	var nextAvailable = -1;
	for(var i = 0; i < imagesAvailable.length; i++){
		if(imagesAvailable[i]){
			nextAvailable = i+1;
			break;
		}
	}
	if(nextAvailable == -1){
		//no more available images, let user know that the scene is finished and we are waiting for the ending gif
		sk.set("status", "waiting");
		sk.emit("image", {status: "waiting"});
	}
	else{
		imagesAvailable[nextAvailable-1] = false;
		//send the current image to which this person is assigned
		sk.set("status", "working");
		sk.set("curImage", nextAvailable);
		sk.emit("image", {status: 'working', imgNum: nextAvailable, path: "scenes/" + curScene + "/" + nextAvailable + ".png", numUploaded: numUploaded, numImages: imagesAvailable.length})
	}
	return nextAvailable;
}


io.sockets.on('connection', function (sk) {
	var curImage = -1, status = "working";
	curImage = imageRequest(sk);
	if(curImage == -1){
		status = "waiting";
	}
	sk.on("image", function(data){
		if(data.cmd == "upload"){
			//TODO: check to make sure that the image was actually uploaded (maybe, except I'm not sure if this would be true due to timing)
			//increase uploaded
			//set them to waiting
			numUploaded++;
			status = "waiting";
			curImage = -1;
			if(numUploaded == imagesAvailable.length){
				//end of this scene
				//compile the final gif
				var cmd = "python gif_operations/getGif.py scenes/" + curScene + "_submissions/ scenes/output/" + curScene + ".gif";
				exec(cmd, function(err, stdout, stderr){
					//broadcast this to everybody and start the next scene
					sk.broadcast.emit("sceneFinished", {path: "scenes/outputs/" + curScene + ".gif", original_path: "scenes/originals/" + curScene + ".gif" });
				})

				
				
			}
		}
		else if(data.cmd == "request"){
			curImage = imageRequest(sk);
		}
	})

	sk.on("disconnect", function(){
		console.log("Disconnecting for image " + curImage);
		if(status == "working"){
			//this user did not upload an image
			imagesAvailable[curImage-1] = true;
		}
		//otherwise the user was waiting, not a problem
	})
});

nextScene(true);