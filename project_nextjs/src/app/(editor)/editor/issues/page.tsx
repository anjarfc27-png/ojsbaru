'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const dummyIssues = [
  {
    id: "1",
    volume: "Vol. 15",
    number: "No. 2", 
    year: "2024",
    title: "Jurnal Teknologi Informasi - December 2024",
    status: "published",
    articlesCount: 12,
    publishedAt: "2024-12-01",
    coverImage: null
  },
  {
    id: "2", 
    volume: "Vol. 15",
    number: "No. 1",
    year: "2024", 
    title: "Jurnal Teknologi Informasi - June 2024",
    status: "published",
    articlesCount: 15,
    publishedAt: "2024-06-15",
    coverImage: null
  },
  {
    id: "3",
    volume: "Vol. 14",
    number: "No. 2",
    year: "2023", 
    title: "Jurnal Teknologi Informasi - December 2023",
    status: "published",
    articlesCount: 10,
    publishedAt: "2023-12-10",
    coverImage: null
  },
  {
    id: "4",
    volume: "Vol. 16",
    number: "No. 1",
    year: "2025",
    title: "Jurnal Teknologi Informasi - June 2025",
    status: "scheduled",
    articlesCount: 8,
    scheduledFor: "2025-06-01",
    coverImage: null
  }
];

export default function IssuesPage() {
  return (
    <div style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      backgroundColor: "#eaedee",
      padding: 0,
      margin: 0,
    }}>
      {/* Header - OJS 3.3 Style with Safe Area */}
      <div style={{
        backgroundColor: "#ffffff",
        borderBottom: "2px solid #e5e5e5",
        padding: "1.5rem 0", // Safe padding - horizontal di-handle parent
      }}>
        <div style={{
          padding: "0 1.5rem", // Safe padding horizontal
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}>
            <div>
              <h1 style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                margin: 0,
                padding: "0.5rem 0",
                lineHeight: "2.25rem",
                color: "#002C40",
              }}>
                Issues
              </h1>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                marginTop: "0.5rem",
                marginBottom: 0,
              }}>
                Kelola terbitan (volume, number, year, cover).
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create Issue
            </Button>
          </div>
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "1.5rem", // Safe area padding
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}>
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Back Issues</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dummyIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <Link href={`/editor/issues/${issue.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {issue.title}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">
                          {issue.volume} • {issue.number} • {issue.year}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={issue.status === 'published' ? 'success' : 'warning'}
                        className="text-xs"
                      >
                        {issue.status === 'published' ? 'Published' : 'Scheduled'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {issue.articlesCount} articles
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {issue.status === 'published' ? issue.publishedAt : issue.scheduledFor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">Edit</button>
                        <button className="text-blue-600 hover:text-blue-800">Preview</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}