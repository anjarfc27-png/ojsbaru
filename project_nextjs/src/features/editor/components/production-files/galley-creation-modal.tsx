"use client";

import { useState } from "react";
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
  onSubmit: (data: {
    submissionId: string;
    stage: SubmissionStage;
    label: string;
    locale: string;
    fileId?: string;
    remoteUrl?: string;
    submissionFileId?: string;
  }) => Promise<void>;
};

/**
 * Galley Creation Modal
 * Based on OJS PKP 3.3 galley creation form
 * Used for: Create new galley (PDF, HTML, EPUB, etc.)
 */
export function GalleyCreationModal({
  open,
  onClose,
  submissionId,
  stage,
  onSubmit,
}: Props) {
  const [label, setLabel] = useState("");
  const [locale, setLocale] = useState("en");
  const [type, setType] = useState<"file" | "remote">("file");
  const [fileId, setFileId] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!label.trim()) {
      setError("Label is required");
      return;
    }

    if (type === "file" && !fileId) {
      setError("Please select a file");
      return;
    }

    if (type === "remote" && !remoteUrl.trim()) {
      setError("Remote URL is required");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        submissionId,
        stage,
        label: label.trim(),
        locale,
        fileId: type === "file" ? fileId : undefined,
        remoteUrl: type === "remote" ? remoteUrl.trim() : undefined,
      });
      onClose();
      // Reset form
      setLabel("");
      setLocale("en");
      setType("file");
      setFileId("");
      setRemoteUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create galley");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setLabel("");
    setLocale("en");
    setType("file");
    setFileId("");
    setRemoteUrl("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Galley"
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
            placeholder="e.g., PDF, HTML, EPUB"
            required
            className="w-full"
          />
          <p className="text-xs text-[var(--muted)]">
            Label for this galley (e.g., PDF, HTML, EPUB).
          </p>
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
            {/* Add more locales as needed */}
          </select>
        </div>

        {/* Galley Type */}
        <div className="space-y-3">
          <Label>Galley Type</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="file"
                checked={type === "file"}
                onChange={() => setType("file")}
                className="h-4 w-4"
              />
              <span className="text-sm">Upload File</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="remote"
                checked={type === "remote"}
                onChange={() => setType("remote")}
                className="h-4 w-4"
              />
              <span className="text-sm">Remote URL</span>
            </label>
          </div>
        </div>

        {/* File Upload or Remote URL */}
        {type === "file" ? (
          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-sm text-[var(--muted)]">
                File selection will be implemented here
              </p>
              {/* TODO: Add file selection grid */}
              <Input
                type="file"
                id="file"
                onChange={(e) => {
                  // TODO: Handle file upload
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileId(`file-${Date.now()}`);
                  }
                }}
                className="mt-2"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="remoteUrl">Remote URL *</Label>
            <Input
              id="remoteUrl"
              name="remoteUrl"
              type="url"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://example.com/article.pdf"
              required
              className="w-full"
            />
            <p className="text-xs text-[var(--muted)]">
              Enter the full URL to the remote file.
            </p>
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
            disabled={isSubmitting || !label.trim() || (type === "file" && !fileId) || (type === "remote" && !remoteUrl.trim())}
          >
            Create Galley
          </Button>
        </div>
      </div>
    </Modal>
  );
}
