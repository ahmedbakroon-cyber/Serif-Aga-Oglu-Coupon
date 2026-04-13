import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, Layers, CheckCircle2, XCircle, TrendingUp, Clock, PlusCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity();

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Here's how your coupon campaigns are performing.</p>
        </div>

        {loadingSummary || !summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card shadow-sm border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Batches</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.totalBatches}</div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Coupons</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.totalCoupons}</div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Redemption Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{summary.redemptionRate.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Coupons</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.activeCoupons}</div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Used Coupons</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.usedCoupons}</div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expired Coupons</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.expiredCoupons}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-serif font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              {loadingActivity || !activity ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No recent activity found.
                </div>
              ) : (
                <div className="divide-y border-border">
                  {activity.map((item) => (
                    <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                      <div className="mt-1">
                        {item.type === "created" && <PlusCircle className="h-5 w-5 text-blue-500" />}
                        {item.type === "redeemed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {item.type === "expired" && <XCircle className="h-5 w-5 text-destructive" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          {item.type === "created" && <span>Created batch <strong>{item.batchTitle}</strong></span>}
                          {item.type === "redeemed" && <span>Redeemed coupon <strong>{item.couponCode}</strong> from {item.batchTitle}</span>}
                          {item.type === "expired" && <span>Coupon <strong>{item.couponCode}</strong> expired</span>}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
