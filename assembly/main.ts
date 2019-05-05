import "allocator/arena";
export { memory };

import { context, storage, near, collections } from "./near";

// --- contract code goes below

let user_clicks  = collections.topN<string>("a");
let message_clicks  = collections.topN<string>("b");
// Stores the amount a user has clicked
// https://docs.nearprotocol.com/client-api/ts/classes/collections/topn

export function init(): void {
  storage.setU64("total_clicks", 0);
}

export function totalClicks(): u64 {
  return storage.getU64("total_clicks");
}

export function addClick(): boolean {
  near.log("Addding click for : " + context.sender);
  storage.setU64("total_clicks", storage.getU64("total_clicks") + 1);           // Update total clicks & the individual user
  user_clicks.incrementRating(context.sender);
  return true;
}

export function getUserClicks(user: string): u64 {
  near.log("Getting Clicks For User: " + user);
  return user_clicks.getRating(user, 0);
}

export function getTopTen(): Array<String> {
  return user_clicks.getTop(10);
}

export function addMessage(message: string): bool {
  near.log("Updating Message User: " + context.sender);
  near.log(message);

  var required_message_clicks = message_clicks.getRating(context.sender, 0) + 1;
  var actual_clicks = user_clicks.getRating(context.sender, 0);

  near.log('Needs clicks: ' + required_message_clicks.toString());
  near.log('Has Clicks: ' + actual_clicks.toString());

  if(actual_clicks < required_message_clicks){
    near.log("NOT ENOUGH CLICKS TO ADD MESSAGE");
    return false;
  }

  message_clicks.incrementRating(context.sender);
  user_clicks.setRating(context.sender, actual_clicks - required_message_clicks);

  storage.setString("message", message);
  near.log("MESSAGE UPDATED");
  return true;
}

export function getMessage(): String {
  return storage.getString("message");
}

export function getRequiredUserMessageClicks(user: string): u64 {
  near.log("Getting Message Clicks For User: " + user);
  return message_clicks.getRating(user, 0) + 1;
}
