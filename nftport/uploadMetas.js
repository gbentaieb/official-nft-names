const { queueFetch, executeFetch } = require("./utils/retryFetch");

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

require('dotenv').config({ path: path.resolve(process.cwd(), 'nftport', '.env') })

const AUTH = process.env.NFTPORT_API_KEY;
const jsonFolder = "output/json"

fs.writeFileSync(`${basePath}/${jsonFolder}/_ipfsMetas.json`, "");
const writter = fs.createWriteStream(`${basePath}/${jsonFolder}/_ipfsMetas.json`, {
  flags: "a",
});
writter.write("[");
const readDir = `${basePath}/${jsonFolder}`;
fileCount = fs.readdirSync(readDir).length - 1;

fs.readdirSync(readDir).forEach((file) => {
  if (file === "_ipfsMetas.json") return;

  const jsonFile = fs.readFileSync(`${readDir}/${file}`);

  let url = "https://api.nftport.xyz/v0/metadata";
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH,
    },
    body: jsonFile,
  };

  successCallback = (json) => {
    writter.write(JSON.stringify(json, null, 2));
      fileCount--;

      if (fileCount === 0) {
        writter.write("]");
        writter.end();
      } else {
        writter.write(",\n");
      }

      console.log(`${json.name} metadata uploaded & added to _ipfsMetas.json`);
  }

  errorCallback = (err) => {
    console.error("error:" + err)
  }

  queueFetch(url, options, successCallback, errorCallback)
});

executeFetch();