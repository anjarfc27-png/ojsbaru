import Link from "next/link";
import { JournalEditForm } from "@/features/journals/components/journal-edit-form";
import type { HostedJournal } from "@/features/journals/types";

const blankJournal: HostedJournal = {
  id: "new",
  name: "",
  path: "",
  description: "",
  isPublic: true,
};

export default function CreateJournalPage() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* OJS PKP 3.3 Style Header */}
      <div style={{ 
        borderBottom: '2px solid #e5e5e5',
        paddingBottom: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '0.5rem' }}>
          <Link 
            href="/admin" 
            style={{
              color: '#006798',
              textDecoration: 'underline',
              fontSize: '0.875rem'
            }}
          >
            Site Administration
          </Link>
          <span style={{ 
            color: '#6B7280', 
            margin: '0 0.5rem',
            fontSize: '0.875rem'
          }}>»</span>
          <Link 
            href="/admin/site-management/hosted-journals" 
            style={{
              color: '#006798',
              textDecoration: 'underline',
              fontSize: '0.875rem'
            }}
          >
            Hosted Journals
          </Link>
          <span style={{ 
            color: '#6B7280', 
            margin: '0 0.5rem',
            fontSize: '0.875rem'
          }}>»</span>
          <span style={{ 
            color: '#111827',
            fontSize: '0.875rem'
          }}>
            Create Journal
          </span>
        </div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          Create Journal
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Isi formulir berikut untuk membuat jurnal baru dalam instalasi OJS Anda.
        </p>
      </div>

      {/* Form Container */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <JournalEditForm journal={blankJournal} mode="create" />
      </div>
    </div>
  );
}


            style={{
              color: '#006798',
              textDecoration: 'underline',
              fontSize: '0.875rem'
            }}
          >
            Hosted Journals
          </Link>
          <span style={{ 
            color: '#6B7280', 
            margin: '0 0.5rem',
            fontSize: '0.875rem'
          }}>»</span>
          <span style={{ 
            color: '#111827',
            fontSize: '0.875rem'
          }}>
            Create Journal
          </span>
        </div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          Create Journal
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Isi formulir berikut untuk membuat jurnal baru dalam instalasi OJS Anda.
        </p>
      </div>

      {/* Form Container */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <JournalEditForm journal={blankJournal} mode="create" />
      </div>
    </div>
  );
}


            style={{
              color: '#006798',
              textDecoration: 'underline',
              fontSize: '0.875rem'
            }}
          >
            Hosted Journals
          </Link>
          <span style={{ 
            color: '#6B7280', 
            margin: '0 0.5rem',
            fontSize: '0.875rem'
          }}>»</span>
          <span style={{ 
            color: '#111827',
            fontSize: '0.875rem'
          }}>
            Create Journal
          </span>
        </div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          Create Journal
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Isi formulir berikut untuk membuat jurnal baru dalam instalasi OJS Anda.
        </p>
      </div>

      {/* Form Container */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <JournalEditForm journal={blankJournal} mode="create" />
      </div>
    </div>
  );
}


            style={{
              color: '#006798',
              textDecoration: 'underline',
              fontSize: '0.875rem'
            }}
          >
            Hosted Journals
          </Link>
          <span style={{ 
            color: '#6B7280', 
            margin: '0 0.5rem',
            fontSize: '0.875rem'
          }}>»</span>
          <span style={{ 
            color: '#111827',
            fontSize: '0.875rem'
          }}>
            Create Journal
          </span>
        </div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          Create Journal
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Isi formulir berikut untuk membuat jurnal baru dalam instalasi OJS Anda.
        </p>
      </div>

      {/* Form Container */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <JournalEditForm journal={blankJournal} mode="create" />
      </div>
    </div>
  );
}

