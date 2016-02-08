var fs = require('fs'),
    path = require('path'),
    pkg = JSON.parse(fs.readFileSync('package.json')),
    directory = pkg.copymodulesDir || 'copymodules';

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else { 
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

var copyRecursiveSync = function(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.linkSync(src, dest);
  }
};


try {
	s.mkdirSync(directory);
} catch (e) {}
fs.readdirSync('node_modules/').forEach(function(item) {
    fs.readFile('node_modules/' + item + '/package.json', function (err, text) {
        if(JSON.parse(text).copymodules) {
            try {
                deleteFolderRecursive(directory + '/' + item);
            } catch (e) {}
            copyRecursiveSync('node_modules/' + item, directory + '/' + item);
        }
    });
});
