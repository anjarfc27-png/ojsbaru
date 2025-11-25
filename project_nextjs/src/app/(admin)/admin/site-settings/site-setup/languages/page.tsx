import { getSiteLanguages, updateSiteLanguagesAction, installLocaleAction } from "../../actions";
import { getLocaleInfo } from "@/lib/locales";
import LanguagesPageClient from "./languages-client";

async function installLocaleActionWrapper(formData: FormData): Promise<void> {
  "use server";
  const localeCode = formData.get('localeCode') as string;
  if (!localeCode) return;
  await installLocaleAction(localeCode);
}

export default async function SiteSetupLanguagesPage() {
  const initial = await getSiteLanguages();
  const installedLocales = initial.enabled_locales
    .map((code) => getLocaleInfo(code))
    .filter((locale): locale is NonNullable<typeof locale> => locale !== null);

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
          Languages
        </h2>
      </header>
      
      <LanguagesPageClient 
        initial={initial} 
        installedLocales={installedLocales}
        updateAction={updateSiteLanguagesAction}
        installAction={installLocaleActionWrapper}
      />
    </div>
  );
}
