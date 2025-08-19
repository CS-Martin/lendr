import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { defineTable } from "convex/server";

export const user = defineTable({
    address: v.string(),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
})
    .index("by_address", ["address"]);

export const createUser = mutation({
    args: {
        address: v.string(),
        username: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        bio: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("users", args);
    },
});

export const updateUser = mutation({
    args: {
        id: v.id("users"),
        username: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        bio: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;
        return await ctx.db.patch(id, rest);
    },
});

export const getUserByAddress = query({
    args: { address: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_address", (q) => q.eq("address", args.address))
            .first();
    },
});