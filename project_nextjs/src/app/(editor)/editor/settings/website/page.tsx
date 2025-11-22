"use client";

import { useState } from "react";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";
import { DUMMY_NAVIGATION_MENUS, DUMMY_NAVIGATION_MENU_ITEMS, DUMMY_PLUGINS } from "@/features/editor/settings-dummy-data";
import { USE_DUMMY } from "@/lib/dummy";

export default function WebsiteSettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance");
  const [activeAppearanceSubTab, setActiveAppearanceSubTab] = useState("theme");
  const [activeSetupSubTab, setActiveSetupSubTab] = useState("information");
  const [activePluginsSubTab, setActivePluginsSubTab] = useState("installedPlugins");

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
            Settings • Website
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Configure the appearance of and information on your reader-facing website, set up your site's languages and archiving settings, and install and enable plugins.
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
        <PkpTabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab}>
          {/* Main Tabs */}
          <div style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0",
            display: "flex",
            marginBottom: "1.5rem",
          }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="appearance">Appearance</PkpTabsTrigger>
              <PkpTabsTrigger value="setup">Setup</PkpTabsTrigger>
              <PkpTabsTrigger value="plugins">Plugins</PkpTabsTrigger>
            </PkpTabsList>
          </div>

          {/* Appearance Tab Content */}
          {activeTab === "appearance" && (
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              boxShadow: "none",
              borderRadius: 0,
              display: "flex",
              gap: 0,
              minHeight: "500px",
            }}>
              {/* Side Tabs List */}
              <div style={{
                width: "20rem",
                flexShrink: 0,
                borderRight: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem 0",
              }}>
                <button
                  onClick={() => setActiveAppearanceSubTab("theme")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeAppearanceSubTab === "theme" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeAppearanceSubTab === "theme" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeAppearanceSubTab === "theme" ? 600 : 400,
                  }}
                >
                  Theme
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab("appearance-setup")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeAppearanceSubTab === "appearance-setup" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeAppearanceSubTab === "appearance-setup" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeAppearanceSubTab === "appearance-setup" ? 600 : 400,
                  }}
                >
                  Setup
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab("advanced")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeAppearanceSubTab === "advanced" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeAppearanceSubTab === "advanced" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeAppearanceSubTab === "advanced" ? 600 : 400,
                  }}
                >
                  Advanced
                </button>
              </div>

              {/* Side Tabs Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {activeAppearanceSubTab === "theme" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Theme
                    </h2>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        marginBottom: "1rem",
                      }}>
                        Select a theme to change the overall design of your website. The look of the website will change but the content will remain the same.
                      </p>
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Active Theme
                        </label>
                        <PkpSelect style={{ width: "100%" }}>
                          <option value="default">Default Theme</option>
                          <option value="custom">Custom Theme</option>
                        </PkpSelect>
                      </div>
                      <PkpButton variant="primary">
                        Save
                      </PkpButton>
                    </div>
                  </div>
                )}

                {activeAppearanceSubTab === "appearance-setup" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Appearance Setup
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
                          Upload Logo
                        </label>
                        <PkpInput type="file" accept="image/*" style={{ width: "100%" }} />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          Upload a logo image to display at the top of your journal's website.
                        </p>
                      </div>
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Page Footer
                        </label>
                        <PkpTextarea
                          rows={5}
                          placeholder="Enter content to display in the page footer"
                          style={{ width: "100%" }}
                        />
                      </div>
                      <PkpButton variant="primary">
                        Save
                      </PkpButton>
                    </div>
                  </div>
                )}

                {activeAppearanceSubTab === "advanced" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Advanced Appearance
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
                          Upload Custom CSS
                        </label>
                        <PkpInput type="file" accept=".css" style={{ width: "100%" }} />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          Upload a custom CSS file to override default styles.
                        </p>
                      </div>
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Upload Favicon
                        </label>
                        <PkpInput type="file" accept="image/*" style={{ width: "100%" }} />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          Upload a favicon to display in browser tabs and bookmarks.
                        </p>
                      </div>
                      <PkpButton variant="primary">
                        Save
                      </PkpButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Setup Tab Content */}
          {activeTab === "setup" && (
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              boxShadow: "none",
              borderRadius: 0,
              display: "flex",
              gap: 0,
              minHeight: "500px",
            }}>
              {/* Side Tabs List */}
              <div style={{
                width: "20rem",
                flexShrink: 0,
                borderRight: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem 0",
              }}>
                <PkpTabsList style={{ flexDirection: "column", padding: 0, gap: 0 }}>
                  <PkpTabsTrigger 
                    value="information" 
                    style={{ justifyContent: "flex-start", borderRadius: 0, width: "100%" }} 
                    onClick={() => setActiveSetupSubTab("information")}
                  >
                    Information
                  </PkpTabsTrigger>
                  <PkpTabsTrigger 
                    value="languages" 
                    style={{ justifyContent: "flex-start", borderRadius: 0, width: "100%" }} 
                    onClick={() => setActiveSetupSubTab("languages")}
                  >
                    Languages
                  </PkpTabsTrigger>
                  <PkpTabsTrigger 
                    value="navigationMenus" 
                    style={{ justifyContent: "flex-start", borderRadius: 0, width: "100%" }} 
                    onClick={() => setActiveSetupSubTab("navigationMenus")}
                  >
                    Navigation Menus
                  </PkpTabsTrigger>
                  <PkpTabsTrigger 
                    value="announcements" 
                    style={{ justifyContent: "flex-start", borderRadius: 0, width: "100%" }} 
                    onClick={() => setActiveSetupSubTab("announcements")}
                  >
                    Announcements
                  </PkpTabsTrigger>
                  <PkpTabsTrigger 
                    value="lists" 
                    style={{ justifyContent: "flex-start", borderRadius: 0, width: "100%" }} 
                    onClick={() => setActiveSetupSubTab("lists")}
                  >
                    Lists
                  </PkpTabsTrigger>
                  <PkpTabsTrigger 
                    value="privacy" 
                    style={{ justifyContent: "flex-start", borderRadius: 0, width: "100%" }} 
                    onClick={() => setActiveSetupSubTab("privacy")}
                  >
                    Privacy
                  </PkpTabsTrigger>
                  <PkpTabsTrigger 
                    value="dateTime" 
                    style={{ justifyContent: "flex-start", borderRadius: 0, width: "100%" }} 
                    onClick={() => setActiveSetupSubTab("dateTime")}
                  >
                    Date/Time
                  </PkpTabsTrigger>
                </PkpTabsList>
              </div>

              {/* Side Tabs Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {activeSetupSubTab === "information" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Information
                    </h2>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        marginBottom: "1rem",
                      }}>
                        Add information about your journal that will appear as links on your sidebar if the Information Block is enabled under Sidebar Management.
                      </p>
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          About the Journal
                        </label>
                        <PkpTextarea
                          rows={5}
                          placeholder="Enter information about the journal"
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
                          Editorial Team
                        </label>
                        <PkpTextarea
                          rows={5}
                          placeholder="Enter information about the editorial team"
                          style={{ width: "100%" }}
                        />
                      </div>
                      <PkpButton variant="primary">
                        Save
                      </PkpButton>
                    </div>
                  </div>
                )}

                {activeSetupSubTab === "languages" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Languages
                    </h2>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        marginBottom: "1rem",
                      }}>
                        Languages that have been installed on your site by an Administrator can be enabled for the user interface (UI), forms, and submissions.
                      </p>
                      <div style={{ marginBottom: "1rem" }}>
                        <PkpCheckbox id="lang-en-ui" label="English - UI" />
                        <PkpCheckbox id="lang-en-forms" label="English - Forms" />
                        <PkpCheckbox id="lang-en-submissions" label="English - Submissions" />
                      </div>
                      <PkpButton variant="primary">
                        Save
                      </PkpButton>
                    </div>
                  </div>
                )}

                {activeSetupSubTab === "navigationMenus" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Navigation Menus
                    </h2>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginBottom: "1.5rem",
                    }}>
                      Edit the existing navigation menus on your website. You can add and remove items and re-order them. You can also create custom menu items that link to pages on your site or to another website or even add a new custom menu.
                    </p>

                    {/* Navigation Menus Grid */}
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                      marginBottom: "2rem",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#002C40",
                          margin: 0,
                        }}>
                          Navigation Menus
                        </h3>
                        <PkpButton variant="primary">
                          Add Menu
                        </PkpButton>
                      </div>
                      <PkpTable>
                        <PkpTableHeader>
                          <PkpTableRow isHeader>
                            <PkpTableHead style={{ width: "200px" }}>Menu Title</PkpTableHead>
                            <PkpTableHead>Area Name</PkpTableHead>
                            <PkpTableHead style={{ width: "100px" }}>Menu Items</PkpTableHead>
                            <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                          </PkpTableRow>
                        </PkpTableHeader>
                        <tbody>
                          {USE_DUMMY && DUMMY_NAVIGATION_MENUS.length > 0 ? (
                            DUMMY_NAVIGATION_MENUS.map((menu) => (
                              <PkpTableRow key={menu.id}>
                                <PkpTableCell>{menu.title}</PkpTableCell>
                                <PkpTableCell>{menu.areaName || "-"}</PkpTableCell>
                                <PkpTableCell style={{ width: "100px" }}>
                                  <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{menu.menuItems}</span>
                                  <span style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginLeft: "0.25rem" }}>items</span>
                                </PkpTableCell>
                                <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                  <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                                  <PkpButton variant="onclick" size="sm">Delete</PkpButton>
                                </PkpTableCell>
                              </PkpTableRow>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                {USE_DUMMY ? "No navigation menus found." : "Navigation menus grid will be implemented here with add, edit, delete, and reorder functionality."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </PkpTable>
                    </div>

                    {/* Navigation Menu Items Grid */}
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#002C40",
                          margin: 0,
                        }}>
                          Menu Items
                        </h3>
                        <PkpButton variant="primary">
                          Add Menu Item
                        </PkpButton>
                      </div>
                      <PkpTable>
                        <PkpTableHeader>
                          <PkpTableRow isHeader>
                            <PkpTableHead style={{ width: "60px" }}>Order</PkpTableHead>
                            <PkpTableHead>Title</PkpTableHead>
                            <PkpTableHead>Type</PkpTableHead>
                            <PkpTableHead>URL/Path</PkpTableHead>
                            <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                          </PkpTableRow>
                        </PkpTableHeader>
                        <tbody>
                          {USE_DUMMY && DUMMY_NAVIGATION_MENU_ITEMS.length > 0 ? (
                            DUMMY_NAVIGATION_MENU_ITEMS.map((item) => (
                              <PkpTableRow key={item.id}>
                                <PkpTableCell style={{ width: "60px" }}>{item.order}</PkpTableCell>
                                <PkpTableCell>
                                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                                </PkpTableCell>
                                <PkpTableCell>{item.type}</PkpTableCell>
                                <PkpTableCell>{item.path}</PkpTableCell>
                                <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                  <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                                  <PkpButton variant="onclick" size="sm">Delete</PkpButton>
                                </PkpTableCell>
                              </PkpTableRow>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                {USE_DUMMY ? "No menu items found." : "Menu items grid will be implemented here with add, edit, delete, and drag-and-drop reorder functionality."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </PkpTable>
                    </div>
                  </div>
                )}

                {activeSetupSubTab === "announcements" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Announcements
                    </h2>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      <div style={{ marginBottom: "1rem" }}>
                        <PkpCheckbox 
                          id="enableAnnouncements" 
                          label="Enable announcements on the journal website" 
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          When enabled, announcements can be displayed on the journal website.
                        </p>
                      </div>
                      <PkpButton variant="primary">
                        Save
                      </PkpButton>
                    </div>
                  </div>
                )}

                {activeSetupSubTab === "lists" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Lists
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
                          Items Per Page
                        </label>
                        <PkpInput type="number" defaultValue="25" style={{ width: "100%" }} />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          Set the default number of items to display per page in lists.
                        </p>
                      </div>
                      <PkpButton variant="primary">
                        Save
                      </PkpButton>
                    </div>
                  </div>
                )}

                {activeSetupSubTab === "privacy" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Privacy Statement
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
                          Privacy Statement
                        </label>
                        <PkpTextarea
                          rows={10}
                          placeholder="Enter privacy statement"
                          style={{ width: "100%" }}
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          This statement will be displayed on the journal website.
                        </p>
                      </div>
                      <PkpButton variant="primary">
                        Save
                      </PkpButton>
                    </div>
                  </div>
                )}

                {activeSetupSubTab === "dateTime" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Date/Time
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
                          Time Zone
                        </label>
                        <PkpSelect style={{ width: "100%" }}>
                          <option value="UTC">UTC</option>
                          <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                          <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                          <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                        </PkpSelect>
                      </div>
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Date Format
                        </label>
                        <PkpSelect style={{ width: "100%" }}>
                          <option value="Y-m-d">YYYY-MM-DD</option>
                          <option value="d/m/Y">DD/MM/YYYY</option>
                          <option value="m/d/Y">MM/DD/YYYY</option>
                        </PkpSelect>
                      </div>
                      <PkpButton variant="primary">
                        Save
                      </PkpButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plugins Tab Content */}
          {activeTab === "plugins" && (
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              boxShadow: "none",
              borderRadius: 0,
              display: "flex",
              gap: 0,
              minHeight: "500px",
            }}>
              {/* Side Tabs */}
              <div style={{
                width: "20rem",
                flexShrink: 0,
                borderRight: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem 0",
              }}>
                <button
                  onClick={() => setActivePluginsSubTab("installedPlugins")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activePluginsSubTab === "installedPlugins" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activePluginsSubTab === "installedPlugins" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activePluginsSubTab === "installedPlugins" ? 600 : 400,
                  }}
                >
                  Installed Plugins
                </button>
                <button
                  onClick={() => setActivePluginsSubTab("pluginGallery")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activePluginsSubTab === "pluginGallery" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activePluginsSubTab === "pluginGallery" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activePluginsSubTab === "pluginGallery" ? 600 : 400,
                  }}
                >
                  Plugin Gallery
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {/* Installed Plugins */}
                {activePluginsSubTab === "installedPlugins" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Installed Plugins
                    </h2>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginBottom: "1.5rem",
                    }}>
                      Plugins extend functionality of OJS and allow it to interact with external tools and services. Installed plugins can be enabled and configured here.
                    </p>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      {/* Plugin Categories */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="pluginCategory" style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Filter by Category
                        </label>
                        <PkpSelect id="pluginCategory" style={{ width: "300px" }}>
                          <option value="">All Categories</option>
                          <option value="generic">Generic</option>
                          <option value="blocks">Blocks</option>
                          <option value="gateways">Gateways</option>
                          <option value="importexport">Import/Export</option>
                          <option value="paymethod">Payment Methods</option>
                          <option value="pubIds">Publication Identifiers</option>
                          <option value="reports">Reports</option>
                          <option value="themes">Themes</option>
                        </PkpSelect>
                      </div>

                      {/* Plugins Grid Placeholder */}
                      <div style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ backgroundColor: "#f8f9fa" }}>
                            <tr>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Plugin
                              </th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Version
                              </th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Status
                              </th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {USE_DUMMY && DUMMY_PLUGINS.length > 0 ? (
                              DUMMY_PLUGINS.map((plugin) => (
                                <tr key={plugin.id}>
                                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e5e5" }}>
                                    <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>{plugin.name}</div>
                                    {plugin.description && (
                                      <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                        {plugin.description}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e5e5", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>
                                    {plugin.version}
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e5e5" }}>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        padding: "0.125rem 0.5rem",
                                        backgroundColor: plugin.status === "enabled" ? "#e8f5e9" : "#f5f5f5",
                                        color: plugin.status === "enabled" ? "#2e7d32" : "rgba(0, 0, 0, 0.54)",
                                        borderRadius: "0.125rem",
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {plugin.status === "enabled" ? "Enabled" : "Disabled"}
                                    </span>
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", textAlign: "center", borderBottom: "1px solid #e5e5e5" }}>
                                    <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Configure</PkpButton>
                                    <PkpButton variant="onclick" size="sm">
                                      {plugin.status === "enabled" ? "Disable" : "Enable"}
                                    </PkpButton>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                  {USE_DUMMY ? "No plugins found." : "Plugins grid will be implemented here with enable/disable and configure functionality."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plugin Gallery */}
                {activePluginsSubTab === "pluginGallery" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Plugin Gallery
                    </h2>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginBottom: "1.5rem",
                    }}>
                      Browse and install additional plugins from the Plugin Gallery.
                    </p>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      {/* Search */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <PkpInput
                          type="search"
                          placeholder="Search plugins..."
                          style={{ width: "100%", maxWidth: "400px" }}
                        />
                      </div>

                      {/* Plugin Gallery Grid Placeholder */}
                      <div style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ backgroundColor: "#f8f9fa" }}>
                            <tr>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Plugin
                              </th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Description
                              </th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {USE_DUMMY && DUMMY_PLUGINS.length > 0 ? (
                              DUMMY_PLUGINS.map((plugin) => (
                                <tr key={plugin.id}>
                                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e5e5" }}>
                                    <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>{plugin.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                      Version: {plugin.version} • Category: {plugin.category}
                                    </div>
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e5e5", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>
                                    {plugin.description}
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", textAlign: "center", borderBottom: "1px solid #e5e5e5" }}>
                                    <PkpButton variant="primary" size="sm">Install</PkpButton>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                  {USE_DUMMY ? "No plugins available." : "Plugin gallery grid will be implemented here with browse and install functionality."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </PkpTabs>
      </div>
    </div>
  );
}
