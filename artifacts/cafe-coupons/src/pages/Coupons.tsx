import { Layout } from "@/components/layout/Layout";
import { useListCoupons, getListCouponsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Coupons() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: coupons, isLoading } = useListCoupons(
    statusFilter !== "all" ? { status: statusFilter as any } : {},
    {
      query: {
        queryKey: getListCouponsQueryKey(statusFilter !== "all" ? { status: statusFilter as any } : {})
      }
    }
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">All Coupons</h1>
            <p className="text-muted-foreground mt-1">View and filter individual coupons across all batches.</p>
          </div>
          
          <div className="w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading || !coupons ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : coupons.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No coupons found matching your filter.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{coupon.displayTitle}</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {coupon.discountType.replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={coupon.status === "active" ? "default" : coupon.status === "used" ? "secondary" : "destructive"}
                          className={coupon.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {coupon.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(coupon.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {coupon.redeemedAt ? format(new Date(coupon.redeemedAt), "MMM d, yyyy HH:mm") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/coupon/${coupon.code}`} target="_blank">
                          <Button variant="ghost" size="icon" title="View Public Page">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
