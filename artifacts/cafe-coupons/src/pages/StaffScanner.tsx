import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useValidateCoupon, getValidateCouponQueryKey, useRedeemCoupon } from "@workspace/api-client-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, ScanLine, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

export default function StaffScanner() {
  const [scannedCode, setScannedCode] = useState<string>("");
  const [inputCode, setInputCode] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: validation, isLoading: isValidating, refetch } = useValidateCoupon(scannedCode, {
    query: {
      enabled: !!scannedCode,
      queryKey: getValidateCouponQueryKey(scannedCode)
    }
  });

  const redeemMutation = useRedeemCoupon({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Success!",
          description: "Coupon redeemed successfully.",
        });
        // Invalidate validation to get fresh data showing it's used
        queryClient.invalidateQueries({ queryKey: getValidateCouponQueryKey(scannedCode) });
      },
      onError: (err) => {
        toast({
          title: "Redemption Failed",
          description: "Could not redeem the coupon. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scannerRef.current.render(
        (decodedText) => {
          // Check if it's a URL
          let codeToUse = decodedText;
          try {
            const url = new URL(decodedText);
            const pathParts = url.pathname.split('/');
            const codeFromUrl = pathParts[pathParts.length - 1];
            if (codeFromUrl) {
              codeToUse = codeFromUrl;
            }
          } catch (e) {
            // Not a URL, use as is
          }
          
          setScannedCode(codeToUse);
          setIsScanning(false);
          if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
          }
        },
        (error) => {
          // Ignore scanning errors as they happen constantly during search
        }
      );
    } else if (!isScanning && scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [isScanning]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setScannedCode(inputCode.trim());
    }
  };

  const handleRedeem = () => {
    if (scannedCode) {
      redeemMutation.mutate({ code: scannedCode });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">Staff Scanner</h1>
          <p className="text-muted-foreground mt-2">Scan customer QR codes to validate and redeem offers.</p>
        </div>

        {!scannedCode && !isScanning && (
          <Card className="border-2 border-dashed bg-card/50">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <ScanLine className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold">Ready to Scan</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Use your device camera to scan a customer's QR coupon, or enter the code manually below.
              </p>
              <div className="flex flex-col sm:flex-row w-full max-w-md gap-4">
                <Button onClick={() => setIsScanning(true)} className="flex-1" size="lg">
                  <ScanLine className="mr-2 h-5 w-5" /> Start Scanner
                </Button>
              </div>
              
              <div className="w-full max-w-md mt-8">
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input 
                    placeholder="Enter coupon code" 
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="font-mono uppercase"
                  />
                  <Button type="submit" variant="secondary">Check</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}

        {isScanning && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Scanning QR Code...</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsScanning(false)}>Cancel</Button>
            </CardHeader>
            <CardContent>
              <div id="qr-reader" className="w-full max-w-md mx-auto overflow-hidden rounded-lg border"></div>
            </CardContent>
          </Card>
        )}

        {scannedCode && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Validation Result</h2>
              <Button variant="outline" size="sm" onClick={() => {
                setScannedCode("");
                setInputCode("");
              }}>
                <RefreshCw className="mr-2 h-4 w-4" /> Scan Another
              </Button>
            </div>

            {isValidating ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p>Verifying coupon...</p>
                </CardContent>
              </Card>
            ) : validation ? (
              <Card className={`overflow-hidden border-2 ${validation.valid ? 'border-green-500' : 'border-destructive'}`}>
                <div className={`p-4 flex items-center gap-3 text-white ${validation.valid ? 'bg-green-500' : 'bg-destructive'}`}>
                  {validation.valid ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  <h3 className="font-bold text-lg">{validation.message}</h3>
                </div>
                
                <CardContent className="p-6">
                  {validation.coupon && (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between border-b pb-4">
                        <div>
                          <p className="text-sm text-muted-foreground uppercase tracking-wider font-mono mb-1">{validation.coupon.code}</p>
                          <h4 className="text-2xl font-serif font-bold text-foreground">{validation.coupon.displayTitle}</h4>
                          <p className="text-muted-foreground">{validation.coupon.displaySubtitle}</p>
                        </div>
                        <Badge variant={validation.coupon.status === "active" ? "default" : "destructive"} className="text-sm px-3 py-1">
                          {validation.coupon.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <p className="text-sm font-medium text-primary mb-1">REWARD TO PROVIDE:</p>
                        <p className="text-xl font-bold text-foreground">
                          {validation.coupon.discountType === "percentage" && `${validation.coupon.discountValue}% OFF`}
                          {validation.coupon.discountType === "fixed" && `$${validation.coupon.discountValue} OFF`}
                          {validation.coupon.discountType === "free_item" && `FREE ${validation.coupon.freeItemName?.toUpperCase()}`}
                        </p>
                      </div>
                      
                      {validation.valid && (
                        <Button 
                          size="lg" 
                          className="w-full h-14 text-lg font-bold"
                          onClick={handleRedeem}
                          disabled={redeemMutation.isPending}
                        >
                          {redeemMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                          Redeem Coupon Now
                        </Button>
                      )}
                    </div>
                  )}
                  {!validation.coupon && (
                    <div className="text-center py-6 text-muted-foreground">
                      No coupon details available. The code might be invalid.
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-destructive flex flex-col items-center">
                  <XCircle className="h-10 w-10 mb-4" />
                  <h3 className="text-lg font-bold">Verification Failed</h3>
                  <p>Could not verify the coupon code.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
