import { Trophy, Users, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminReferrals } from "@/hooks/useAdminReferrals";

export function ReferralRankingCard() {
  const { data: ranking = [], isLoading } = useAdminReferrals();

  if (isLoading) {
    return (
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-slate-700" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 w-full bg-slate-700" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const totalCompleted = ranking.reduce((sum, r) => sum + r.completedReferrals, 0);
  const totalPending = ranking.reduce((sum, r) => sum + r.pendingReferrals, 0);

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <CardTitle className="text-lg text-white">Ranking de Indicações</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              <CheckCircle className="mr-1 h-3 w-3" /> {totalCompleted} convertidas
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              <Clock className="mr-1 h-3 w-3" /> {totalPending} pendentes
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {ranking.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Users className="mb-2 h-8 w-8" />
            <p className="text-sm">Nenhuma indicação registrada ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((item, index) => (
              <div
                key={item.companyId}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    index === 0 ? "bg-amber-500/20 text-amber-400" :
                    index === 1 ? "bg-slate-400/20 text-slate-300" :
                    index === 2 ? "bg-orange-500/20 text-orange-400" :
                    "bg-slate-700 text-slate-400"
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-white">{item.companyName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-emerald-400 font-semibold">{item.completedReferrals} ✓</span>
                  {item.pendingReferrals > 0 && (
                    <span className="text-slate-400">{item.pendingReferrals} pendente{item.pendingReferrals > 1 ? "s" : ""}</span>
                  )}
                  <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                    {item.totalReferrals} total
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
