import { useGetCouponByCode, getGetCouponByCodeQueryKey } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { AlertTriangle, Coffee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicCoupon() {
  const [, params] = useRoute("/coupon/:code");
  const code = params?.code || "";

  const { data: coupon, isLoading, error } = useGetCouponByCode(code, {
    query: {
      enabled: !!code,
      queryKey: getGetCouponByCodeQueryKey(code)
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="p-8 space-y-4 flex flex-col items-center">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-48 w-48 mt-4 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-serif font-bold">Coupon Not Found</h1>
          <p className="text-gray-500">This coupon may be invalid, expired, or the code is incorrect.</p>
        </div>
      </div>
    );
  }

  const isUsed = coupon.status === "used";
  const isExpired = coupon.status === "expired";
  const isValid = coupon.status === "active";

  const currentUrl = window.location.href;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <main className="flex-1 flex flex-col items-center p-4 sm:p-8 pt-8 sm:pt-16 max-w-md mx-auto w-full">
        
        {/* Header Logo Area */}
        <div className="mb-6 text-center">
          {coupon.logoUrl ? (
            <img src={coupon.logoUrl} alt="Cafe Logo" className="h-16 mx-auto object-contain" />
          ) : (
            <div className="flex items-center justify-center gap-2 text-neutral-800">
              <Coffee className="w-8 h-8" />
              <span className="font-serif font-bold text-2xl tracking-tight">CafeCoupons</span>
            </div>
          )}
        </div>

        {/* The Card */}
        <div className="w-full relative bg-white rounded-[2rem] shadow-xl overflow-hidden border border-neutral-100">
          
          {/* Top colored section */}
          <div 
            className="px-6 py-8 text-center relative"
            style={{ backgroundColor: coupon.backgroundColor || "#f5f5f5" }}
          >
            {/* Texture */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
            
            <div className="relative z-10">
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-neutral-900 leading-tight mb-2 mix-blend-color-burn">
                {coupon.displayTitle}
              </h1>
              {coupon.displaySubtitle && (
                <p className="text-neutral-700 font-medium mix-blend-color-burn opacity-80">
                  {coupon.displaySubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Dotted separator */}
          <div className="h-0 border-t-2 border-dashed border-neutral-200 mx-8 relative">
            <div className="absolute -left-12 -top-4 w-8 h-8 bg-[#FDFBF7] rounded-full shadow-inner" />
            <div className="absolute -right-12 -top-4 w-8 h-8 bg-[#FDFBF7] rounded-full shadow-inner" />
          </div>

          {/* QR Code Section */}
          <div className="p-8 text-center bg-white relative">
            
            {(isUsed || isExpired) && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
                <div className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-bold text-2xl rotate-[-10deg] shadow-xl border-4 border-white">
                  {isUsed ? "REDEEMED" : "EXPIRED"}
                </div>
              </div>
            )}

            <div className="bg-white p-4 inline-block rounded-2xl shadow-sm border border-neutral-100 mb-6">
              <QRCodeSVG 
                value={currentUrl} 
                size={200} 
                level="Q" 
                includeMargin={false}
              />
            </div>

            <div className="space-y-1 mb-6">
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Your Code</p>
              <p className="font-mono text-2xl font-bold text-neutral-800 tracking-wider">
                {coupon.code.match(/.{1,4}/g)?.join('-') || coupon.code}
              </p>
            </div>

            <div className="bg-amber-50 text-amber-900 px-4 py-3 rounded-xl text-sm font-medium">
              Show this QR code to the barista to redeem your offer.
            </div>
            
          </div>
          
          {/* Footer Info */}
          <div className="bg-neutral-50 p-4 sm:p-6 text-center text-xs text-neutral-500 border-t border-neutral-100 space-y-2">
            {coupon.expiresAt && (
              <p>Valid until {format(new Date(coupon.expiresAt), "MMMM d, yyyy")}</p>
            )}
            {coupon.footerText && (
              <p className="leading-relaxed max-w-[250px] mx-auto">{coupon.footerText}</p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
