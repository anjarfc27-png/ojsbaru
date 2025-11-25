"use client";

import Link from "next/link";
import { Search, Filter, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmissionSummary } from "@/features/editor/types";

type Props = {
  submissions: SubmissionSummary[];
};

export function SubmissionsClient({ submissions: initialSubmissions }: Props) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      published: { variant: "default", label: "Published" },
      declined: { variant: "destructive", label: "Declined" },
      accepted: { variant: "default", label: "Accepted" },
      submitted: { variant: "secondary", label: "Submitted" },
      in_review: { variant: "outline", label: "In Review" },
    };

    const config = variants[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStageBadge = (stage: string) => {
    const stageLabels: Record<string, string> = {
      submission: "Submission",
      review: "Review",
      copyediting: "Copyediting",
      production: "Production",
    };
    return <Badge variant="outline">{stageLabels[stage] || stage}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all journal submissions</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search submissions..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="submission">Submission</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="copyediting">Copyediting</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            All Submissions ({initialSubmissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {initialSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No submissions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {initialSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight">
                        {submission.title || "Untitled Submission"}
                      </h4>
                      {submission.journalTitle && (
                        <p className="text-xs text-gray-500 mt-1">{submission.journalTitle}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Updated: {formatDate(submission.updatedAt || null)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusBadge(submission.status)}
                      {getStageBadge(submission.stage)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500">
                        Submitted: {formatDate(submission.submittedAt || null)}
                      </span>
                      {submission.assignees && submission.assignees.length > 0 && (
                        <span className="text-xs text-gray-500">
                          Assigned to: {submission.assignees.join(", ")}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/editor/submissions/${submission.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-3">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
