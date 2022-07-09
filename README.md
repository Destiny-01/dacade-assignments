# Celo Story Book Dapp

## Description
This is a very simple story book app where users can 
* Create private stories on the celo blockchain that only them can see
* Create public stories that everyone see
* View everyone's public stories, all on a nice ui. 

## Live Demo
[Storybook Dapp](https://destiny-01.github.io/dacade-assignments)

## Usage

### Requirements
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the Google Chrome Store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.

### Test
1. Create a public story
2. Click on the title in "My Stories" section or Read more in all stories section to see the full story. 
3. Create a second account in your extension wallet and you will be able to see your story.
4. Create another private story, this time around, it won't show in all public stories and the other user can't see it.
5. Delete any story. If you delete a private story, it won't show in my stories section.
6. If you delete a public story, it will disappear from all stories and my stories section 


## Project Setup

### Install
```
npm install
```

### Start
```
npm run dev
```

### Build
```
npm run build
