import type { LabelLanguage } from './filterLabels'

export interface ImprintViewCopy {
  backToApp: string
  title: string
  managingDirector: string
  contactLabel: string
  addressLabel: string
  registerEntryLabel: string
  registerCourt: string
  registerNumber: string
  vatIdLabel: string
  vatIdDescription: string
}

export const getImprintViewCopy = (language: LabelLanguage): ImprintViewCopy => (
  language === 'en'
    ? {
        backToApp: 'Back to App',
        title: 'Imprint',
        managingDirector: 'Managing Director: Dr. Matthias Unverzagt',
        contactLabel: 'Contact:',
        addressLabel: 'Address:',
        registerEntryLabel: 'Register Entry:',
        registerCourt: 'Register Court: Local Court Königstein',
        registerNumber: 'Register Number: HRB 6597',
        vatIdLabel: 'VAT ID:',
        vatIdDescription: 'VAT Identification Number according to §27 a Value Added Tax Act:',
      }
    : {
        backToApp: 'Zurück zur App',
        title: 'Impressum',
        managingDirector: 'Geschäftsführer: Dr. Matthias Unverzagt',
        contactLabel: 'Kontakt:',
        addressLabel: 'Anschrift:',
        registerEntryLabel: 'Registereintrag:',
        registerCourt: 'Registergericht: Amtsgericht Königstein',
        registerNumber: 'Registernummer: HRB 6597',
        vatIdLabel: 'Umsatzsteuer-ID:',
        vatIdDescription: 'Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:',
      }
)
