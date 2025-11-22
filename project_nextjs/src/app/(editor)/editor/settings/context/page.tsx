"use client";

import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { DUMMY_SECTIONS, DUMMY_CATEGORIES } from "@/features/editor/settings-dummy-data";
import { USE_DUMMY } from "@/lib/dummy";

export default function SettingsContextPage() {
  return (
    <div style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      backgroundColor: "#eaedee",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}>
      {/* Page Header - OJS 3.3 Style with Safe Area */}
      <div style={{
        backgroundColor: "#ffffff",
        borderBottom: "2px solid #e5e5e5",
        padding: "1.5rem 0",
      }}>
        <div style={{
          padding: "0 1.5rem",
        }}>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            margin: 0,
            padding: "0.5rem 0",
            lineHeight: "2.25rem",
            color: "#002C40",
          }}>
            Settings • Context
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Configure basic details about the journal, including title, description, masthead, contact information, and sections.
          </p>
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "0 1.5rem",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}>
        <PkpTabs defaultValue="masthead">
          {/* Main Tabs */}
          <div style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0",
            display: "flex",
            marginBottom: "1.5rem",
          }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="masthead">Masthead</PkpTabsTrigger>
              <PkpTabsTrigger value="contact">Contact</PkpTabsTrigger>
              <PkpTabsTrigger value="sections">Sections</PkpTabsTrigger>
              <PkpTabsTrigger value="categories">Categories</PkpTabsTrigger>
            </PkpTabsList>
          </div>

          {/* Masthead Tab */}
          <PkpTabsContent value="masthead" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Masthead
              </h2>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#002C40",
                  }}>
                    Journal Title
                  </label>
                  <PkpInput
                    type="text"
                    placeholder="Enter journal title"
                    style={{ width: "100%" }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#002C40",
                  }}>
                    Journal Description
                  </label>
                  <PkpTextarea
                    rows={5}
                    placeholder="Enter journal description"
                    style={{ width: "100%" }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#002C40",
                  }}>
                    Masthead
                  </label>
                  <PkpTextarea
                    rows={10}
                    placeholder="Enter masthead information (editorial team, board members, etc.)"
                    style={{ width: "100%" }}
                  />
                </div>
                <PkpButton variant="primary">
                  Save
                </PkpButton>
              </div>
            </div>
          </PkpTabsContent>

          {/* Contact Tab */}
          <PkpTabsContent value="contact" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Contact Information
              </h2>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#002C40",
                  }}>
                    Contact Email
                  </label>
                  <PkpInput
                    type="email"
                    placeholder="contact@journal.example"
                    style={{ width: "100%" }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#002C40",
                  }}>
                    Contact Name
                  </label>
                  <PkpInput
                    type="text"
                    placeholder="Enter contact name"
                    style={{ width: "100%" }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#002C40",
                  }}>
                    Mailing Address
                  </label>
                  <PkpTextarea
                    rows={5}
                    placeholder="Enter mailing address"
                    style={{ width: "100%" }}
                  />
                </div>
                <PkpButton variant="primary">
                  Save
                </PkpButton>
              </div>
            </div>
          </PkpTabsContent>

          {/* Sections Tab */}
          <PkpTabsContent value="sections" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Journal Sections
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                marginBottom: "1rem",
              }}>
                Sections allow you to publish submissions in different sections of the journal, such as Articles, Reviews, etc.
              </p>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <PkpButton variant="primary">
                    Add Section
                  </PkpButton>
                </div>
                <PkpTable>
                  <PkpTableHeader>
                    <PkpTableRow isHeader>
                      <PkpTableHead style={{ width: "60px" }}>ID</PkpTableHead>
                      <PkpTableHead>Section</PkpTableHead>
                      <PkpTableHead style={{ width: "120px" }}>Abbreviation</PkpTableHead>
                      <PkpTableHead style={{ width: "80px", textAlign: "center" }}>Enabled</PkpTableHead>
                      <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                    </PkpTableRow>
                  </PkpTableHeader>
                  <tbody>
                    {USE_DUMMY && DUMMY_SECTIONS.length > 0 ? (
                      DUMMY_SECTIONS.map((section) => (
                        <PkpTableRow key={section.id}>
                          <PkpTableCell style={{ width: "60px" }}>{section.id}</PkpTableCell>
                          <PkpTableCell>
                            <div style={{ fontWeight: 500 }}>{section.title}</div>
                            {section.policy && (
                              <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                {section.policy}
                              </div>
                            )}
                          </PkpTableCell>
                          <PkpTableCell style={{ width: "120px" }}>{section.abbreviation}</PkpTableCell>
                          <PkpTableCell style={{ width: "80px", textAlign: "center" }}>
                            <PkpCheckbox checked={section.enabled} readOnly />
                          </PkpTableCell>
                          <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                            <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                            <PkpButton variant="onclick" size="sm">Delete</PkpButton>
                          </PkpTableCell>
                        </PkpTableRow>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                          {USE_DUMMY ? "No sections found." : "Sections grid will be implemented here with add, edit, delete, enable/disable functionality."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </PkpTable>
              </div>
            </div>
          </PkpTabsContent>

          {/* Categories Tab */}
          <PkpTabsContent value="categories" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Categories
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                marginBottom: "1rem",
              }}>
                Categories can be used to organize and filter content across the journal.
              </p>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <PkpButton variant="primary">
                    Add Category
                  </PkpButton>
                </div>
                <PkpTable>
                  <PkpTableHeader>
                    <PkpTableRow isHeader>
                      <PkpTableHead style={{ width: "60px" }}>ID</PkpTableHead>
                      <PkpTableHead>Category</PkpTableHead>
                      <PkpTableHead>Path</PkpTableHead>
                      <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                    </PkpTableRow>
                  </PkpTableHeader>
                  <tbody>
                    {USE_DUMMY && DUMMY_CATEGORIES.length > 0 ? (
                      DUMMY_CATEGORIES.map((category) => (
                        <PkpTableRow key={category.id}>
                          <PkpTableCell style={{ width: "60px" }}>{category.id}</PkpTableCell>
                          <PkpTableCell>
                            <div style={{ fontWeight: 500 }}>{category.title}</div>
                            {category.description && (
                              <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                {category.description}
                              </div>
                            )}
                          </PkpTableCell>
                          <PkpTableCell>{category.path}</PkpTableCell>
                          <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                            <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                            <PkpButton variant="onclick" size="sm">Delete</PkpButton>
                          </PkpTableCell>
                        </PkpTableRow>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                          {USE_DUMMY ? "No categories found." : "Categories grid will be implemented here with add, edit, delete functionality."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </PkpTable>
              </div>
            </div>
          </PkpTabsContent>
        </PkpTabs>
      </div>
    </div>
  );
}

