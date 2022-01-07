# Introduction
This is the code used to create new NFTs for the "Official NFT Names" collection. This collection can be found [here](https://opensea.io/collection/official-nft-names).

# How to install the project
1. Pull the main branch locally
2. In the `nftport` folder, add a `.env` file and include the following variables:
    - `NFTPORT_API_KEY=123-ABC`. Replace `123-ABC` by your [NFTPORT](https://https://www.nftport.xyz/) API key
    - `NFT_CONTRACT_ADDRESS=123-ABC`. Replace `123-ABC` by the address of your NFT smart contract. If you don't have a smart contract, create one [here](https://docs.nftport.xyz/docs/nftport/b3A6MjE0MDYzNzU-deploy-an-nft-contract).
    - `MINT_TO_ADDRESS=123-ABC`. Replace `123-ABC` by your polygon account address. If you don't have one, we suggest you use [Metamask](https://metamask.io/) to create one.
3. Install node dependencies. Run the following bash script:

```bash
cd nftport
npm i
cd ..
```
4. Install python dependencies. Run the following script:

```
python3 -m pip install --upgrade Pillow
```

# How to mint new names
1. Go to the root directory of the project
2. Run `node nftport/getMintedNames.js`. This will grab all the names already minted in our collection and store them in `minted_names_tracker.csv`. This will be then used by our code to make sure we don't mint the same name twice.
3. Create (or replace) `names.csv` at the root directory to add the new names you want to mint. 3 things to know about this:
    - The csv should only have 1 column with a header: `name`, followed by a list of name (ie same structure as `minted_names_tracker.csv`)
    - Don't include any comma, semi-colon or else in the CSV (it does not make sense anyway since there is only 1 column)
    - Don't mind too much about already minted names: if a name is already minted, it will be dropped by our script (thanks to `minted_names_tracker.csv`)
4. Edit `main.py` to change the `names_edition` variable (basically add 1 to it).
5. Run `python3 main.py`. This will generate the png and json metadata files of our NFT under `output/images` and `output/json`
6. Run `node nftport/uploadFiles.js`. This will upload our png files to NFTPort. It also updates our json metadata files to include the path to our newly uploaded png files.
7. Run `node nftport/uploadMetas.js`. This will upload our metadata files to NFTPort. It will also create an `_ipfsMetas.json` under `output/json`. This file will be used to mint our new assets.
8. Run `node nftport/mint.js` to mint our new assets. It may take a bit of time for the new assets to be fully visible on OpenSea. The result will be logged in the following file: `output/mint_result/minted.json`. Succesfully minted names will be added to `minted_names_tracker`. This prevents us from mining the same name twice.
9. Push the new version of `minted_names_tracker.csv` to GitHub
10. If possible, update our [manual tracker](https://docs.google.com/spreadsheets/d/1Kj6w-GiU1LeCfjiu3ShzJSLQ21zOyh8sTQNSK7dfDJ4/edit#gid=0)