# Offener Folgevertrag: äußere Node-Suchverzeichnisse

Dieser Vertrag ist **nur abgeleitet, nicht implementiert**. Der neue tatsächliche Preparer-Layoutlauf hat den früheren `/dev/shm/node_modules`-Block nicht beseitigt: Sein erster nicht gebundener Lookup liegt jetzt unter `<Original-/Kandidatenwurzel>/node_modules`. Beide Programme beenden sich mit Exit 0; die vollständige Leseauthentisierung bleibt gesperrt. Es gibt keine neue Pfadfreigabe.

Die gebundene tsx-Verteilung versucht ihren optionalen Darwin-Import `fsevents` über `createRequire(import.meta.url)`. Der neue Mountort verschiebt die Vorfahren dieser Modulsuche. Die bisherige Dependency-View kann fehlende Komponenten nur **innerhalb** ihres tatsächlichen `app/node_modules`-Mounts beweisen. Die Rollenwurzel außerhalb dieses Mounts ist eine andere Autoritätsgrenze.

Der kleinste denkbare allgemeine Folgeschritt wäre ein Beleg für einen **geschlossenen, tatsächlich nur lesbaren Namespace-Elternordner**. Er darf nicht aus einem einzelnen Fehlertext oder aus einem Pfadprefix entstehen:

| Bindung | Nötiger tatsächlicher Beleg |
| --- | --- |
| Elternordner | Exakte physische Quelle, Namespaceziel, vollständige unmittelbare Mitgliedschaft mit Typen/Linktexten und ein unabhängig gebundener Inventarhash |
| Sichtbarkeit | Tatsächlicher RO-Mount und alle direkten darüberliegenden beziehungsweise untergeordneten Mounts; kein verdeckender oder schreibbarer Eintrag an der zu beweisenden Stelle |
| Lebensdauer | Aufnahme und erneute Prüfung unter demselben echten Preparation-Lock vor/nach dem Lauf; keine aus dem Hostnamen erratene Namespaceansicht |
| Toolkontext | Tatsächliche Node-Exe-/Code-/Trace-/PIDbindung und der geprüfte Modulkontext der eingeblendeten Distribution |
| Lookupklasse | Strukturell aus diesem tatsächlichen Modul-/Mountkontext abgeleitete Dependency-Suchverzeichnisse, nicht eine Liste historisch fehlgeschlagener absoluter Pfade |
| Negativereignis | Tatsächliche lesende Metadatenoperation mit verstandenen Flags und `ENOENT`; fehlende Komponente und bekannter Elternordner müssen im gebundenen Inventar passen |

Die Klassifikation muss vorher alle erwarteten Source-/QA-/Codeinputs und Outputs prüfen. Ein im vollständigen Quellvertrag vorhandener, aber nicht materialisierter Input darf dadurch niemals zur erlaubten Abwesenheit werden. Ein fehlendes Curriculum- oder Reviewdokument bleibt ein Fehler. Ein Tool-Suchverzeichnis darf nicht aus dem bloßen Namensbestandteil `node_modules` oder aus einer untergeschobenen Caller-Klassifikation abgeleitet werden.

Für den **ersten konkret beobachteten Block** ist die Rollenwurzel ein prüfbarer Kandidat: Sie stammt aus dem tatsächlichen privaten Materializer und ist im neuen Lauf RO gebunden. Die vollständige unmittelbare Namespace-Elternmitgliedschaft wurde in diesem Lauf aber noch nicht separat als solche eingefroren. Das vorhandene Source-Dateimanifest allein ist kein Ersatz, weil private Gitmetadaten, Mountstubs und andere konstruierte Einträge hinzukommen. Deshalb wird heute noch keine entsprechende Absenzfähigkeit gemintet.

Höhere Eltern wie der private Paarordner, `/dev/shm`, `/dev` oder `/` werden daraus nicht automatisch autorisiert. Sie benötigen jeweils dieselben vollständigen tatsächlichen Namespace-/Mount-/Mitgliedschaftsbelege; schreibbare oder unbekannte Eltern bleiben geschlossen. Insbesondere wird keine `/dev/shm`-Prefixausnahme, kein leerer Ersatzordner und kein neuer Toolsymlink eingeführt.

Eine spätere kleine Gegenprüfung müsste vorhandene Einträge, falsche Typen, falsche beziehungsweise RW-Mountquellen, unbekannte Eltern, Sourcekollisionen und nicht beobachtete Fehler abweisen. Sie müsste zugleich das echte negative Ereignis an einem vollständig belegten RO-Elternordner erklären. Das wäre ein eigener reviewbarer Mechanikschritt; ein gesamter Source-A-/Deep-/CQR-/AQA02/03-Pass entsteht daraus nicht.
