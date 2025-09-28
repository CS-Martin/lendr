/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bids from "../bids.js";
import type * as conversations from "../conversations.js";
import type * as customNftCollection from "../customNftCollection.js";
import type * as delegation from "../delegation.js";
import type * as escrowSmartContract from "../escrowSmartContract.js";
import type * as escrowSmartContractStep from "../escrowSmartContractStep.js";
import type * as factorySmartContract from "../factorySmartContract.js";
import type * as messages from "../messages.js";
import type * as nft from "../nft.js";
import type * as presence from "../presence.js";
import type * as rentalpost from "../rentalpost.js";
import type * as typingIndicators from "../typingIndicators.js";
import type * as user from "../user.js";
import type * as userConversations from "../userConversations.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bids: typeof bids;
  conversations: typeof conversations;
  customNftCollection: typeof customNftCollection;
  delegation: typeof delegation;
  escrowSmartContract: typeof escrowSmartContract;
  escrowSmartContractStep: typeof escrowSmartContractStep;
  factorySmartContract: typeof factorySmartContract;
  messages: typeof messages;
  nft: typeof nft;
  presence: typeof presence;
  rentalpost: typeof rentalpost;
  typingIndicators: typeof typingIndicators;
  user: typeof user;
  userConversations: typeof userConversations;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
