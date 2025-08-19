import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { defineTable } from "convex/server";

export const RentalListingStatus = v.union(
    v.literal("AVAILABLE"),
    v.literal("RENTED"),
    v.literal("DELISTED"),
    v.literal("DISPUTED_FOR_LENDER"),
    v.literal("DISPUTED_FOR_RENTER")
);

export const rentalpost = defineTable({
    posterAddress: v.string(),
    nftId: v.id("nft"),
    name: v.string(),
    imageUrl: v.string(),
    tokenType: v.string(),
    collectionName: v.optional(v.string()),
    description: v.optional(v.string()),
    hourlyRate: v.float64(),
    collateral: v.float64(),
    category: v.optional(v.string()),
    isBiddable: v.boolean(),
    biddingStarttime: v.optional(v.number()),
    biddingEndtime: v.optional(v.number()),
    isActive: v.boolean(),
    status: RentalListingStatus,
})
    .index("by_posterAddress", ["posterAddress"])
    .index("by_status", ["status"])

export const createRentalPost = mutation({
    args: {
        posterAddress: v.string(),
        nftId: v.id("nft"),
        name: v.string(),
        imageUrl: v.string(),
        tokenType: v.string(),
        collectionName: v.optional(v.string()),
        description: v.optional(v.string()),
        hourlyRate: v.float64(),
        collateral: v.float64(),
        category: v.optional(v.string()),
        isBiddable: v.boolean(),
        biddingStarttime: v.optional(v.number()),
        biddingEndtime: v.optional(v.number()),
        isActive: v.boolean(),
        status: RentalListingStatus,
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("rentalposts", args);
    },
});

export const updateRentalPost = mutation({
    args: {
        id: v.id("rentalposts"),
        hourlyRate: v.optional(v.float64()),
        collateral: v.optional(v.float64()),
        isBiddable: v.optional(v.boolean()),
        biddingStarttime: v.optional(v.number()),
        biddingEndtime: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
        status: v.optional(RentalListingStatus),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;
        return await ctx.db.patch(id, rest);
    },
});

export const deleteRentalPost = mutation({
    args: { id: v.id("rentalposts") },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.id);
    },
});

export const getRentalPosts = query({
    args: { status: v.optional(RentalListingStatus) },
    handler: async (ctx, args) => {
        if (args.status) {
            return await ctx.db
                .query("rentalposts")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .collect();
        }
        return await ctx.db.query("rentalposts").collect();
    },
});