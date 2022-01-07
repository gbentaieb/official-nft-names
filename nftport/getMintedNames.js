const { retryFetch } = require("./utils/retryFetch");

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

require('dotenv').config({ path: path.resolve(process.cwd(), 'nftport', '.env') })

const AUTH = process.env.NFTPORT_API_KEY;
const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const CHAIN = process.env.NFT_CHAIN;

fs.writeFileSync(`${basePath}/minted_names_tracker.csv`, "");
const writter = fs.createWriteStream(`${basePath}/minted_names_tracker.csv`, {
  flags: "a",
});
writter.write("name\n");

const getMintedNames = async () => {
    let pageNumber = 0
    let nftCount = 0
    let totalNfts = -1

    while (nftCount != totalNfts) {
        pageNumber += 1

        const pageSize = 50
        const qsObject = {
            chain: CHAIN,
            include: "metadata",
            page_number: pageNumber,
            page_size: pageSize,
            refresh_metadata: true
        };
        const qs = Object.keys(qsObject).reduce((str, key) => {
            const start = str === "?" ? "" : "&"
            return `${str}${start}${key}=${qsObject[key]}`
        }, "?")
        
        const url = `https://api.nftport.xyz/v0/nfts/${CONTRACT_ADDRESS}${qs}`
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: AUTH,
            }
        }

        try {
            console.log(`Fetching new minted names page:\page_number: ${pageNumber}, page_size:${pageSize}`)

            const result = await retryFetch(url, options, 3, 3000, 1000)

            result.nfts.forEach(nft => {
                const name = nft.metadata.name

                console.log(`Minted Name Tracker: ${name}`)
                writter.write(`${name}\n`);

                nftCount += 1
            })

            totalNfts = result.total

            console.log(`Progress - NFT count: ${nftCount} / ${totalNfts}`)
        } catch (err) {
            console.error("Could not load all NFTs. error:" + err)
        }
    }
    writter.end();
}

getMintedNames()