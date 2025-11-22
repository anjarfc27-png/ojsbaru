"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { Modal } from "@/components/ui/modal";
import type { SubmissionStage } from "../../types";
import type { Galley } from "./galley-grid";

type Props = {
  open: boolean;
  onClose: () => void;
  submissionId: string;
  stage: SubmissionStage;
  galley: Galley;
  onSubmit: (data: {
    galleyId: string;
    label: string;
    locale: string;
    isApproved: boolean;
    fileId?: string;
    remoteUrl?: string;
  }) => Promise<void>;
};

/**
 * Galley Editor
 * Based on OJS PKP 3.3 galley edit form
 * Used for: Edit galley metadata
 */
export function GalleyEditor({
  open,
  onClose,
  submissionId,
  stage,
  galley,
  onSubmit,
}: Props) {
  const [label, setLabel] = useState(galley.label);
  const [locale, setLocale] = useState(galley.locale);
  const [isApproved, setIsApproved] = useState(galley.isApproved);
  const [fileId, setFileId] = useState(galley.fileId || "");
  const [remoteUrl, setRemoteUrl] = useState(galley.remoteUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when galley changes
  useEffect(() => {
    if (open && galley) {
      setLabel(galley.label);
      setLocale(galley.locale);
      setIsApproved(galley.isApproved);
      setFileId(galley.fileId || "");
      setRemoteUrl(galley.remoteUrl || "");
    }
  }, [open, galley]);

  const handleSubmit = async () => {
    if (!label.trim()) {
      setError("Label is required");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        galleyId: galley.id,
        label: label.trim(),
        locale,
        isApproved,
        fileId: fileId || undefined,
        remoteUrl: remoteUrl.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update galley");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Galley"
      widthClassName="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Galley Label */}
        <div className="space-y-2">
          <Label htmlFor="label">Galley Label *</Label>
          <Input
            id="label"
            name="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="w-full"
          />
        </div>

        {/* Locale */}
        <div className="space-y-2">
          <Label htmlFor="locale">Locale</Label>
          <select
            id="locale"
            name="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="en">English</option>
            <option value="id">Indonesian</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        {/* Approval Status */}
        <div className="space-y-2">
          <Label>Approval Status</Label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isApproved}
              onChange={(e) => setIsApproved(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Approved</span>
          </label>
        </div>

        {/* File or Remote URL */}
        {galley.remoteUrl ? (
          <div className="space-y-2">
            <Label htmlFor="remoteUrl">Remote URL</Label>
            <Input
              id="remoteUrl"
              name="remoteUrl"
              type="url"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              className="w-full"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label>File</Label>
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-sm text-[var(--muted)]">
                File: {fileId || "No file assigned"}
              </p>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileId(`file-${Date.now()}`);
                  }
                }}
                className="mt-2"
              />
            </div>
          </div>
        )}

        {error && (
          <FormMessage tone="error">{error}</FormMessage>
        )}

        {/* Form Footer */}
        <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !label.trim()}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
