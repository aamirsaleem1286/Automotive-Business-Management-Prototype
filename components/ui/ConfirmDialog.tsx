"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  tone = "danger",
  requireText,
  loading,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  requireText?: string;
  loading?: boolean;
  children?: ReactNode;
}) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  const ready =
    !requireText || typed.trim().toUpperCase() === requireText.toUpperCase();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            disabled={!ready}
          >
            {tone === "danger" ? (
              <Trash2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg border",
            tone === "danger"
              ? "border-accent/25 bg-accent/10 text-accent"
              : "border-amber/25 bg-amber/10 text-amber"
          )}
        >
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          {children}
          {requireText ? (
            <div className="mt-4">
              <label
                htmlFor="confirm-text"
                className="label mb-0"
              >
                Type{" "}
                <span className="font-mono text-[11px] text-ink">{requireText}</span>{" "}
                to confirm
              </label>
              <input
                id="confirm-text"
                className="input mt-2"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder={requireText}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
