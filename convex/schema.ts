import { defineSchema } from "convex/server";
import { nft } from "./nft";
import { rentalpost } from "./rentalpost";
import { user } from "./user";

export default defineSchema({
    users: user,
    nft: nft,
    rentalposts: rentalpost,
});