var fs = require('fs'),
    path = require('path'),
    pkg = JSON.parse(fs.readFileSync('package.json')),
    copymodules = pkg.copymodules,
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

if (copymodules && copymodules.forEach) {
    try {
        fs.mkdirSync(directory);
    } catch (e) {}
    copymodules.forEach( function (item) {
        if(fs.existsSync('node_modules/' + item)) {
            fs.readFile('node_modules/' + item + '/package.json', function (err, text) {
                try {
                    deleteFolderRecursive(directory + '/' + item);
                } catch (e) {}
                copyRecursiveSync('node_modules/' + item, directory + '/' + item);
            });
        } else {
            console.log("no such directory 'node_modules/" + item + "'");
        }
        
    });
} else {
    console.log("Add a 'copymodules' array to package.json");
    process.exit(1);
}
