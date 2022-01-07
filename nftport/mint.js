const { queueFetch, executeFetch } = require("./utils/retryFetch");
const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

require('dotenv').config({ path: path.resolve(process.cwd(), 'nftport', '.env') })

const AUTH = process.env.NFTPORT_API_KEY;
const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const MINT_TO_ADDRESS = process.env.MINT_TO_ADDRESS;
const CHAIN = process.env.NFT_CHAIN;
const jsonFolder = "output/json"
const mintFolder = "output/mint_result"

const ipfsMetas = JSON.parse(
  fs.readFileSync(`${basePath}/${jsonFolder}/_ipfsMetas.json`)
);

const mintedNamesWritter = fs.createWriteStream(`${basePath}/minted_names_tracker.csv`, {
  flags: "a",
});
mintedNamesWritter.write("\n")

fs.writeFileSync(`${basePath}/${mintFolder}/minted.json`, "");
const writter = fs.createWriteStream(`${basePath}/${mintFolder}/minted.json`, {
  flags: "a",
});
writter.write("[");
nftCount = ipfsMetas.length;

ipfsMetas.forEach((meta) => {
  const url = "https://api.nftport.xyz/v0/mints/customizable";

  const mintInfo = {
    chain: CHAIN,
    contract_address: CONTRACT_ADDRESS,
    metadata_uri: meta.metadata_uri,
    mint_to_address: MINT_TO_ADDRESS,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH,
    },
    body: JSON.stringify(mintInfo),
  };

  successCallback = (json) => {
    mintedNamesWritter.write(meta.name)
    writter.write(JSON.stringify(json, null, 2));
    nftCount--;

    if (nftCount === 0) {
      writter.write("]");
      mintedNamesWritter.end();
      writter.end();
    } else {
      mintedNamesWritter.write("\n")
      writter.write(",\n");
    }

    console.log(`Minted: ${meta.name} - ${json.transaction_external_url}`);
  }

  errorCallback = (err) => {
    console.error("error:" + err)
  }

  queueFetch(url, options, successCallback, errorCallback)
});

executeFetch();