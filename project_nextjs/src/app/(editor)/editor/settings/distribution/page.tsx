"use client";

import { useState } from "react";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpRadio } from "@/components/ui/pkp-radio";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";

export default function SettingsDistributionPage() {
  const [activeTab, setActiveTab] = useState("license");

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
            Settings • Distribution
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Configure how users access, discover, and use your journal content.
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
        <PkpTabs defaultValue="license" value={activeTab} onValueChange={setActiveTab}>
          {/* Main Tabs */}
          <div style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0",
            display: "flex",
            marginBottom: "1.5rem",
          }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="license">License</PkpTabsTrigger>
              <PkpTabsTrigger value="indexing">Search Indexing</PkpTabsTrigger>
              <PkpTabsTrigger value="payments">Payments</PkpTabsTrigger>
            </PkpTabsList>
          </div>

          {/* License Tab Content */}
          <PkpTabsContent value="license" style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e5e5",
            padding: "1.5rem",
            boxShadow: "none",
            borderRadius: 0,
          }}>
            <h2 style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "#002C40",
            }}>
              License
            </h2>
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              marginBottom: "1.5rem",
            }}>
              Configure copyright and permissions on a journal level. You will also be able to enter copyright and permissions information on an article and issue level when you publish articles and issues.
            </p>

            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              padding: "1.5rem",
            }}>
              {/* Copyright Holder Type */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  Copyright Holder
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <PkpRadio
                    id="copyrightHolderType-author"
                    name="copyrightHolderType"
                    value="author"
                    label="Author"
                  />
                  <PkpRadio
                    id="copyrightHolderType-context"
                    name="copyrightHolderType"
                    value="context"
                    label="Journal"
                  />
                  <PkpRadio
                    id="copyrightHolderType-other"
                    name="copyrightHolderType"
                    value="other"
                    label="Other"
                  />
                </div>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Select who holds the copyright for published works.
                </p>
              </div>

              {/* Copyright Holder Other */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="copyrightHolderOther" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Copyright Holder (Other)
                </label>
                <PkpInput
                  id="copyrightHolderOther"
                  placeholder="Enter copyright holder name"
                  style={{ width: "100%" }}
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Enter the copyright holder name if you selected "Other".
                </p>
              </div>

              {/* License URL */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  License
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <PkpRadio
                    id="licenseUrl-cc-by"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by/4.0/"
                    label="CC-BY 4.0"
                  />
                  <PkpRadio
                    id="licenseUrl-cc-by-nc"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by-nc/4.0/"
                    label="CC-BY-NC 4.0"
                  />
                  <PkpRadio
                    id="licenseUrl-cc-by-nc-nd"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                    label="CC-BY-NC-ND 4.0"
                  />
                  <PkpRadio
                    id="licenseUrl-cc-by-nc-sa"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                    label="CC-BY-NC-SA 4.0"
                  />
                  <PkpRadio
                    id="licenseUrl-cc-by-nd"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by-nd/4.0/"
                    label="CC-BY-ND 4.0"
                  />
                  <PkpRadio
                    id="licenseUrl-cc-by-sa"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by-sa/4.0/"
                    label="CC-BY-SA 4.0"
                  />
                  <PkpRadio
                    id="licenseUrl-other"
                    name="licenseUrl"
                    value="other"
                    label="Other"
                  />
                </div>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Select a license that determines usage rights for published works.
                </p>
              </div>

              {/* License URL Other */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="licenseUrlOther" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  License URL (Other)
                </label>
                <PkpInput
                  id="licenseUrlOther"
                  type="url"
                  placeholder="https://example.com/license"
                  style={{ width: "100%" }}
                />
              </div>

              {/* Copyright Year Basis */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  Copyright Year Basis
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <PkpRadio
                    id="copyrightYearBasis-issue"
                    name="copyrightYearBasis"
                    value="issue"
                    label="Issue Publication Date"
                  />
                  <PkpRadio
                    id="copyrightYearBasis-submission"
                    name="copyrightYearBasis"
                    value="submission"
                    label="Submission Date"
                  />
                </div>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Select the date basis for the copyright year.
                </p>
              </div>

              {/* License Terms */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="licenseTerms" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  License Terms
                </label>
                <PkpTextarea
                  id="licenseTerms"
                  rows={8}
                  placeholder="Enter license terms and conditions"
                  style={{ width: "100%" }}
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Additional license terms and conditions that will be displayed with published works.
                </p>
              </div>

              <PkpButton variant="primary">
                Save
              </PkpButton>
            </div>
          </PkpTabsContent>

          {/* Indexing Tab Content */}
          <PkpTabsContent value="indexing" style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e5e5",
            padding: "1.5rem",
            boxShadow: "none",
            borderRadius: 0,
          }}>
            <h2 style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "#002C40",
            }}>
              Search Engine Indexing
            </h2>
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              marginBottom: "1.5rem",
            }}>
              Information here helps search engines and open indexes discover your content.
            </p>

            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              padding: "1.5rem",
            }}>
              {/* Search Description */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="searchDescription" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Search Description
                </label>
                <PkpTextarea
                  id="searchDescription"
                  rows={5}
                  placeholder="Enter a description for search engines"
                  style={{ width: "100%" }}
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  A description of your journal that search engines will index. This should be a concise summary of your journal's scope and content.
                </p>
              </div>

              {/* Custom Headers */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="customHeaders" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Custom Headers
                </label>
                <PkpTextarea
                  id="customHeaders"
                  rows={5}
                  placeholder="Enter custom HTML headers (e.g., meta tags)"
                  style={{ width: "100%", fontFamily: "monospace", fontSize: "0.8125rem" }}
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Custom HTML headers to include in the head section of your journal pages. This can include meta tags, verification codes, and other custom headers.
                </p>
              </div>

              {/* OAI-PMH Settings */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  OAI-PMH (Open Archives Initiative Protocol for Metadata Harvesting)
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <PkpCheckbox
                    id="enableOai"
                    label="Enable OAI-PMH"
                  />
                  <p style={{
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.54)",
                    marginTop: "0.5rem",
                    marginBottom: 0,
                  }}>
                    When enabled, your journal metadata will be discoverable through the OAI-PMH protocol. We encourage you to leave this enabled unless you are not using OJS to publish your content or otherwise do not want your metadata discoverable through the OAI protocol.
                  </p>
                </div>
              </div>

              {/* RSS Feed Settings */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  RSS Feeds
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <PkpCheckbox
                    id="enableRss"
                    label="Enable RSS feeds"
                  />
                  <p style={{
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.54)",
                    marginTop: "0.5rem",
                    marginBottom: 0,
                  }}>
                    When enabled, RSS feeds will be available for your journal content.
                  </p>
                </div>
              </div>

              {/* Sitemap Settings */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  Sitemap
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <PkpCheckbox
                    id="enableSitemap"
                    label="Enable sitemap"
                  />
                  <p style={{
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.54)",
                    marginTop: "0.5rem",
                    marginBottom: 0,
                  }}>
                    When enabled, a sitemap will be generated for search engines.
                  </p>
                </div>
              </div>

              <PkpButton variant="primary">
                Save
              </PkpButton>
            </div>
          </PkpTabsContent>

          {/* Payments Tab Content */}
          <PkpTabsContent value="payments" style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e5e5",
            padding: "1.5rem",
            boxShadow: "none",
            borderRadius: 0,
          }}>
            <h2 style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "#002C40",
            }}>
              Payments
            </h2>
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              marginBottom: "1.5rem",
            }}>
              Enable payments and select a payment method and currency if you are using subscriptions or author payment charges in your journal.
            </p>

            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              padding: "1.5rem",
            }}>
              {/* Enable Payments */}
              <div style={{ marginBottom: "1.5rem" }}>
                <PkpCheckbox
                  id="paymentsEnabled"
                  label="Enable payments"
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  When enabled, payment functionality will be available for subscriptions and author payment charges.
                </p>
              </div>

              {/* Currency */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="currency" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Currency
                </label>
                <PkpSelect id="currency" style={{ width: "100%" }}>
                  <option value="">Select currency</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="IDR">IDR - Indonesian Rupiah</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                </PkpSelect>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Select the currency for all payments in this journal.
                </p>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="paymentPluginName" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Payment Method
                </label>
                <PkpSelect id="paymentPluginName" style={{ width: "100%" }}>
                  <option value="">Select payment method</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Manual">Manual Payment</option>
                </PkpSelect>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Select the payment method plugin to use for processing payments.
                </p>
              </div>

              <PkpButton variant="primary">
                Save
              </PkpButton>
            </div>
          </PkpTabsContent>
        </PkpTabs>
      </div>
    </div>
  );
}
