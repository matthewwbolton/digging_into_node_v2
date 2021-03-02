#! /usr/bin/env node

"use strict";

var util = require("util");
var path = require("path");
var fs = require("fs");
var Transform = require("stream").Transform;
// console.log(Transform.toString());
let zlib = require("zlib");
let CAF = require("caf");

var getStdin = require("get-stdin");

var args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "uncompress"],
  string: ["file"],
});

// console.log("ARGS", args);

function streamComplete(stream) {
  return new Promise(function c(resolve) {
    stream.on("end", resolve);
  });
}

var BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

let OUTFILE = path.join(BASE_PATH, "out.txt");

if (process.env.HELLO) {
  console.log(process.env.HELLO);
}

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  processFile(process.stdin)
    .then(() => console.log("COMPLETE from stdin"))
    .catch(error);
  // getStdin().then(processFile).catch(error);
} else if (args.file) {
  let stream = fs.createReadStream(path.join(BASE_PATH, args.file));
  processFile(stream)
    .then(function () {
      console.log("COMPLETE!");
    })
    .catch(error);

  // fs.readFile(
  //   path.join(BASE_PATH, args.file),
  //   function onContents(err, contents) {
  //     if (err) {
  //       error(err.toString());
  //     } else {
  //       processFile(contents.toString());
  //     }
  //   }
  // );
} else {
  error("Incorrect Usage", true);
}

//***************************

async function processFile(inStream) {
  let outStream = inStream;

  if (args.uncompress) {
    let gunzipStream = zlib.createGunzip();
    outStream = outStream.pipe(gunzipStream);
  }

  let upperStream = new Transform({
    transform(chunk, enc, cb) {
      this.push(chunk.toString().toUpperCase());
      cb();
    },
  });

  outStream = outStream.pipe(upperStream);

  if (args.compress) {
    let gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    OUTFILE = `${OUTFILE}.gz`;
  }

  let targetStream;

  if (args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUTFILE);
  }

  outStream.pipe(targetStream);

  await streamComplete(outStream);
}

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log("");
    printHelp();
  }
}

function printHelp() {
  console.log("ex3 usage: ");
  console.log(" ex3.js --file={FILENAME}");
  console.log("");
  console.log("--help                 print this help");
  console.log("--file={FILENAME}      process the file");
  console.log("--in, -                   process stdin");
  console.log("--out                  print to stdout");
  console.log("--compress             gzip the output");
  console.log("--uncompress           un-gzip the input file");
  console.log("");
}
