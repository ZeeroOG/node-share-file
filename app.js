// Modules
const path = require('path');
var fs = require('fs');
var os = require('os');
var express = require('express');
var exphbs  = require('express-handlebars');

// Config port
var serverport = 3000;

// Check arguments
if (process.argv[2] && fs.existsSync(process.argv[2]) && fs.lstatSync(process.argv[2]).isFile()) {
	//console.log("File ok, starting server.");
	var file = process.argv[2];
	var filepath = path.join(process.cwd(), file);
	var filename = path.basename(filepath);
	var fileurl = '/dl/' + filename;
} else if(process.argv[2] != null && fs.lstatSync(process.argv[2]).isDirectory()) {
	console.log("You must specify a file path, not a directory !");
	process.exit();
} else if(process.argv[2] != null && !fs.existsSync(process.argv[2])) {
	console.log("File not found.");
	process.exit();
} else {
	console.log("Usage : node app.js <file>");
	process.exit();
}

// Create express app
var app = express();

// Configure express
app.use(express.static('public')); // Serve public dir

// Handlebars as view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function(req, res) {
	var data = {
		filename : filename,
		fileurl : fileurl
	};

	res.render('home', data);
});

app.get('/dl', function(req, res) {
    res.redirect(fileurl)
});

app.get(fileurl, function(req, res) {
	res.header('Content-Type', 'application/octet-stream');
    res.sendFile(filepath)
});

// Lisen on defined port
app.listen(serverport, function() {
	console.log("\nDownload availible at :");
	var ifaces = os.networkInterfaces();
	Object.keys(ifaces).forEach(function (ifname) {
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) return; // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
			console.log(' - http://' + iface.address + ':' + serverport + '/');
		});
	});
	console.log("\nType Control+C to stop the server.");
});
