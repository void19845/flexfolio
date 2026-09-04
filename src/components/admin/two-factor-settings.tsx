"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  startMfaEnrollment,
  confirmMfaEnrollment,
  cancelMfaEnrollment,
  type MfaFactorSummary,
} from "@/actions/mfa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EnrollmentStep =
  | { stage: "idle" }
  | { stage: "enrolling"; factorId: string; qrCode: string; secret: string };

export function TwoFactorSettings({ factors }: { factors: MfaFactorSummary[] }) {
  const [step, setStep] = useState<EnrollmentStep>({ stage: "idle" });
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const isEnabled = factors.length > 0;

  function handleStartEnrollment() {
    startTransition(async () => {
      const result = await startMfaEnrollment();
      if (result.error !== null) {
        toast.error(result.error);
        return;
      }
      setCode("");
      setStep({
        stage: "enrolling",
        factorId: result.factorId,
        qrCode: result.qrCode,
        secret: result.secret,
      });
    });
  }

  function handleCancelEnrollment(factorId: string) {
    startTransition(async () => {
      const { error } = await cancelMfaEnrollment(factorId);
      if (error) toast.error(error);
      setStep({ stage: "idle" });
    });
  }

  function handleConfirm(factorId: string) {
    startTransition(async () => {
      const { error } = await confirmMfaEnrollment(factorId, code);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Double authentification activée.");
      setStep({ stage: "idle" });
    });
  }

  function handleDisable(factorId: string) {
    startTransition(async () => {
      const { error } = await cancelMfaEnrollment(factorId);
      if (error) toast.error(error);
      else toast.success("Double authentification désactivée.");
    });
  }

  if (step.stage === "enrolling") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brand-ink-muted">
          Scanne ce QR code avec ton application d&apos;authentification (Google
          Authenticator, Authy...), ou entre la clé manuellement.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG data URI from Supabase, next/image doesn't help here */}
        <img
          src={step.qrCode}
          alt="QR code d'activation de la double authentification"
          className="h-40 w-40 self-start border border-border bg-white p-2"
        />
        <p className="break-all text-xs text-brand-ink-muted">
          Clé manuelle : <span className="font-mono">{step.secret}</span>
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mfa-code">Code de vérification</Label>
          <Input
            id="mfa-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            className="max-w-[10rem]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={pending || code.length !== 6}
            onClick={() => handleConfirm(step.factorId)}
          >
            {pending ? "Vérification..." : "Confirmer"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => handleCancelEnrollment(step.factorId)}
          >
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-brand-ink-muted">
        {isEnabled
          ? "La double authentification est activée sur ce compte."
          : "La double authentification n'est pas activée sur ce compte."}
      </p>
      {isEnabled ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => handleDisable(factors[0].id)}
          className="self-start"
        >
          Désactiver la 2FA
        </Button>
      ) : (
        <Button
          type="button"
          disabled={pending}
          onClick={handleStartEnrollment}
          className="self-start"
        >
          {pending ? "Chargement..." : "Activer la 2FA"}
        </Button>
      )}
    </div>
  );
}
