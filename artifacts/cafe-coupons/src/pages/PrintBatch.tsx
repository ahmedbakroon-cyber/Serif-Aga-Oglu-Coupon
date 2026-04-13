import { useGetBatch, getGetBatchQueryKey } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { CouponCard } from "@/components/CouponCard";
import { AlertTriangle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrintBatch() {
  const [, params] = useRoute("/print/:batchId");
  const batchId = params?.batchId ? parseInt(params.batchId, 10) : 0;
  
  const { data: batch, isLoading, error } = useGetBatch(batchId, {
    query: {
      enabled: !!batchId,
      queryKey: getGetBatchQueryKey(batchId)
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen font-serif text-xl">Preparing print layout...</div>;
  }

  if (error || !batch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4 p-8">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Failed to load batch</h2>
        <p className="text-muted-foreground">The batch might not exist or there was an error loading it.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white text-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto mb-8 print:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h1 className="font-serif font-bold text-xl">{batch.displayTitle}</h1>
          <p className="text-sm text-gray-500">{batch.quantity} coupons ready to print</p>
        </div>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Print Now
        </Button>
      </div>

      <div className="print-grid max-w-[210mm] mx-auto print:m-0 print:max-w-none">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body { background: white !important; }
            .print-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; width: 100%; }
            .coupon-wrapper { page-break-inside: avoid; border: 1px dashed #ccc; margin: -1px 0 0 -1px; }
          }
          @media screen {
            .print-grid { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
            .coupon-wrapper { padding: 0.5rem; }
          }
        `}} />
        
        {batch.coupons.map(coupon => (
          <div key={coupon.id} className="coupon-wrapper flex items-center justify-center p-2 print:p-0">
            <div className="scale-[0.9] print:scale-[0.95] origin-top-left">
              <CouponCard
                compact
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
          </div>
        ))}
      </div>
    </div>
  );
}
