import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function BarberTermAcceptance() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barberName, setBarberName] = useState<string>("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function acceptTerm() {
      if (!token) {
        setError("Token inválido");
        setLoading(false);
        return;
      }

      // 1. Get barber info
      const { data: barberData, error: barberErr } = await supabase.rpc(
        "get_barber_by_term_token" as any,
        { p_token: token }
      );

      if (barberErr || !barberData) {
        setError("Link inválido, expirado ou termo já aceito.");
        setLoading(false);
        return;
      }

      setBarberName(barberData.name);

      // 2. Get active term
      const { data: termData, error: termErr } = await supabase
        .from("partnership_terms")
        .select("*")
        .eq("company_id", barberData.company_id)
        .eq("is_active", true)
        .single();

      if (termErr || !termData) {
        setError("Nenhum termo de parceria ativo encontrado.");
        setLoading(false);
        return;
      }

      // 3. Accept immediately
      const { data: success, error: acceptErr } = await supabase.rpc(
        "accept_barber_term" as any,
        {
          p_token: token,
          p_term_id: termData.id,
          p_content_snapshot: termData.content,
          p_commission_rate: barberData.commission_rate,
          p_ip: null,
          p_user_agent: navigator.userAgent,
        }
      );

      if (acceptErr) {
        setError(acceptErr.message || "Erro ao aceitar termo.");
        setLoading(false);
        return;
      }

      if (!success) {
        setError("Termo já foi aceito ou link inválido.");
        setLoading(false);
        return;
      }

      setAccepted(true);
      setLoading(false);
    }

    acceptTerm();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Processando aceite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">{error}</h2>
            <p className="text-muted-foreground">
              Entre em contato com o administrador da barbearia.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Termo Aceito com Sucesso!</h2>
            <p className="text-muted-foreground">
              Obrigado, <strong>{barberName}</strong>! Seu aceite foi
              registrado e sua agenda já está ativa.
            </p>
            <p className="text-xs text-muted-foreground">
              Data: {new Date().toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
