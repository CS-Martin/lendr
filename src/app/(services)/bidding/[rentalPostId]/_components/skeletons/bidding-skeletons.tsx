import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BiddingSidebarSkeleton = () => (
    <Card className="bg-slate-900/50 border-slate-800 h-[calc(100vh-20vh)]">
        <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
        </CardContent>
    </Card>
);

const BidsListSkeleton = () => (
    <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-800">
                <CardContent className="space-y-4 p-6">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                    <div className="flex space-x-3">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

export const BiddingPageSkeleton = () => (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
        <div className="container max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
            <div className="col-span-1">
                <BiddingSidebarSkeleton />
            </div>
            <div className="col-span-2">
                <BidsListSkeleton />
            </div>
        </div>
    </div>
);