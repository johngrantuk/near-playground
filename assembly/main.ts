import "allocator/arena";
export { memory };

import { context, storage, near, collections } from "./near";

// --- contract code goes below

// let user_clicks = collections.map<string, u64>("a:");
let user_clicks  = collections.topN<string>("a");
// https://docs.nearprotocol.com/client-api/ts/classes/collections/topn
//  getRating(key: K, defaultRating?: i32)
// getTop(limit: i32)
// incrementRating(key: K, increment?: i32)

export function init(): void {

  storage.setU64("total_clicks", 0);
}

export function totalClicks(): u64 {
  near.log("JOHNS TEST");
  near.log(context.sender);
  return storage.getU64("total_clicks");
}

export function addClick(): boolean {
  storage.setU64("total_clicks", storage.getU64("total_clicks") + 1);
  near.log("Addding click for : " + context.sender);
  user_clicks.incrementRating(context.sender);
  return true;
}

export function getUserClicks(user: string): u64 {
  near.log("User: " + user);

  return user_clicks.getRating(user, 0);
}

export function getTopTen(): Array<String> {
  return user_clicks.getTop(10);
}

export function addMessage(message: string): bool {
  near.log("Updating Message User: " + context.sender);
  near.log(message);

  storage.setString("message", message);
  return true;
}

export function getMessage(): String {
  return storage.getString("message");
}
