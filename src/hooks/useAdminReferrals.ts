import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReferralRanking {
  companyId: string;
  companyName: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
}

export function useAdminReferrals() {
  return useQuery({
    queryKey: ["admin-referrals-ranking"],
    queryFn: async (): Promise<ReferralRanking[]> => {
      // Get all referrals
      const { data: referrals, error: refError } = await supabase
        .from("referrals")
        .select("referrer_company_id, status");

      if (refError) throw refError;

      // Get all companies for names
      const { data: companies, error: compError } = await supabase
        .from("companies")
        .select("id, name");

      if (compError) throw compError;

      const companyMap = new Map(companies?.map(c => [c.id, c.name]) || []);

      // Aggregate by referrer
      const map = new Map<string, { total: number; completed: number }>();
      referrals?.forEach(r => {
        const existing = map.get(r.referrer_company_id) || { total: 0, completed: 0 };
        existing.total++;
        if (r.status === "completed") existing.completed++;
        map.set(r.referrer_company_id, existing);
      });

      const ranking: ReferralRanking[] = Array.from(map.entries())
        .map(([companyId, stats]) => ({
          companyId,
          companyName: companyMap.get(companyId) || "Desconhecido",
          totalReferrals: stats.total,
          completedReferrals: stats.completed,
          pendingReferrals: stats.total - stats.completed,
        }))
        .sort((a, b) => b.completedReferrals - a.completedReferrals || b.totalReferrals - a.totalReferrals);

      return ranking;
    },
  });
}
