"use client";

import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";
import { DUMMY_USERS, DUMMY_ROLES } from "@/features/editor/settings-dummy-data";
import { USE_DUMMY } from "@/lib/dummy";

export default function SettingsAccessPage() {
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
            Settings • Access
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Manage users, roles, and site access options for the journal.
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
        <PkpTabs defaultValue="users">
          {/* Main Tabs */}
          <div style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0",
            display: "flex",
            marginBottom: "1.5rem",
          }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="users">Users</PkpTabsTrigger>
              <PkpTabsTrigger value="roles">Roles</PkpTabsTrigger>
              <PkpTabsTrigger value="siteAccess">Site Access</PkpTabsTrigger>
            </PkpTabsList>
          </div>

          {/* Users Tab */}
          <PkpTabsContent value="users" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Users
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                marginBottom: "1rem",
              }}>
                Manage users who have access to this journal. You can add new users, edit existing users, and assign roles.
              </p>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <PkpButton variant="primary">
                    Add User
                  </PkpButton>
                </div>
                <PkpTable>
                  <PkpTableHeader>
                    <PkpTableRow isHeader>
                      <PkpTableHead style={{ width: "60px" }}>ID</PkpTableHead>
                      <PkpTableHead>Name</PkpTableHead>
                      <PkpTableHead>Email</PkpTableHead>
                      <PkpTableHead>Roles</PkpTableHead>
                      <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                    </PkpTableRow>
                  </PkpTableHeader>
                  <tbody>
                    {USE_DUMMY && DUMMY_USERS.length > 0 ? (
                      DUMMY_USERS.map((user) => (
                        <PkpTableRow key={user.id}>
                          <PkpTableCell style={{ width: "60px" }}>{user.id}</PkpTableCell>
                          <PkpTableCell>
                            <div style={{ fontWeight: 500 }}>{user.name}</div>
                          </PkpTableCell>
                          <PkpTableCell>{user.email}</PkpTableCell>
                          <PkpTableCell>
                            {Array.isArray(user.roles) ? (
                              <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                                {user.roles.map((role, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      display: "inline-block",
                                      padding: "0.125rem 0.5rem",
                                      backgroundColor: "#f0f0f0",
                                      borderRadius: "0.125rem",
                                      fontSize: "0.75rem",
                                      color: "rgba(0, 0, 0, 0.84)",
                                    }}
                                  >
                                    {role}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.54)" }}>{user.roles}</span>
                            )}
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
                          {USE_DUMMY ? "No users found." : "Users grid will be implemented here with add, edit, delete, and role assignment functionality."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </PkpTable>
              </div>
            </div>
          </PkpTabsContent>

          {/* Roles Tab */}
          <PkpTabsContent value="roles" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Roles
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                marginBottom: "1rem",
              }}>
                Configure role permissions and user groups. Roles define what actions users can perform in the journal.
              </p>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <PkpButton variant="primary">
                    Add Role
                  </PkpButton>
                </div>
                <PkpTable>
                  <PkpTableHeader>
                    <PkpTableRow isHeader>
                      <PkpTableHead style={{ width: "60px" }}>ID</PkpTableHead>
                      <PkpTableHead>Role Name</PkpTableHead>
                      <PkpTableHead>Description</PkpTableHead>
                      <PkpTableHead style={{ width: "120px" }}>Users</PkpTableHead>
                      <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                    </PkpTableRow>
                  </PkpTableHeader>
                  <tbody>
                    {USE_DUMMY && DUMMY_ROLES.length > 0 ? (
                      DUMMY_ROLES.map((role) => (
                        <PkpTableRow key={role.id}>
                          <PkpTableCell style={{ width: "60px" }}>{role.id}</PkpTableCell>
                          <PkpTableCell>
                            <div style={{ fontWeight: 500 }}>{role.name}</div>
                          </PkpTableCell>
                          <PkpTableCell>
                            <div style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>{role.description}</div>
                          </PkpTableCell>
                          <PkpTableCell style={{ width: "120px" }}>
                            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{role.users}</span>
                            <span style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginLeft: "0.25rem" }}>users</span>
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
                          {USE_DUMMY ? "No roles found." : "Roles grid will be implemented here with add, edit, delete, and permission configuration functionality."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </PkpTable>
              </div>
            </div>
          </PkpTabsContent>

          {/* Site Access Tab */}
          <PkpTabsContent value="siteAccess" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Site Access Options
              </h2>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    color: "#002C40",
                  }}>
                    Registration Options
                  </h3>
                  <div style={{ marginBottom: "1rem" }}>
                    <PkpCheckbox
                      id="allowRegistrations"
                      label="Allow user self-registration"
                    />
                    <p style={{
                      fontSize: "0.75rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginTop: "0.5rem",
                      marginBottom: 0,
                    }}>
                      When enabled, users can register accounts themselves. When disabled, only administrators can create user accounts.
                    </p>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <PkpCheckbox
                      id="requireReviewerInterests"
                      label="Require reviewers to indicate their review interests"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    color: "#002C40",
                  }}>
                    Login Options
                  </h3>
                  <div style={{ marginBottom: "1rem" }}>
                    <PkpCheckbox
                      id="allowRememberMe"
                      label="Allow users to enable 'Remember Me' login option"
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <PkpCheckbox
                      id="sessionLifetime"
                      label="Session lifetime (in seconds)"
                    />
                    <PkpInput
                      type="number"
                      placeholder="3600"
                      style={{ width: "200px", marginTop: "0.5rem" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    color: "#002C40",
                  }}>
                    Security
                  </h3>
                  <div style={{ marginBottom: "1rem" }}>
                    <PkpCheckbox
                      id="forceSSL"
                      label="Force SSL connections"
                    />
                    <p style={{
                      fontSize: "0.75rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginTop: "0.5rem",
                      marginBottom: 0,
                    }}>
                      When enabled, all connections must use HTTPS.
                    </p>
                  </div>
                </div>

                <PkpButton variant="primary">
                  Save
                </PkpButton>
              </div>
            </div>
          </PkpTabsContent>
        </PkpTabs>
      </div>
    </div>
  );
}

