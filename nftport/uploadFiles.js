const FormData = require("form-data");
const { queueFetch, executeFetch } = require("./utils/retryFetch");

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

require('dotenv').config({ path: path.resolve(process.cwd(), 'nftport', '.env') })

const AUTH = process.env.NFTPORT_API_KEY;
const imageFolder = "output/images"
const jsonFolder = "output/json"

fs.readdirSync(`${basePath}/${imageFolder}`).forEach((file) => {
  const formData = new FormData();
  const fileStream = fs.createReadStream(`${basePath}/${imageFolder}/${file}`);
  formData.append("file", fileStream);

  const url = "https://api.nftport.xyz/v0/files";
  const options = {
    method: "POST",
    headers: {
      Authorization: AUTH,
    },
    body: formData,
  };

  successCallback = (json) => {
    const fileName = path.parse(json.file_name).name;
    const rawdata = fs.readFileSync(`${basePath}/${jsonFolder}/${fileName}.json`);
    const metaData = JSON.parse(rawdata);

    metaData.file_url = json.ipfs_url;

    fs.writeFileSync(
      `${basePath}/${jsonFolder}/${fileName}.json`,
      JSON.stringify(metaData, null, 2)
    );

    console.log(`${json.file_name} uploaded & ${fileName}.json updated!`);
  }

  errorCallback = (err) => {
    console.error("error:" + err)
  }

  queueFetch(url, options, successCallback, errorCallback)
});

executeFetch();