'use strict';

var yauzl = require('yauzl');
const fs = require('fs');
var http = require('http');
var path = require('path');
const fork = require('child_process');
var Transform = require('stream').Transform;

const operateFile = async () => {
  var zipFilePath = 'Data/updates/server.zip';
  function mkdirp(dir, cb) {
    if (dir === '.') return cb();
    fs.stat(dir, function (err) {
      if (err == null) return cb(); // already exists

      var parent = path.dirname(dir);
      mkdirp(parent, function () {
        process.stdout.write(dir.replace(/\/$/, '') + '/\n');
        fs.mkdir(dir, cb);
      });
    });
  }

  yauzl.open(zipFilePath, { lazyEntries: true }, handleZipFile);

  async function handleZipFile(err, zipfile) {
    console.log('starting operation');
    if (err) throw err;

    // track when we've closed all our file handles
    var handleCount = 0;
    function incrementHandleCount() {
      handleCount++;
    }
    function decrementHandleCount() {
      handleCount--;
      if (handleCount === 0) {
        console.log('all input and output handles closed');
      }
    }

    incrementHandleCount();
    zipfile.on('close', async function () {
      console.log('closed input file');
      decrementHandleCount();
      var from = path.join(__dirname, '../server');
      var updates = path.join(__dirname, '../Data/updates');
      var to = path.join(__dirname, '../');

      await copyFolderSync(from, to);
      //removed await
      fs.rmSync(from, { recursive: true, force: true });
      fs.rmSync(updates, { recursive: true, force: true });
      console.log('all done');

      var out = fs.openSync('./out.log', 'a');
      var err = fs.openSync('./out.log', 'a');
      var child = fork.spawn(
        path.join(__dirname, '../startup.exe'),
        ['restart'],
        {
          detached: true,
          stdio: ['ignore', out, err],
        }
      );
      child.unref();
      process.exit();
    });

    zipfile.readEntry();
    zipfile.on('entry', function (entry) {
      if (/\/$/.test(entry.fileName)) {
        // directory file names end with '/'
        mkdirp(entry.fileName, function () {
          if (err) throw err;
          zipfile.readEntry();
        });
      } else {
        // ensure parent directory exists
        mkdirp(path.dirname(entry.fileName), function () {
          zipfile.openReadStream(entry, function (err, readStream) {
            if (err) throw err;
            // report progress through large files
            var byteCount = 0;
            var totalBytes = entry.uncompressedSize;
            var lastReportedString = byteCount + '/' + totalBytes + '  0%';
            process.stdout.write(entry.fileName + '...' + lastReportedString);
            function reportString(msg) {
              var clearString = '';
              for (var i = 0; i < lastReportedString.length; i++) {
                clearString += '\b';
                if (i >= msg.length) {
                  clearString += ' \b';
                }
              }
              process.stdout.write(clearString + msg);
              lastReportedString = msg;
            }
            // report progress at 60Hz
            var progressInterval = setInterval(function () {
              reportString(
                byteCount +
                  '/' +
                  totalBytes +
                  '  ' +
                  (((byteCount / totalBytes) * 100) | 0) +
                  '%'
              );
            }, 1000 / 60);
            var filter = new Transform();
            filter._transform = function (chunk, encoding, cb) {
              byteCount += chunk.length;
              cb(null, chunk);
            };
            filter._flush = function (cb) {
              clearInterval(progressInterval);
              reportString('');
              // delete the "..."
              process.stdout.write('\b \b\b \b\b \b\n');
              cb();
              zipfile.readEntry();
            };

            // pump file contents
            var writeStream = fs.createWriteStream(entry.fileName);
            incrementHandleCount();
            writeStream.on('close', decrementHandleCount);
            readStream.pipe(filter).pipe(writeStream);
          });
        });
      }
    });
  }
};

async function checkifNotCreateFile(dir, cb) {
  const found = await fs.stat(dir, (err) => null);
  if (!found) {
    await fs.mkdir(dir, () => {});
  }
  await cb();
  /*fs.stat(dir, (err) => {
    if (err) {
      console.log(2);
      await fs.mkdir(dir, cb);
    } else {
      console.log(2);
      cb();
    }
  });*/
}

function copyFolderSync(from, to) {
  fs.readdirSync(from).forEach((element) => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      if (!fs.existsSync(path.join(to, element)))
        fs.mkdirSync(path.join(to, element));
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

exports.downloadAndUpdate = async (next, body, pckg) => {
  const editPackage = async () => {
    pckg.version = body.version;
    fs.writeFile(
      './package.json',
      JSON.stringify(pckg, null, 2),
      function writeJSON(err) {
        if (err) next(err);
        else console.log('done');
      }
    );
  };
  const fetchAndExtract = async () => {
    var file = await fs.createWriteStream(dir + 'server.zip');
    await editPackage();
    http.get(body.url, function (response) {
      response.pipe(file);
      file.on('finish', function () {
        file.close((err) => {
          if (!err) {
            operateFile();
          } else next(err);
        }); // close() is async, call cb after close completes.
      });
    });
  };
  let dir = 'Data/updates/';
  await checkifNotCreateFile(dir, fetchAndExtract);
};
