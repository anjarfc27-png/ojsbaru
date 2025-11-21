"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Dummy plugin gallery data
const GALLERY_PLUGINS = [
  {
    id: "citation-style-language",
    name: "Citation Style Language",
    description: "Support for Citation Style Language (CSL) citation formatting.",
    version: "1.0.0",
    author: "PKP",
    category: "generic",
    installed: false,
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Add Google Analytics tracking code to your site.",
    version: "1.2.0",
    author: "PKP",
    category: "generic",
    installed: true,
  },
  {
    id: "orcid-profile",
    name: "ORCID Profile",
    description: "Allow users to connect their ORCID profile.",
    version: "2.1.0",
    author: "PKP",
    category: "generic",
    installed: false,
  },
  {
    id: "custom-block-manager",
    name: "Custom Block Manager",
    description: "Manage custom content blocks in the sidebar.",
    version: "1.5.0",
    author: "PKP",
    category: "generic",
    installed: true,
  },
  {
    id: "doaj-export",
    name: "DOAJ Export",
    description: "Export metadata to DOAJ format.",
    version: "1.0.0",
    author: "PKP",
    category: "importexport",
    installed: false,
  },
  {
    id: "crossref-xml",
    name: "Crossref XML Export",
    description: "Export metadata to Crossref XML format.",
    version: "2.0.0",
    author: "PKP",
    category: "importexport",
    installed: true,
  },
];

type Plugin = (typeof GALLERY_PLUGINS)[0];

export default function PluginGalleryPage() {
  const [plugins, setPlugins] = useState(GALLERY_PLUGINS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(plugins.map((p) => p.category)))];

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (plugin: Plugin) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === plugin.id ? { ...p, installed: true } : p))
    );
    toast.success(`Plugin "${plugin.name}" installed successfully`);
  };

  const handleUninstall = (plugin: Plugin) => {
    if (confirm(`Are you sure you want to uninstall "${plugin.name}"?`)) {
      setPlugins((prev) =>
        prev.map((p) => (p.id === plugin.id ? { ...p, installed: false } : p))
      );
      toast.success(`Plugin "${plugin.name}" uninstalled successfully`);
    }
  };

  return (
    <div className="space-y-6" style={{ padding: "1.5rem 0" }}>
      <header
        className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4"
        style={{
          padding: "1rem 1.5rem",
          backgroundColor: "#f9fafb",
        }}
      >
        <h2
          className="text-base font-semibold text-gray-900"
          style={{
            fontSize: "1rem",
            fontWeight: "600",
          }}
        >
          Plugin Gallery
        </h2>
      </header>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search plugins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-11 rounded-md border border-gray-300 bg-white px-3 text-gray-900 shadow-inner focus-visible:border-[#006798] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006798]/20"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Plugin Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlugins.map((plugin) => (
          <Card
            key={plugin.id}
            className="p-4 flex flex-col justify-between"
            style={{
              padding: "1rem",
            }}
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900" style={{ fontSize: "1rem", fontWeight: "600" }}>
                  {plugin.name}
                </h3>
                {plugin.installed && (
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded" style={{ fontSize: "0.75rem" }}>
                    Installed
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3" style={{ fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                {plugin.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500" style={{ fontSize: "0.75rem" }}>
                <span>v{plugin.version}</span>
                <span>By {plugin.author}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {plugin.installed ? (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleUninstall(plugin)}
                  className="flex-1"
                >
                  Uninstall
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleInstall(plugin)}
                  className="flex-1"
                >
                  Install
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No plugins found matching your search.</p>
        </div>
      )}
    </div>
  );
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    all: "All Categories",
    generic: "Generic",
    importexport: "Import/Export",
    metadata: "Metadata",
    reports: "Reports & Tools",
  };
  return labels[category] ?? category;
}



