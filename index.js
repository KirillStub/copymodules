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
    mkdir(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      if(src.split('/').length==2 && childItemName=="Plugins") {
        copyRecursiveSync(path.join(src, childItemName),
                        path.join("Assets", childItemName));
      } else {
        copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));  
      }
    });
  } else {   
    if(src.match(/Plugins.*meta/) == null ) {
      fs.linkSync(src, dest);
    }
  }
};

var mkdir = function(path, root) {
    var dirs = path.split('/'), dir = dirs.shift(), root = (root || '') + dir + '/';
    try { fs.mkdirSync(root); }
    catch (e) {
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }
    return !dirs.length || mkdir(dirs.join('/'), root);
}

deleteFolderRecursive("Assets/Plugins");
fs.readdirSync('node_modules/').forEach(function(item) {
    fs.readFile('node_modules/' + item + '/package.json', function (err, text) {
        if(JSON.parse(text).copymodules) {
            try {
                deleteFolderRecursive(JSON.parse(text).copymodulesDir);
            } catch (e) {}
            copyRecursiveSync('node_modules/' + item, JSON.parse(text).copymodulesDir);
            console.log("Coped " + item + " to " + JSON.parse(text).copymodulesDir);
        }
    });
});
