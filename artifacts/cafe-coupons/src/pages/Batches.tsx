import { Layout } from "@/components/layout/Layout";
import { useListBatches } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Eye, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Batches() {
  const { data: batches, isLoading } = useListBatches();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Coupon Batches</h1>
            <p className="text-muted-foreground mt-1">Manage and print your generated coupon batches.</p>
          </div>
          <Link href="/create">
            <Button>Create New Batch</Button>
          </Link>
        </div>

        {isLoading || !batches ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-dashed">
            <h3 className="text-lg font-medium text-foreground mb-2">No batches yet</h3>
            <p className="text-muted-foreground mb-4">Create your first batch of coupons to get started.</p>
            <Link href="/create">
              <Button>Create Batch</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {batches.map((batch) => (
              <Card key={batch.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div 
                      className="w-full md:w-32 h-24 md:h-auto flex-shrink-0 flex items-center justify-center border-r"
                      style={{ backgroundColor: batch.backgroundColor || "#f5f5f5" }}
                    >
                      <span className="font-serif font-bold text-xl opacity-50 mix-blend-color-burn">
                        {batch.quantity}
                      </span>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{batch.displayTitle}</h3>
                          <Badge variant="outline" className="capitalize">
                            {batch.discountType.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {format(new Date(batch.createdAt), "MMM d, yyyy")}
                          {batch.expiresAt && ` • Expires ${format(new Date(batch.expiresAt), "MMM d, yyyy")}`}
                        </p>
                        <div className="flex items-center gap-4 text-sm mt-2">
                          <span className="text-green-600 font-medium">{batch.activeCount} active</span>
                          <span className="text-muted-foreground">{batch.usedCount} used</span>
                          {batch.expiredCount > 0 && <span className="text-destructive">{batch.expiredCount} expired</span>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Link href={`/batches/${batch.id}`} className="flex-1 md:flex-none">
                          <Button variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                        </Link>
                        <Link href={`/print/${batch.id}`} className="flex-1 md:flex-none" target="_blank">
                          <Button variant="secondary" className="w-full">
                            <Printer className="h-4 w-4 mr-2" /> Print
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
