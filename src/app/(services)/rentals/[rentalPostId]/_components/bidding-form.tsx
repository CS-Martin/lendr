// components/bidding-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel, Loader2, Edit3 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../../../convex/_generated/api";
import { Doc } from "../../../../../../convex/_generated/dataModel";
import { useSession } from "next-auth/react";
import z from "zod";
import { toast } from "sonner";
import { formatDuration } from "@/lib/utils";


type BiddingFormProps = {
  rentalPost: Doc<"rentalposts">;
};

export const bidFormSchema = z.object({
  bidAmount: z
    .number()
    .positive("Bid amount must be positive")
    .min(0.0001, "Bid amount must be at least 0.0001 ETH"),
  rentalDuration: z
    .number()
    .min(1, "Rental duration must be at least 1 hour")
    .max(720, "Rental duration cannot exceed 720 hours (30 days)"),
  message: z
    .string()
    .max(500, "Message cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type BidFormValues = z.infer<typeof bidFormSchema>;


export function BiddingForm({ rentalPost }: BiddingFormProps) {
  const user = useSession().data?.user;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highestBid, setHighestBid] = useState<number>(rentalPost.hourlyRate);

  // Convex queries and mutations
  const placeBid = useMutation(api.bids.placeBid);
  const userBid = useQuery(api.bids.getUserBidForRentalPost, {
    rentalPostId: rentalPost._id,
    bidderAddress: user?.address || "",
  });

  const highestBidQuery = useQuery(api.bids.getHighestBid, {
    rentalPostId: rentalPost._id,
  });

  // Update highest bid when query returns
  useEffect(() => {
    if (highestBidQuery && highestBidQuery.bidAmount > highestBid) {
      setHighestBid(highestBidQuery.bidAmount);
    }
  }, [highestBidQuery, highestBid]);

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    setError,
    reset,
  } = useForm<BidFormValues>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      bidAmount: userBid?.bidAmount || Math.max(rentalPost.hourlyRate + 0.0001, highestBid + 0.0001),
      rentalDuration: userBid?.rentalDuration || 12,
      message: userBid?.message || "",
    },
    mode: "onChange",
  });

  // Update form when userBid changes
  useEffect(() => {
    if (userBid) {
      reset({
        bidAmount: userBid.bidAmount,
        rentalDuration: userBid.rentalDuration,
        message: userBid.message || "",
      });
    }
  }, [userBid, reset]);

  const rentalHours = watch("rentalDuration");
  const bidAmount = watch("bidAmount");

  const collateralCost = rentalPost.collateral;
  const bidTotalCost = (bidAmount || 0) * (rentalHours || 0);
  const bidTotal = bidTotalCost + collateralCost;

  const onSubmit = async (data: BidFormValues) => {
    if (!user) {
      toast.error(
        <div>
          <strong className="text-red-500">Authentication required</strong>
          <div>Please sign in to place a bid</div>
        </div>
      );
      return;
    }

    if (data.bidAmount <= highestBid) {
      setError("bidAmount", {
        type: "manual",
        message: `Bid must be higher than current highest bid (${highestBid} ETH)`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await placeBid({
        rentalPostId: rentalPost._id,
        bidderAddress: user.address,
        bidAmount: data.bidAmount,
        rentalDuration: data.rentalDuration,
        message: data.message,
      });

      toast.success(
        <div>
          <strong>{userBid ? "Bid updated!" : "Bid placed!"}</strong>
          <div>
            {userBid
              ? "Your bid has been successfully updated."
              : "Your bid has been placed successfully."}
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error(
        <div className="text-red-500">
          <strong>Error</strong>
          <div>Failed to place bid. Please try again.</div>
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Gavel className="w-5 h-5 text-orange-400" />
          <span>{userBid ? "Edit Your Bid" : "Place Your Bid"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Bid amount */}
          <div className="space-y-2">
            <Label htmlFor="bidAmount" className="text-slate-300">
              Bid Amount (ETH per hour)
            </Label>
            <Input
              id="bidAmount"
              type="number"
              step="0.0001"
              placeholder={`Minimum: ${Math.max(rentalPost.hourlyRate, highestBid) + 0.0001} ETH`}
              className="bg-slate-800 border-slate-700 text-white"
              {...register("bidAmount", { valueAsNumber: true })}
            />
            {errors.bidAmount ? (
              <p className="text-sm text-red-400">{errors.bidAmount.message}</p>
            ) : (
              <p className="text-sm text-slate-400">
                Must be higher than current highest bid: {highestBid} ETH
              </p>
            )}
          </div>

          {/* Rental duration (hours) */}
          <div className="space-y-2">
            <Label className="text-slate-300">
              Rental Duration: {formatDuration(rentalHours)} hour(s)
            </Label>
            <Slider
              value={[rentalHours]}
              onValueChange={([value]) => setValue("rentalDuration", value)}
              max={rentalPost.rentalDuration * 24}
              min={1}
              step={1}
              className="mt-2"
            />
            {errors.rentalDuration && (
              <p className="text-sm text-red-400">{errors.rentalDuration.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-slate-300">
              Message to Owner (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Why should you be chosen?"
              className="bg-slate-800 border-slate-700 text-white"
              {...register("message")}
            />
            {errors.message && (
              <p className="text-sm text-red-400">{errors.message.message}</p>
            )}
          </div>

          {/* Cost breakdown */}
          {bidAmount > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">
                  Bid Total ({formatDuration(rentalHours)})
                </span>
                <span className="text-white">{bidTotalCost} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Collateral (refundable)</span>
                <span className="text-cyan-400">
                  {collateralCost} ETH
                </span>
              </div>

              <Separator className="bg-slate-700" />
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total Required</span>
                <span className="text-orange-400">{bidTotal} ETH</span>
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {userBid ? "Updating..." : "Placing..."}
              </>
            ) : (
              <>
                <Edit3 className="mr-2 h-4 w-4" />
                {userBid ? "Update Bid" : "Place Bid"}
              </>
            )}
          </Button>

          {userBid && (
            <p className="text-sm text-slate-400 text-center">
              You can edit your bid at any time before the auction ends.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
