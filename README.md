# My NEAR Playground

## Intro

[Try It Out](https://johngrantuk.github.io/near-playground/)

My entry to the [NEAR Hackathon](https://nearprotocol.com/hackathon/). As I'm starting from scratch with NEAR, my initial aim is to try to get up to speed with the tech and build something playful that makes use of Blockchain storage and smart contract based logic. I want to get it deployed and see if anyone interacts with it.

## Description

The app at this stage has simple functionality but makes use of a lot of the Blockchain properties like persistent storage, accounts and smart contract rules. In the future it can also be extended using ERC721's, etc.

It's basically a clicking game. A click on the main button flashes the message that is currently stored in the contract for 5 seconds. It's meant to be like one of those flashing neon signs and I want it to flash whenever someone clicks (but without event support I'll need to work on that).

Every time the user clicks their count is updated on the blockchain.

A leaderboard of the user accounts with the most clicks is displayed using the info stored on the blockchain.

Anyone can update the current message in the contract if they have enough clicks:
* The required amount of clicks for a user increments by 1 every time they submit a new message.
* Every time they submit a new message the required amount of clicks is deducted from the users click count.
* If they don't have enough clicks to update the message the smart contract logic will prevent the message being updated.

## Some Stuff I Learned Along The Way

I thought it would be useful to document some of this incase it's helpful to others.

### Getting Set-up Locally

To get up and running I wanted to work locally. I installed the near-cli: ```$ npm i -g near-shell```

I then cloned the [near-place repo](https://github.com/nearprotocol/near-place).

Some things worth noting project wise:

All contract code is found in the assembly/ folder.

src/main.js is the main app code. A lot of the initial stuff is set-up for the smart contract stuff and can be left as is.

To deploy the contract to NEAR devnet:
* Setup an account for your contract (I think, to be honest I don't know what this is all about): ```--node_url https://studio.nearprotocol.com/devnet --account_id <yourcontractname>```
* Update src/config.js, CONTRACT_NAME, to use <yourcontractname>
* Now build the contract: ```$ npm run build``` (I think the error messages if something is wrong with the contract are pretty useful which is well done by the NEAR team)
* Now deploy: ```$ near deploy```
* To get the app running on local host: ```$ python3 -m http.server (from src dir) ```
* Once you make changes to the contract repeat the build and deploy steps. Remember to add any new smart contract functions to you Javascript viewMethods/changeMethods - it's easy to forget! :)
* To deploy to Github pages: npm run deploy:pages

### Useful Info

Smart contract debug logs: Really useful. Can be seen in browser dev console. Use ```near.log("YOUR MESSAGE");``` in your contract code.

Storing individual data in smart contract (and hence on Blockchain) is simple and done using, [storage](https://docs.nearprotocol.com/client-api/ts/classes/storage), for example:
* Save a number: ```storage.setU64("total_clicks", 100);```
* Get the number ```storage.getU64("total_clicks");```
* Save a string: ```storage.setString("message", message);```

Built in [collections](https://docs.nearprotocol.com/client-api/ts/classes/collections) are worth a look. For example the TopN collection was really good for click counting, leaderboard, etc.

Getting user account info - basically essential to get any worthwhile interaction with a smart contract but I didn't find the docs that explanatory.
* Add right import: ```import { context } from "./near";```  
* For change methods the info is found using ```context.sender```
* For view methods context.sender shows the contract name. Pass the user info from the Javascript side using: ```nearlib.dev.myAccountId ```

Passing values to smart contract:
* If we have a smart contract with the function: ```export function getUserClicks(user: string): u64```
* In the Javascript we pass user info using: ```nearplace.contract.getUserClicks({ user: nearlib.dev.myAccountId }); ```

Events - NEAR doesn't have support for contract logging. I just polled the smart contract like they do in the examples. I'm not sure how practical/scalable this is in real life though.

## To Do

Add wallet integration - at the moment I don't want to add a Wallet because I think it would stop people interacting. As far as I can see it would be easy to integrate a NEAR Wallet as the code is nicely done.
