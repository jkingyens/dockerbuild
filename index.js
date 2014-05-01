
var colors = require('colors');
var fs = require('fs');
var fstream = require('fstream');
var gitignore = require('gitignore-parser');
var request = require('request');
var tar = require('tar');
var zlib = require('zlib');

// check usage
if (!process.argv[2]) {
  console.error('usage: publish <repo>');
  process.exit(-1);
}

var repo = process.argv[2];

// pointer to the build server
var client_host = process.env.BUILD_HOST;
var client_port = process.env.BUILD_PORT;
var client_auth = process.env.BUILD_AUTH;

// stream the current directory as a gzip/tarball
var cwd = process.cwd();

// verify there is a dockerfile in the local directory
fs.exists(cwd + '/Dockerfile', function (exists) {
  if (!exists) {
    console.error('Dockerfile does not exist');
    process.exit(-1);
  } else {
    fs.exists(cwd + '/.gitignore', function (exists) {
      if (exists) {
        fs.readFile(cwd + '/.gitignore', 'utf8', function (err, data) {
          if (err) {
            throw err;
          }
          var filter = gitignore.compile(data);
          var gzip_stream = packContext(cwd, filter.denies);
          gzip_stream.pipe(streamContext(function (id) {
            if (id) {
              console.log('published ' + repo + ' as: ' + id);
            }
          }));
        });
      } else {
        var gzip_stream = packContext(cwd, function () { return false; });
        gzip_stream.pipe(streamContext(function (id) {
          if (id) {
            console.log('published ' + repo + ' as: ' + id);
          }
        }));
      }
    });
  }
});

// create a stream from the local build context
function packContext (archivePath, denies) {
  var reader = fstream.Reader({
    path: archivePath,
    type: 'Directory',
    filter: function () {
      if (this.dirname == archivePath) {
        this.root = null;
      }
      return !denies(this._path.replace(archivePath + '/', ''));
    }
  });
  var packer = tar.Pack();
  reader.pipe(packer);
  packer.pipe(fs.createWriteStream('/Users/jkingyens/whynot.tar', 'utf8'));
  var gzip = zlib.createGzip();
  packer.pipe(gzip);
  return gzip;
}

// ship the build context stream over http
function streamContext (cb) {
  var remote_url = 'http://' + client_host + ':' + client_port + '/' + repo;
  var r = request({
    url: remote_url,
    method: 'POST',
    headers: {
      'content-type': 'application/x-compressed',
      Authorization: 'Bearer ' + client_auth
    }
  }, function (err, res, body) {
    if (err) {
      throw err;
    }
    var parsed_body = JSON.parse(body);
    if (res.statusCode !== 201) {
      console.error('Error:', parsed_body.reason);
      return cb();
    } else {
      console.log(repo + ' published successfully.');
      return cb();
    }
  });
  return r;
}
