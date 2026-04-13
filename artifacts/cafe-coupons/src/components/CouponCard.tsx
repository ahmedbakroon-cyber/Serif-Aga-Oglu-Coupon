import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function getContrastColor(hex: string): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}

interface CouponCardProps {
  code: string;
  batchId: number;
  discountType: string;
  discountValue?: number;
  freeItemName?: string;
  displayTitle: string;
  displaySubtitle?: string;
  backgroundColor?: string;
  logoUrl?: string;
  footerText?: string;
  expiresAt?: string;
  isUsed?: boolean;
  compact?: boolean;
}

export function CouponCard({
  code,
  discountType,
  discountValue,
  freeItemName,
  displayTitle,
  displaySubtitle,
  backgroundColor = "#FDFBF7",
  logoUrl,
  footerText,
  expiresAt,
  isUsed,
  compact = false,
}: CouponCardProps) {
  const qrUrl = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/coupon/${code}`;
  const textColor = getContrastColor(backgroundColor || "#FDFBF7");

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden border shadow-sm flex flex-col",
        compact ? "w-[2.25in] h-[3.5in]" : "w-full max-w-sm",
        isUsed && "opacity-60 grayscale"
      )}
      style={{ backgroundColor }}
    >
      {/* Decorative texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className={cn("flex flex-col items-center justify-between flex-1 relative z-10", compact ? "p-4" : "p-6")} style={{ color: textColor }}>
        
        {/* Header / Logo */}
        <div className="w-full flex flex-col items-center gap-2 mb-4 text-center">
          {logoUrl && (
            <img src={logoUrl} alt="Cafe Logo" className={cn("object-contain", compact ? "h-10" : "h-16")} />
          )}
          <h3 className={cn("font-serif font-bold leading-tight", compact ? "text-lg" : "text-2xl")} style={{ color: textColor }}>
            {displayTitle}
          </h3>
          {displaySubtitle && (
            <p className={cn("font-medium opacity-80", compact ? "text-xs" : "text-sm")} style={{ color: textColor }}>
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* QR Code area */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <QRCodeSVG 
            value={qrUrl} 
            size={compact ? 120 : 160} 
            level="M" 
            includeMargin={false}
            fgColor="#1a1a1a"
          />
        </div>

        {/* Offer Details */}
        <div className="text-center mt-4 mb-2">
          <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-2" style={{ color: textColor }}>
            {discountType === "percentage" && `${discountValue}% OFF`}
            {discountType === "fixed" && `${discountValue} OFF`}
            {discountType === "free_item" && `FREE ${freeItemName?.toUpperCase()}`}
          </div>
          <p className="font-mono text-xs uppercase tracking-widest mt-1 opacity-70" style={{ color: textColor }}>
            {code}
          </p>
        </div>

        {/* Footer */}
        <div className="w-full text-center mt-auto border-t pt-3" style={{ borderColor: `${textColor}33` }}>
          {expiresAt && (
            <p className="text-[10px] opacity-70 mb-1" style={{ color: textColor }}>
              Valid until {format(new Date(expiresAt), "MMM d, yyyy")}
            </p>
          )}
          {footerText && (
            <p className="text-[10px] max-w-[90%] mx-auto leading-tight opacity-70" style={{ color: textColor }}>
              {footerText}
            </p>
          )}
        </div>

      </div>

      {isUsed && (
        <div className="absolute inset-0 bg-background/40 flex items-center justify-center backdrop-blur-[1px] z-20">
          <div className="bg-destructive text-destructive-foreground px-6 py-2 rounded-lg font-bold text-xl rotate-[-15deg] shadow-lg border-2 border-white">
            REDEEMED
          </div>
        </div>
      )}
    </div>
  );
}
