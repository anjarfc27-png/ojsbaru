import { getSiteAppearanceSetup, updateSiteAppearanceSetupAction } from "../../actions";

// Dummy sidebar options for now
const SIDEBAR_OPTIONS = [
  { value: "user", label: "User Block" },
  { value: "language", label: "Language Toggle Block" },
  { value: "navigation", label: "Navigation Block" },
  { value: "announcements", label: "Announcements Block" },
];

export default async function AppearanceSetupPage() {
  const setup = await getSiteAppearanceSetup();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <header style={{
        padding: "1rem 1.5rem",
        backgroundColor: "#f9fafb",
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: "1rem",
          fontWeight: "600",
          color: '#002C40',
          margin: 0
        }}>
          Setup
        </h2>
      </header>

      <form action={updateSiteAppearanceSetupAction} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Logo Upload */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <label
            htmlFor="pageHeaderTitleImage"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Logo
          </label>
          <input
            id="pageHeaderTitleImage"
            name="pageHeaderTitleImage"
            type="text"
            defaultValue={setup.pageHeaderTitleImage || ""}
            placeholder="Enter logo URL or path (file upload will be implemented)"
            style={{
              maxWidth: '28rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            margin: 0
          }}>
            URL or path to the logo image to display in the page header. In OJS 3.3 this is a multilingual FieldUploadImage.
          </p>
          {setup.pageHeaderTitleImage && (
            <div style={{ marginTop: '0.5rem' }}>
              <img
                src={setup.pageHeaderTitleImage}
                alt="Logo preview"
                style={{
                  height: "5rem",
                  objectFit: 'contain'
                }}
              />
            </div>
          )}
        </div>

        {/* Page Footer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <label
            htmlFor="pageFooter"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Page footer
          </label>
          <textarea
            id="pageFooter"
            name="pageFooter"
            defaultValue={setup.pageFooter || ""}
            rows={6}
            placeholder="Enter footer content (HTML allowed)"
            style={{
              maxWidth: '42rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            margin: 0
          }}>
            Content to display in the page footer. HTML is allowed. In OJS 3.3 this is a multilingual FieldRichTextarea.
          </p>
        </div>

        {/* Sidebar Blocks */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <label style={{
            fontSize: "0.875rem",
            fontWeight: "500",
            color: '#002C40'
          }}>
            Sidebar
          </label>
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            marginBottom: "0.75rem",
            margin: 0
          }}>
            Select which blocks to display in the sidebar. In OJS 3.3 this is orderable (drag & drop).
          </p>
          <div style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.375rem",
            padding: "1rem",
            maxWidth: '28rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {SIDEBAR_OPTIONS.map((option) => (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: "0.5rem",
                  borderRadius: "0.25rem",
                  transition: "background-color 0.2s ease",
                }}
              >
                <input
                  type="checkbox"
                  name="sidebar"
                  value={option.value}
                  defaultChecked={setup.sidebar.includes(option.value)}
                  style={{
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  fontSize: "0.875rem",
                  color: '#002C40'
                }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Stylesheet */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <label
            htmlFor="styleSheet"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Custom stylesheet
          </label>
          <input
            id="styleSheet"
            name="styleSheet"
            type="text"
            defaultValue={setup.styleSheet || ""}
            placeholder="Enter stylesheet URL or path (file upload will be implemented)"
            style={{
              maxWidth: '28rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            margin: 0
          }}>
            URL or path to a custom CSS file to override default styles. In OJS 3.3 this is a FieldUpload that accepts .css files only.
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="submit"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#006798',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

                  value={option.value}
                  defaultChecked={setup.sidebar.includes(option.value)}
                  style={{
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  fontSize: "0.875rem",
                  color: '#002C40'
                }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Stylesheet */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <label
            htmlFor="styleSheet"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Custom stylesheet
          </label>
          <input
            id="styleSheet"
            name="styleSheet"
            type="text"
            defaultValue={setup.styleSheet || ""}
            placeholder="Enter stylesheet URL or path (file upload will be implemented)"
            style={{
              maxWidth: '28rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            margin: 0
          }}>
            URL or path to a custom CSS file to override default styles. In OJS 3.3 this is a FieldUpload that accepts .css files only.
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="submit"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#006798',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

                  value={option.value}
                  defaultChecked={setup.sidebar.includes(option.value)}
                  style={{
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  fontSize: "0.875rem",
                  color: '#002C40'
                }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Stylesheet */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <label
            htmlFor="styleSheet"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Custom stylesheet
          </label>
          <input
            id="styleSheet"
            name="styleSheet"
            type="text"
            defaultValue={setup.styleSheet || ""}
            placeholder="Enter stylesheet URL or path (file upload will be implemented)"
            style={{
              maxWidth: '28rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            margin: 0
          }}>
            URL or path to a custom CSS file to override default styles. In OJS 3.3 this is a FieldUpload that accepts .css files only.
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="submit"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#006798',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

                  value={option.value}
                  defaultChecked={setup.sidebar.includes(option.value)}
                  style={{
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  fontSize: "0.875rem",
                  color: '#002C40'
                }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Stylesheet */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <label
            htmlFor="styleSheet"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Custom stylesheet
          </label>
          <input
            id="styleSheet"
            name="styleSheet"
            type="text"
            defaultValue={setup.styleSheet || ""}
            placeholder="Enter stylesheet URL or path (file upload will be implemented)"
            style={{
              maxWidth: '28rem',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
          />
          <p style={{
            fontSize: "0.875rem",
            color: '#666',
            margin: 0
          }}>
            URL or path to a custom CSS file to override default styles. In OJS 3.3 this is a FieldUpload that accepts .css files only.
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="submit"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#006798',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
