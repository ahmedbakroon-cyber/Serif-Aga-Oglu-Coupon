import { Layout } from "@/components/layout/Layout";
import { useGetBatch, getGetBatchQueryKey } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { CouponCard } from "@/components/CouponCard";

export default function BatchDetail() {
  const [, params] = useRoute("/batches/:id");
  const batchId = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: batch, isLoading } = useGetBatch(batchId, {
    query: {
      enabled: !!batchId,
      queryKey: getGetBatchQueryKey(batchId)
    }
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/batches">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-64" /> : batch?.displayTitle}
            </h1>
            <p className="text-muted-foreground mt-1">
              Batch details and coupons
            </p>
          </div>
          {batch && (
            <Link href={`/print/${batch.id}`} target="_blank">
              <Button>
                <Printer className="h-4 w-4 mr-2" /> Print All
              </Button>
            </Link>
          )}
        </div>

        {isLoading || !batch ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {batch.coupons.map((coupon) => (
                <div key={coupon.id} className="flex justify-center">
                  <CouponCard
                    code={coupon.code}
                    batchId={coupon.batchId}
                    discountType={coupon.discountType}
                    discountValue={coupon.discountValue}
                    freeItemName={coupon.freeItemName}
                    displayTitle={coupon.displayTitle}
                    displaySubtitle={coupon.displaySubtitle}
                    backgroundColor={coupon.backgroundColor}
                    logoUrl={coupon.logoUrl}
                    footerText={coupon.footerText}
                    expiresAt={coupon.expiresAt}
                    isUsed={coupon.isUsed}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
