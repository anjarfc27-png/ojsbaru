import { getSiteNavigation, updateSiteNavigationAction } from "../../actions";

export default async function SiteSetupNavigationPage() {
  const initial = await getSiteNavigation();
  
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
          Navigation
        </h2>
      </header>
      
      <form action={updateSiteNavigationAction} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label
            htmlFor="primary"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            Primary Navigation
          </label>
          <textarea
            id="primary"
            name="primary"
            rows={3}
            defaultValue={initial.primary.join(", ")}
            style={{
              width: '100%',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.75rem",
            color: '#666',
            margin: 0
          }}>
            Comma-separated list of primary navigation menu items.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label
            htmlFor="user"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            User Navigation
          </label>
          <textarea
            id="user"
            name="user"
            rows={3}
            defaultValue={initial.user.join(", ")}
            style={{
              width: '100%',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.75rem",
            color: '#666',
            margin: 0
          }}>
            Comma-separated list of user navigation menu items.
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

              color: '#002C40'
            }}
          >
            Primary Navigation
          </label>
          <textarea
            id="primary"
            name="primary"
            rows={3}
            defaultValue={initial.primary.join(", ")}
            style={{
              width: '100%',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.75rem",
            color: '#666',
            margin: 0
          }}>
            Comma-separated list of primary navigation menu items.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label
            htmlFor="user"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            User Navigation
          </label>
          <textarea
            id="user"
            name="user"
            rows={3}
            defaultValue={initial.user.join(", ")}
            style={{
              width: '100%',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.75rem",
            color: '#666',
            margin: 0
          }}>
            Comma-separated list of user navigation menu items.
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

              color: '#002C40'
            }}
          >
            Primary Navigation
          </label>
          <textarea
            id="primary"
            name="primary"
            rows={3}
            defaultValue={initial.primary.join(", ")}
            style={{
              width: '100%',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.75rem",
            color: '#666',
            margin: 0
          }}>
            Comma-separated list of primary navigation menu items.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label
            htmlFor="user"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            User Navigation
          </label>
          <textarea
            id="user"
            name="user"
            rows={3}
            defaultValue={initial.user.join(", ")}
            style={{
              width: '100%',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.75rem",
            color: '#666',
            margin: 0
          }}>
            Comma-separated list of user navigation menu items.
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

              color: '#002C40'
            }}
          >
            Primary Navigation
          </label>
          <textarea
            id="primary"
            name="primary"
            rows={3}
            defaultValue={initial.primary.join(", ")}
            style={{
              width: '100%',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.75rem",
            color: '#666',
            margin: 0
          }}>
            Comma-separated list of primary navigation menu items.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <label
            htmlFor="user"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: '#002C40'
            }}
          >
            User Navigation
          </label>
          <textarea
            id="user"
            name="user"
            rows={3}
            defaultValue={initial.user.join(", ")}
            style={{
              width: '100%',
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{
            fontSize: "0.75rem",
            color: '#666',
            margin: 0
          }}>
            Comma-separated list of user navigation menu items.
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
