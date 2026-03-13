import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, FolderOpen, Bell, Users, Building2, MapPin, Settings,
  Monitor, Mail, Receipt, Phone, UserCircle, GraduationCap, Image, FileText,
  CreditCard, Landmark, ClipboardList, Hash, Home, LogOut, Plus, ChevronRight,
  Check, Circle, MessageSquare, Mic, Crown, User, CheckCircle,
  AlertCircle, Clock, Send, X, Sparkles, Loader, Minus, Pencil, Save,
  Lock, RefreshCw, UserX, Eye, EyeOff, Download, ToggleLeft, ToggleRight, BellOff, Link
} from "lucide-react";

// ── Supabase ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://niueqiwxhljhouqsjqqx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdWVxaXd4aGxqaG91cXNqcXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODYzNzYsImV4cCI6MjA4ODY2MjM3Nn0.I1SqvRG3-boMOd2F9SW0yyZG5iFMAwjGHvsxadOOjg0";

const sb = {
  from: (table) => ({
    select: (cols = "*") => fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}&order=created_at.asc`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }).then(r => r.json()),
    insert: (data) => fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(data) }).then(r => r.json()),
    update: (data, id) => fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=minimal" }, body: JSON.stringify(data) }).then(r => { if (!r.ok) return r.text().then(t => { throw new Error(t); }); return r; }),
    upsert: async (data) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(data)
      });
      return res;
    },
  }),
};

// ── Static data ──────────────────────────────────────────────────────────────

const PORTAIL_URL = "https://gni-portail.vercel.app";

const ADVISORS = ["Sandra", "Loïc", "Heliot", "Marie"];

// Compte admin initial
const INIT_ADMIN = { id: "admin", firstName: "Dorian", lastName: "Admin", email: "dorian@gni.com", password: "Gnimmo66", phone: "" };

const INIT_TEAM = [
  { id: "sandra",  firstName: "Sandra",  lastName: "Martin",   email: "sandra@gni-reseau.fr",  phone: "+33 6 10 11 12 13", password: "Sandra2026!",  disabled: false, relancesEnabled: true, prospectRelancesEnabled: true },
  { id: "loic",    firstName: "Loïc",    lastName: "Bernard",  email: "loic@gni-reseau.fr",    phone: "+33 6 20 21 22 23", password: "Loic2026!",    disabled: false, relancesEnabled: true, prospectRelancesEnabled: true },
  { id: "heliot",  firstName: "Heliot",  lastName: "Dupont",   email: "heliot@gni-reseau.fr",  phone: "+33 6 30 31 32 33", password: "Heliot2026!", disabled: false, relancesEnabled: true, prospectRelancesEnabled: true },
  { id: "marie",   firstName: "Marie",   lastName: "Leclerc",  email: "marie@gni-reseau.fr",   phone: "+33 6 40 41 42 43", password: "Marie2026!",   disabled: false, relancesEnabled: true, prospectRelancesEnabled: true },
];

const DOCUMENT_LIST = [
  { id: "carte_pro", label: "Carte professionnelle en cours de validité", Icon: CreditCard },
  { id: "rib",       label: "RIB",                                         Icon: Landmark },
  { id: "cni",       label: "CNI du gérant détenteur de la carte",         Icon: ClipboardList },
  { id: "kbis",      label: "Extrait K-bis (moins de 3 mois)",             Icon: FileText },
  { id: "siret",     label: "SIRET de l'agence payeuse et/ou exploitante", Icon: Hash },
];

const INFO_LIST = [
  { id: "enseigne",           label: "Nom de l'enseigne et adresse postale",          Icon: Home },
  { id: "points_vente",       label: "Nombre de points de vente",                     Icon: MapPin },
  { id: "services",           label: "Services proposés aux particuliers",             Icon: Settings },
  { id: "logiciel",           label: "Logiciel Transaction",                           Icon: Monitor },
  { id: "email_direction",    label: "E-mail de la direction",                         Icon: Mail },
  { id: "facturation",        label: "Coordonnées et adresse de facturation",          Icon: Receipt },
  { id: "email_agence",       label: "E-mail et numéros de l'agence",                 Icon: Phone },
  { id: "email_collaborateurs", label: "E-mail des collaborateurs",                   Icon: Users },
  { id: "assistante",         label: "Coordonnées de l'assistante de direction",      Icon: UserCircle },
  { id: "formation",          label: "Mode de formation (renouvellement carte T)",    Icon: GraduationCap },
];

const COMM_LIST = [
  { id: "logo",         label: "Logo en JPG / PNG",                          Icon: Image },
  { id: "photos",       label: "Photos équipe, agence & gérant (1920×1080)", Icon: Image },
  { id: "presentation", label: "Présentation de l'agence (réseaux sociaux)", Icon: FileText },
];

// ── Prospection ──────────────────────────────────────────────────────────────

const PROSPECT_DOC_LIST = [
  { id: "contrat_portail",    label: "Contrat Portail diffusion",               Icon: FileText },
  { id: "contrat_transaction",label: "Contrat logiciel de transaction",          Icon: FileText },
  { id: "contrat_gestion",   label: "Contrat logiciel de gestion",              Icon: FileText },
  { id: "contrats_divers",   label: "Différents contrats, outils et services",  Icon: ClipboardList },
];

const INIT_PROSPECT_TEMPLATES = [
  { id: 1, delay: 3,  channels: { email: true, sms: true, vocal: true }, message: "Bonjour {civilite} {nom}, suite à notre échange, je me permets de revenir vers vous. Nous serions ravis de vous accompagner dans votre projet avec le Groupe National de l'Immobilier. Avez-vous pu avancer sur les documents évoqués ?" },
  { id: 2, delay: 7,  channels: { email: true, sms: true, vocal: true }, message: "Bonjour {civilite} {nom}, je reviens vers vous concernant votre intégration au réseau GNI. N'hésitez pas à me contacter si vous avez des questions, je suis à votre disposition pour organiser un rendez-vous." },
  { id: 3, delay: 14, channels: { email: true, sms: true, vocal: true }, message: "Bonjour {civilite} {nom}, sans nouvelles de votre part, je souhaitais savoir si vous étiez toujours intéressé par le réseau GNI. Je reste disponible pour en discuter à votre convenance." },
];

const getProspectProgress = (prospect) => {
  const docsDone = PROSPECT_DOC_LIST.filter(d => !!prospect.docs?.[d.id]).length;
  return Math.round((docsDone / PROSPECT_DOC_LIST.length) * 100);
};

const getProspectMissing = (prospect) =>
  PROSPECT_DOC_LIST.filter((d) => !prospect.docs?.[d.id]).map((d) => d.label);

const MOCK_PROSPECTS = [
  {
    id: "prospect-1", name: "Agence Laforêt Toulouse", civility: "M.", contactFirstName: "Marc", contact: "Lefebvre", email: "marc@laforet-toulouse.fr", phone: "+33 5 61 22 33 44",
    advisor: "Sandra", createdAt: "08/03/2026", status: "in_progress", notes: "Très intéressé, RDV prévu semaine prochaine. A déjà un contrat portail avec SeLoger.",
    docs: { contrat_portail: true, contrat_transaction: false, contrat_gestion: false, contrats_divers: false },
    relanceHistory: [
      { id: 1, date: "2026-03-10T10:00:00", channel: "Email", by: "Sandra", missing: ["Contrat logiciel de transaction", "Contrat logiciel de gestion", "Différents contrats, outils et services"] },
    ],
  },
  {
    id: "prospect-2", name: "Century 21 Nantes", civility: "Mme", contactFirstName: "Sophie", contact: "Morel", email: "s.morel@century21-nantes.fr", phone: "+33 2 40 55 66 77",
    advisor: "Loïc", createdAt: "05/03/2026", status: "pending", notes: "Premier contact par téléphone. Envoyer la plaquette commerciale.",
    docs: { contrat_portail: false, contrat_transaction: false, contrat_gestion: false, contrats_divers: false },
    relanceHistory: [],
  },
  {
    id: "prospect-3", name: "Orpi Marseille Centre", civility: "M.", contactFirstName: "Philippe", contact: "Durand", email: "p.durand@orpi-marseille.fr", phone: "+33 4 91 33 44 55",
    advisor: "Heliot", createdAt: "01/03/2026", status: "in_progress", notes: "A fourni ses contrats portail et transaction. En attente des contrats de gestion.",
    docs: { contrat_portail: true, contrat_transaction: true, contrat_gestion: false, contrats_divers: false },
    relanceHistory: [
      { id: 1, date: "2026-03-07T14:30:00", channel: "SMS", by: "Heliot", missing: ["Contrat logiciel de gestion", "Différents contrats, outils et services"] },
      { id: 2, date: "2026-03-03T09:15:00", channel: "Email", by: "Heliot", missing: ["Contrat logiciel de transaction", "Contrat logiciel de gestion", "Différents contrats, outils et services"] },
    ],
  },
  {
    id: "prospect-4", name: "Stéphane Plaza Immobilier Lyon", civility: "Mme", contactFirstName: "Claire", contact: "Martin", email: "c.martin@splaza-lyon.fr", phone: "+33 4 72 11 22 33",
    advisor: "Marie", createdAt: "10/03/2026", status: "complete", notes: "Tous les contrats récupérés. Prêt pour signature d'adhésion.",
    docs: { contrat_portail: true, contrat_transaction: true, contrat_gestion: true, contrats_divers: true },
    relanceHistory: [
      { id: 1, date: "2026-03-11T16:00:00", channel: "Assistant vocal", by: "Marie", missing: [] },
    ],
  },
];

const MOCK_CLIENTS = [
  {
    id: 1, name: "Agence Prestige Avignon", civility: "Mme", contactFirstName: "Sophie", contact: "Martin", advisor: "Sandra", createdAt: "2026-02-15", status: "in_progress",
    docs:  { carte_pro: true,  rib: true,  cni: false, kbis: false, siret: true },
    infos: { enseigne: true, points_vente: true, services: false, logiciel: false, email_direction: true, facturation: false, email_agence: false, email_collaborateurs: false, assistante: false, formation: false },
    comms: { logo: true, photos: false, presentation: false },
    email: "contact@prestige-avignon.fr", phone: "+33 4 90 12 34 56",
    relanceHistory: [
      { id: 1, date: "2026-03-01T09:14:00", channel: "Email",    by: "Sandra", missing: ["CNI du gérant", "Extrait K-bis", "Services proposés", "Logiciel Transaction", "Adresse facturation", "E-mail agence", "Collaborateurs", "Assistante", "Formation", "Photos", "Présentation"] },
      { id: 2, date: "2026-03-04T14:32:00", channel: "SMS",      by: "Sandra", missing: ["CNI du gérant", "Extrait K-bis", "Services proposés", "Logiciel Transaction", "Adresse facturation", "Photos", "Présentation"] },
    ],
  },
  {
    id: 2, name: "Century 21 Marseille Nord", civility: "M.", contactFirstName: "Pierre", contact: "Durand", advisor: "Loïc", createdAt: "2026-03-01", status: "complete",
    docs:  { carte_pro: true, rib: true, cni: true, kbis: true, siret: true },
    infos: { enseigne: true, points_vente: true, services: true, logiciel: true, email_direction: true, facturation: true, email_agence: true, email_collaborateurs: true, assistante: true, formation: true },
    comms: { logo: true, photos: true, presentation: true },
    email: "direction@c21-marseille.fr", phone: "+33 4 91 22 33 44",
    relanceHistory: [
      { id: 1, date: "2026-03-02T10:05:00", channel: "Email",    by: "Loïc", missing: ["Extrait K-bis", "Photos", "Présentation"] },
      { id: 2, date: "2026-03-05T08:47:00", channel: "Assistant vocal", by: "Loïc", missing: ["Photos", "Présentation"] },
    ],
  },
  {
    id: 3, name: "IAD France - Lyon Part-Dieu", civility: "Mme", contactFirstName: "Julie", contact: "Blanc", advisor: "Marie", createdAt: "2026-03-06", status: "pending",
    docs:  { carte_pro: false, rib: false, cni: false, kbis: false, siret: false },
    infos: { enseigne: true, points_vente: false, services: false, logiciel: false, email_direction: true, facturation: false, email_agence: false, email_collaborateurs: false, assistante: false, formation: false },
    comms: { logo: false, photos: false, presentation: false },
    email: "lyon.partdieu@iad.fr", phone: "+33 4 72 11 22 33",
    relanceHistory: [],
  },
  {
    id: 4, name: "Foncia Premium Bordeaux", civility: "M.", contactFirstName: "Thomas", contact: "Roux", advisor: "Heliot", createdAt: "2026-02-28", status: "in_progress",
    docs:  { carte_pro: true, rib: false, cni: true, kbis: false, siret: false },
    infos: { enseigne: true, points_vente: true, services: true, logiciel: false, email_direction: true, facturation: true, email_agence: false, email_collaborateurs: false, assistante: false, formation: false },
    comms: { logo: true, photos: false, presentation: false },
    email: "bordeaux@foncia.fr", phone: "+33 5 56 44 55 66",
    relanceHistory: [
      { id: 1, date: "2026-03-03T11:20:00", channel: "Email", by: "Heliot", missing: ["RIB", "Extrait K-bis", "SIRET", "Logiciel Transaction", "E-mail agence", "Collaborateurs", "Assistante", "Formation", "Photos", "Présentation"] },
    ],
  },
];

const INIT_TEMPLATES = [
  { id: 1, delay: 3,  channels: { email: true, sms: true, vocal: true }, message: "Bonjour {civilite} {nom}, nous attendons encore vos documents pour finaliser votre dossier d'adhésion au réseau GNI. Merci de nous les transmettre dès que possible." },
  { id: 2, delay: 7,  channels: { email: true, sms: true, vocal: true }, message: "Bonjour {civilite} {nom}, votre dossier d'adhésion au Groupe National de l'Immobilier est toujours incomplet. Nous restons disponibles pour vous accompagner." },
  { id: 3, delay: 14, channels: { email: true, sms: true, vocal: true }, message: "Bonjour {civilite} {nom}, sans réponse de votre part sous 48h, nous ne pourrons pas finaliser votre intégration au réseau GNI. N'hésitez pas à nous contacter." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const getProgress = (client) => {
  const docsDone  = DOCUMENT_LIST.filter(d => !!client.docs?.[d.id]).length;
  const infosDone = INFO_LIST.filter(i => !!String(client.infos?.[i.id] || "").trim()).length;
  const commsDone = COMM_LIST.filter(c => !!client.comms?.[c.id]).length;
  const total = DOCUMENT_LIST.length + INFO_LIST.length + COMM_LIST.length;
  const done  = docsDone + infosDone + commsDone;
  return Math.round((done / total) * 100);
};

const getStatusColor = (s) => s === "complete" ? "#34C759" : s === "in_progress" ? "#FF9F0A" : "#FF3B30";
const getStatusLabel = (s) => s === "complete" ? "Complet" : s === "in_progress" ? "En cours" : "En attente";

const getMissingLabels = (client) => [
  ...DOCUMENT_LIST.filter((d) => !client.docs?.[d.id]).map((d) => d.label),
  ...INFO_LIST.filter((i) => !String(client.infos?.[i.id] || "").trim()).map((i) => i.label),
  ...COMM_LIST.filter((c) => !client.comms?.[c.id]).map((c) => c.label),
];

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    + " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

const CHANNEL_META = {
  "Email":           { Icon: Mail,           color: "#0071e3" },
  "SMS":             { Icon: MessageSquare,  color: "#34C759" },
  "Assistant vocal": { Icon: Mic,             color: "#FF9F0A" },
};

const StatusIcon = ({ status, size = 14 }) =>
  status === "complete"   ? <CheckCircle size={size} color="#34C759" /> :
  status === "in_progress"? <Clock       size={size} color="#FF9F0A" /> :
                            <AlertCircle size={size} color="#FF3B30" />;

// ── Component ─────────────────────────────────────────────────────────────────

const LOGO_GNI = "data:image/png;base64,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";

export default function GNIApp() {
  const [currentUser,       setCurrentUser]       = useState(() => { try { const s = localStorage.getItem("gni_session"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [loginEmail,        setLoginEmail]        = useState("");
  const [loginPassword,     setLoginPassword]     = useState("");
  const [loginError,        setLoginError]        = useState("");
  const [showLoginPwd,      setShowLoginPwd]      = useState(false);
  const [view,              setView]              = useState("dashboard");
  const [clients,           setClients]           = useState([]);
  const [dbLoading,         setDbLoading]         = useState(true);
  const [selectedClient,    setSelectedClient]    = useState(null);
  const [showNewClient,     setShowNewClient]     = useState(false);
  const [newClientName,     setNewClientName]     = useState("");
  const [newClientEmail,    setNewClientEmail]    = useState("");
  const [newClientPhone,    setNewClientPhone]    = useState("");
  const [newClientCivility, setNewClientCivility] = useState("");
  const [newClientContactFirstName, setNewClientContactFirstName] = useState("");
  const [newClientContact,  setNewClientContact]  = useState("");
  const [newClientAdvisor,  setNewClientAdvisor]  = useState("Sandra");
  const [relanceTemplates,  setRelanceTemplates]  = useState(INIT_TEMPLATES);
  const [activeTab,         setActiveTab]         = useState("docs");
  const [notification,      setNotification]      = useState(null);
  const [generatingId,      setGeneratingId]      = useState(null);
  const [sortOrder,         setSortOrder]         = useState("asc");
  const [filterAdvisor,     setFilterAdvisor]     = useState("all");
  const filterStatus = "all";
  const [dashClientFilter,  setDashClientFilter]  = useState("all");
  const [dashProspectFilter, setDashProspectFilter] = useState("all");
  const [editingClient,     setEditingClient]     = useState(null);
  const skipRefreshRef = useRef(false);
  const [editingProspectInfo, setEditingProspectInfo] = useState(null);
  const [team,              setTeam]              = useState(() => { try { const s = localStorage.getItem("gni_team"); return s ? JSON.parse(s) : INIT_TEAM; } catch { return INIT_TEAM; } });
  const [editingMember,     setEditingMember]     = useState(null);
  const [relancesEnabled,   setRelancesEnabled]   = useState(() => { try { const s = localStorage.getItem("gni_relances_enabled"); return s !== null ? JSON.parse(s) : true; } catch { return true; } });
  const [adminProfile,      setAdminProfile]      = useState(() => { try { const s = localStorage.getItem("gni_admin"); return s ? JSON.parse(s) : INIT_ADMIN; } catch { return INIT_ADMIN; } });
  const [prospects,         setProspects]         = useState(() => { try { const s = localStorage.getItem("gni_prospects"); return s ? JSON.parse(s) : MOCK_PROSPECTS; } catch { return MOCK_PROSPECTS; } });
  const [selectedProspect,  setSelectedProspect]  = useState(null);
  const [showNewProspect,   setShowNewProspect]   = useState(false);
  const [prospectTemplates, setProspectTemplates] = useState(() => { try { const s = localStorage.getItem("gni_prospect_templates"); return s ? JSON.parse(s) : INIT_PROSPECT_TEMPLATES; } catch { return INIT_PROSPECT_TEMPLATES; } });
  const [prospectRelancesEnabled, setProspectRelancesEnabled] = useState(() => { try { const s = localStorage.getItem("gni_prospect_relances_enabled"); return s !== null ? JSON.parse(s) : true; } catch { return true; } });
  const [callingClientId,  setCallingClientId]   = useState(null);
  const [activeCallId,     setActiveCallId]      = useState(null);
  const [callTranscripts,  setCallTranscripts]   = useState({});

  // ── Persistance localStorage ──────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("gni_team", JSON.stringify(team)); }, [team]);
  useEffect(() => { localStorage.setItem("gni_admin", JSON.stringify(adminProfile)); }, [adminProfile]);
  useEffect(() => { localStorage.setItem("gni_relances_enabled", JSON.stringify(relancesEnabled)); }, [relancesEnabled]);
  useEffect(() => { localStorage.setItem("gni_prospects", JSON.stringify(prospects)); }, [prospects]);
  useEffect(() => { localStorage.setItem("gni_prospect_templates", JSON.stringify(prospectTemplates)); }, [prospectTemplates]);
  useEffect(() => { localStorage.setItem("gni_prospect_relances_enabled", JSON.stringify(prospectRelancesEnabled)); }, [prospectRelancesEnabled]);

  // ── Chargement Supabase ────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setDbLoading(true);
      try {
        const data = await sb.from("clients").select("*");
        console.log("Supabase data:", data);

        if (Array.isArray(data) && data.length > 0) {
          const converted = data.map(r => ({
            id:             r.id,
            name:           r.name,
            civility:       r.civility || "",
            contactFirstName: r.contact_first_name || "",
            contact:        r.contact || "",
            email:          r.email || "",
            phone:          r.phone || "",
            advisor:        r.advisor || "Sandra",
            status:         r.status || "pending",
            createdAt:      r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : "",
            docs:           r.documents || {},
            infos:          r.informations || {},
            comms:          r.communication || {},
            relanceHistory: r.relance_history || [],
          }));
          setClients(converted);
        } else {
          // Première fois : insérer tous les clients mock en une seule requête
          const mockData = MOCK_CLIENTS.map(c => ({
            id:              String(c.id),
            name:            c.name,
            civility:        c.civility || "",
            contact_first_name: c.contactFirstName || "",
            contact:         c.contact || "",
            email:           c.email || "",
            phone:           c.phone || "",
            advisor:         c.advisor,
            status:          c.status,
            documents:       c.docs || {},
            informations:    c.infos || {},
            communication:   c.comms || {},
            relance_history: c.relanceHistory || [],
          }));
          const result = await sb.from("clients").upsert(mockData);
          console.log("Insert mock result:", result);
          setClients(mockData.map(c => ({
            id:             c.id,
            name:           c.name,
            civility:       c.civility || "",
            contactFirstName: c.contact_first_name || c.contactFirstName || "",
            contact:        c.contact || "",
            email:          c.email || "",
            phone:          c.phone || "",
            advisor:        c.advisor,
            status:         c.status,
            createdAt:      c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "",
            docs:           c.documents || {},
            infos:          c.informations || {},
            comms:          c.communication || {},
            relanceHistory: c.relance_history || [],
          })));
        }
      } catch (e) {
        console.error("Supabase load error:", e);
        setClients(MOCK_CLIENTS);
      }
      setDbLoading(false);
    };
    loadData();
    // Rafraîchissement automatique toutes les 15 secondes
    const interval = setInterval(async () => {
      if (skipRefreshRef.current) return;
      try {
        const data = await sb.from("clients").select("*");
        if (Array.isArray(data) && data.length > 0) {
          const converted = data.map(r => ({
            id:             r.id,
            name:           r.name,
            civility:       r.civility || "",
            contactFirstName: r.contact_first_name || "",
            contact:        r.contact || "",
            email:          r.email || "",
            phone:          r.phone || "",
            advisor:        r.advisor || "Sandra",
            status:         r.status || "pending",
            createdAt:      r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : "",
            docs:           r.documents || {},
            infos:          r.informations || {},
            comms:          r.communication || {},
            relanceHistory: r.relance_history || [],
          }));
          setClients(converted);
        }
      } catch(e) { console.error("Refresh error:", e); }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const saveClient = async (client) => {
    skipRefreshRef.current = true;
    try {
      const base = {
        id:              client.id,
        name:            client.name,
        email:           client.email || "",
        phone:           client.phone || "",
        advisor:         client.advisor,
        status:          client.status,
        documents:       client.docs || {},
        informations:    client.infos || {},
        communication:   client.comms || {},
        relance_history: client.relanceHistory || [],
      };
      // Try with new columns first
      const full = { ...base, civility: client.civility || "", contact_first_name: client.contactFirstName || "", contact: client.contact || "" };
      console.log("Saving client:", full);
      const res = await sb.from("clients").upsert(full);
      if (res && res.status && res.status >= 400) {
        // Retry without new columns if they don't exist yet
        console.warn("Retrying save without new columns...");
        await sb.from("clients").upsert(base);
      }
    } catch (e) {
      console.error("Save error:", e);
      try { await sb.from("clients").upsert({ id: client.id, name: client.name, email: client.email || "", phone: client.phone || "", advisor: client.advisor, status: client.status, documents: client.docs || {}, informations: client.infos || {}, communication: client.comms || {}, relance_history: client.relanceHistory || [] }); } catch(e2) { console.error("Fallback save error:", e2); }
    }
    setTimeout(() => { skipRefreshRef.current = false; }, 20000);
  };

  const addClientToDb = async (client) => {
    try {
      await sb.from("clients").insert({
        id:             client.id,
        name:           client.name,
        civility:       client.civility || "",
        contact_first_name: client.contactFirstName || "",
        contact:        client.contact || "",
        email:          client.email,
        phone:          client.phone,
        advisor:        client.advisor,
        status:         client.status,
        documents:      {},
        informations:   {},
        communication:  {},
        relance_history: [],
      });
    } catch (e) { console.error("Insert error:", e); }
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // ── Prospects ──
  const logProspectRelance = (prospectId, channel) => {
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) return;
    if (channel === "Assistant vocal") {
      initiateVoiceCall(prospect, "prospect");
      return;
    }
    const entry = { id: Date.now(), date: new Date().toISOString(), channel, by: currentUser.name, missing: getProspectMissing(prospect) };
    setProspects((prev) => prev.map((p) => p.id === prospectId ? { ...p, relanceHistory: [entry, ...(p.relanceHistory || [])] } : p));
    showNotif(`Relance ${channel} envoyée à ${prospect.name} !`);
  };

  const isProspectRelanceAllowed = (prospect) => {
    if (!prospectRelancesEnabled) return false;
    const member = team.find((m) => m.firstName === prospect.advisor);
    return !member || member.prospectRelancesEnabled !== false;
  };


  const addProspect = () => {
    if (!newProspectData.name.trim()) return;
    const prospect = {
      id: crypto.randomUUID(),
      name: newProspectData.name,
      civility: newProspectData.civility,
      contactFirstName: newProspectData.contactFirstName,
      contact: newProspectData.contact,
      email: newProspectData.email,
      phone: newProspectData.phone,
      notes: newProspectData.notes,
      advisor: currentUser.role === "admin" ? newProspectData.advisor : currentUser.name,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      status: "pending",
      docs: Object.fromEntries(PROSPECT_DOC_LIST.map((d) => [d.id, false])),
      relanceHistory: [],
    };
    setProspects((prev) => [...prev, prospect]);
    setShowNewProspect(false);
    setNewProspectData({ name: "", civility: "", contactFirstName: "", contact: "", email: "", phone: "", notes: "", advisor: "Sandra" });
    showNotif("Prospect ajouté !");
  };

  const [newProspectData, setNewProspectData] = useState({ name: "", civility: "", contactFirstName: "", contact: "", email: "", phone: "", notes: "", advisor: "Sandra" });
  const [filterProspectAdvisor, setFilterProspectAdvisor] = useState("all");
  const [filterProspectStatus, setFilterProspectStatus] = useState("all");

  const isRelanceAllowed = (client) => {
    if (!relancesEnabled) return false;
    const member = team.find((m) => m.firstName === client.advisor);
    return !member || member.relancesEnabled !== false;
  };

  const logRelance = (clientId, channel) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    if (channel === "Assistant vocal") {
      initiateVoiceCall(client, "client");
      return;
    }
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      channel,
      by: currentUser.name,
      missing: getMissingLabels(client),
    };
    const updated = { ...client, relanceHistory: [entry, ...(client.relanceHistory || [])] };
    setClients((prev) => prev.map((c) => c.id === clientId ? updated : c));
    saveClient(updated);
    showNotif(`Relance ${channel} envoyée à ${client.name} !`);
  };

  const initiateVoiceCall = async (entity, type = "client") => {
    if (callingClientId) return;
    const id = entity.id;
    const missingDocs = type === "client" ? getMissingLabels(entity) : getProspectMissing(entity);

    // Find the applicable relance template
    const templates = type === "client" ? relanceTemplates : prospectTemplates;
    const daysSinceCreation = Math.floor((Date.now() - new Date(entity.createdAt).getTime()) / 86400000);
    const applicableTemplate = [...templates].reverse().find(t => t.channels?.vocal && daysSinceCreation >= t.delay) || templates[0];
    const message = (applicableTemplate?.message || "")
      .replace("{civilite}", entity.civility || "")
      .replace("{nom}", entity.contact || entity.name);

    setCallingClientId(id);
    showNotif("Appel en cours...");

    try {
      const res = await fetch("/api/voice-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: entity.phone,
          clientName: entity.name,
          civility: entity.civility || "",
          contactFirstName: entity.contactFirstName || "",
          contact: entity.contact || "",
          missingDocs,
          message,
          clientId: String(id),
          clientType: type,
          initiatedBy: currentUser.name,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de l'appel");
      }

      const { callId } = await res.json();
      setActiveCallId(callId);

      // Log the relance entry with callId
      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        channel: "Assistant vocal",
        by: currentUser.name,
        missing: missingDocs,
        callId,
        callStatus: "in_progress",
      };

      if (type === "client") {
        const client = clients.find(c => c.id === id);
        if (client) {
          const updated = { ...client, relanceHistory: [entry, ...(client.relanceHistory || [])] };
          setClients(prev => prev.map(c => c.id === id ? updated : c));
          saveClient(updated);
        }
      } else {
        setProspects(prev => prev.map(p => p.id === id ? { ...p, relanceHistory: [entry, ...(p.relanceHistory || [])] } : p));
      }

      // Poll for call status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/call-status?callId=${encodeURIComponent(callId)}`);
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();

          if (statusData.status === "ended" || statusData.status === "failed") {
            clearInterval(pollInterval);
            setCallingClientId(null);
            setActiveCallId(null);

            // Store transcript
            if (statusData.transcript || statusData.summary) {
              setCallTranscripts(prev => ({ ...prev, [callId]: { transcript: statusData.transcript, summary: statusData.summary, duration: statusData.durationSeconds } }));
            }

            // Update the relance entry with call results
            const updateEntry = (entries) => entries.map(e =>
              e.callId === callId ? { ...e, callStatus: statusData.status, duration: statusData.durationSeconds, summary: statusData.summary } : e
            );

            if (type === "client") {
              setClients(prev => prev.map(c => c.id === id ? { ...c, relanceHistory: updateEntry(c.relanceHistory || []) } : c));
            } else {
              setProspects(prev => prev.map(p => p.id === id ? { ...p, relanceHistory: updateEntry(p.relanceHistory || []) } : p));
            }

            showNotif(statusData.status === "ended"
              ? `Appel terminé (${Math.round((statusData.durationSeconds || 0) / 60)} min)`
              : "L'appel a échoué"
            );
          }
        } catch (e) {
          console.error("Poll error:", e);
        }
      }, 5000);

      // Safety: stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setCallingClientId(prev => prev === id ? null : prev);
        setActiveCallId(prev => prev === callId ? null : prev);
      }, 300000);

    } catch (e) {
      console.error("Voice call error:", e);
      setCallingClientId(null);
      setActiveCallId(null);
      showNotif("Erreur : " + (e.message || "Impossible de lancer l'appel"));
    }
  };

  const handleLogin = () => {
    setLoginError("");
    const email = loginEmail.trim().toLowerCase();
    // Admin check
    if (email === adminProfile.email.toLowerCase()) {
      if (loginPassword === adminProfile.password) {
        setCurrentUser({ role: "admin", name: adminProfile.firstName });
        localStorage.setItem("gni_session", JSON.stringify({ role: "admin", name: adminProfile.firstName }));
        setView("dashboard");
      } else {
        setLoginError("Mot de passe incorrect.");
      }
      return;
    }
    // Advisor check
    const member = team.find((m) => m.email.toLowerCase() === email);
    if (!member) { setLoginError("Aucun compte trouvé avec cet e-mail."); return; }
    if (member.disabled) { setLoginError("Votre accès a été désactivé. Contactez l'administrateur."); return; }
    if (loginPassword !== member.password) { setLoginError("Mot de passe incorrect."); return; }
    const session = { role: "advisor", name: member.firstName, memberId: member.id };
    setCurrentUser(session);
    localStorage.setItem("gni_session", JSON.stringify(session));
    setView("dashboard");
  };


  const addClient = async () => {
    if (!newClientName.trim()) return;
    const newClient = {
      id: crypto.randomUUID(),
      name: newClientName,
      advisor: currentUser.role === "admin" ? newClientAdvisor : currentUser.name,
      createdAt: new Date().toISOString().split("T")[0],
      status: "pending",
      docs:  Object.fromEntries(DOCUMENT_LIST.map((d) => [d.id, false])),
      infos: Object.fromEntries(INFO_LIST.map((i) => [i.id, false])),
      comms: Object.fromEntries(COMM_LIST.map((c) => [c.id, false])),
      civility: newClientCivility,
      contactFirstName: newClientContactFirstName,
      contact: newClientContact,
      email: newClientEmail,
      phone: newClientPhone,
      relanceHistory: [],
    };
    setClients((prev) => [...prev, newClient]);
    await addClientToDb(newClient);
    setShowNewClient(false);
    setNewClientName(""); setNewClientCivility(""); setNewClientContactFirstName(""); setNewClientContact(""); setNewClientEmail(""); setNewClientPhone("");
    showNotif("Client ajouté avec succès !");
  };

  const generateMessage = async (tplId, delay) => {
    setGeneratingId(tplId);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `Génère un message de relance professionnel et chaleureux pour un réseau immobilier appelé "Groupe National de l'Immobilier" (GNI). Ce message est la relance J+${delay} envoyée à une agence immobilière qui n'a pas encore transmis tous ses documents d'adhésion. Commence par "Bonjour {civilite} {nom}," (utiliser exactement {civilite} {nom}). Sois bref (2-3 phrases), professionnel et chaleureux. Mentionne le délai de ${delay} jours. Propose de l'aide. Pas de signature. Réponds UNIQUEMENT avec le texte du message.` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text?.trim();
      if (text) setRelanceTemplates((prev) => prev.map((t) => t.id === tplId ? { ...t, message: text } : t));
    } catch (_) {
      showNotif("Erreur lors de la génération IA");
    }
    setGeneratingId(null);
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const visibleClients = (currentUser?.role === "admin"
    ? clients
    : clients.filter((c) => c.advisor === currentUser?.name)
  ).filter((c) => filterStatus === "all" || c.status === filterStatus)
   .slice().sort((a, b) => {
    const da = new Date(a.createdAt), db = new Date(b.createdAt);
    return sortOrder === "asc" ? da - db : db - da;
  });

  const allClients = currentUser?.role === "admin"
    ? clients
    : clients.filter((c) => c.advisor === currentUser?.name);

  const stats = {
    total:      allClients.length,
    complete:   allClients.filter((c) => c.status === "complete").length,
    inProgress: allClients.filter((c) => c.status === "in_progress").length,
    pending:    allClients.filter((c) => c.status === "pending").length,
  };

  const allProspects = currentUser?.role === "admin"
    ? prospects
    : prospects.filter((p) => p.advisor === currentUser?.name);
  const prospectStats = {
    total:      allProspects.length,
    complete:   allProspects.filter((p) => p.status === "complete").length,
    inProgress: allProspects.filter((p) => p.status === "in_progress").length,
    pending:    allProspects.filter((p) => p.status === "pending").length,
  };

  const navItems = [
    { id: "dashboard",   Icon: LayoutDashboard, label: "Tableau de bord" },
    { id: "clients",     Icon: FolderOpen,      label: "Dossiers clients" },
    { id: "prospects",   Icon: Building2,       label: "Prospection" },
    ...(currentUser?.role === "admin" ? [
      { id: "relances", Icon: Bell,  label: "Relances" },
      { id: "team",     Icon: Users, label: "Équipe" },
    ] : [
      { id: "profile",  Icon: UserCircle, label: "Mon profil" },
    ]),
  ];

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (dbLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#f5f5f7,#e8e8ed)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'SF Pro Display',-apple-system,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <img src={LOGO_GNI} alt="GNI" style={{ height: 80, objectFit: "contain", marginBottom: 24 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#86868b", fontSize: 14 }}>
            <div style={{ width: 20, height: 20, border: "2px solid #0071e3", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            Chargement des données…
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#f5f5f7,#e8e8ed)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif" }}>
        <div style={{ background: "rgba(255,255,255,.92)", backdropFilter: "blur(20px)", borderRadius: 24, padding: "48px 40px", width: 380, boxShadow: "0 8px 40px rgba(0,0,0,.10)", border: "1px solid rgba(255,255,255,.9)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <img src={LOGO_GNI} alt="Groupe National de l'Immobilier" style={{ height: 100, objectFit: "contain", marginBottom: 20 }} />
            <div style={{ fontSize: 13, color: "#86868b", marginTop: 4 }}>Espace collaborateur</div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase" }}>Adresse e-mail</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="votre@email.fr"
              style={{ display: "block", width: "100%", padding: "12px 14px", marginTop: 8, borderRadius: 10, border: loginError ? "1.5px solid #FF3B30" : "1px solid #d1d1d6", background: "#fafafa", fontSize: 15, color: "#1d1d1f", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase" }}>Mot de passe</label>
            <div style={{ position: "relative", marginTop: 8 }}>
              <input
                type={showLoginPwd ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                style={{ display: "block", width: "100%", padding: "12px 44px 12px 14px", borderRadius: 10, border: loginError ? "1.5px solid #FF3B30" : "1px solid #d1d1d6", background: "#fafafa", fontSize: 15, color: "#1d1d1f", outline: "none", boxSizing: "border-box" }}
              />
              <button onClick={() => setShowLoginPwd((p) => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#86868b", padding: 0 }}>
                {showLoginPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {loginError && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff1f1", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <AlertCircle size={14} color="#FF3B30" />
              <span style={{ fontSize: 13, color: "#FF3B30" }}>{loginError}</span>
            </div>
          )}

          <button onClick={handleLogin} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0071e3,#00c7be)", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,113,227,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Se connecter <ChevronRight size={16} />
          </button>

          <p style={{ fontSize: 11, color: "#aeaeb2", textAlign: "center", marginTop: 20, marginBottom: 0, lineHeight: 1.6 }}>
            Problème de connexion ? Contactez<br />
            <a href="mailto:dorian@gni-reseau.fr" style={{ color: "#0071e3" }}>dorian@gni-reseau.fr</a>
          </p>
        </div>
      </div>
    );
  }

  // ── MAIN APP ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", fontFamily: "'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex" }}>

      {/* Impersonation banner */}
      {currentUser.impersonatedBy && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000, background: "linear-gradient(90deg,#FF9F0A,#FF6723)", color: "white", padding: "8px 20px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 2px 10px rgba(0,0,0,.15)" }}>
          <Eye size={14} />
          <span>Vous visualisez le compte de <strong>{currentUser.name}</strong></span>
          <button onClick={() => {
            const session = { role: "admin", name: adminProfile.firstName };
            setCurrentUser(session);
            localStorage.setItem("gni_session", JSON.stringify(session));
            setView("team");
            showNotif("Retour au compte administrateur");
          }} style={{ padding: "4px 14px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,.5)", background: "rgba(255,255,255,.2)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <Crown size={11} /> Revenir admin
          </button>
        </div>
      )}

      {/* Notification toast */}
      {notification && (
        <div style={{ position: "fixed", top: currentUser.impersonatedBy ? 52 : 20, right: 20, zIndex: 9999, background: "#34C759", color: "white", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,.15)", display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={15} /> {notification}
        </div>
      )}

      {/* SIDEBAR */}
      <div style={{ width: 220, minHeight: "100vh", background: "rgba(255,255,255,.88)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(0,0,0,.06)", padding: "24px 16px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ marginBottom: 24, padding: "12px 8px 16px", borderBottom: "1px solid #f0f0f5", textAlign: "center" }}>
          <img src={LOGO_GNI} alt="Groupe National de l'Immobilier" style={{ width: "100%", maxHeight: 70, objectFit: "contain" }} />
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map(({ id, Icon, label }) => (
            <button key={id} onClick={() => { setView(id); setSelectedClient(null); setSelectedProspect(null); setShowNewProspect(false); setShowNewClient(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: view === id ? "rgba(0,113,227,.1)" : "transparent", color: view === id ? "#0071e3" : "#3a3a3c", fontSize: 13, fontWeight: view === id ? 600 : 500, cursor: "pointer", marginBottom: 4, textAlign: "left", transition: "all .2s" }}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 12, borderRadius: 12, background: "rgba(0,113,227,.06)", border: "1px solid rgba(0,113,227,.10)" }}>
          <div style={{ fontSize: 11, color: "#86868b", marginBottom: 4 }}>Connecté</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f", display: "flex", alignItems: "center", gap: 6 }}>
            {currentUser.role === "admin" ? <Crown size={13} color="#FF9F0A" /> : <User size={13} color="#0071e3" />}
            {currentUser.name}
          </div>
          <button onClick={() => { setCurrentUser(null); localStorage.removeItem("gni_session"); }} style={{ marginTop: 8, fontSize: 11, color: "#86868b", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
            <LogOut size={11} /> Déconnexion
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>

        {/* ── DASHBOARD ── */}
        {view === "dashboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -.5 }}>Bonjour {currentUser.name}</h1>
                <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>État de vos dossiers en cours</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setView("clients"); setShowNewClient(true); }} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0071e3,#00c7be)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,113,227,.3)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus size={16} /> Nouveau client
                </button>
                <button onClick={() => { setView("prospects"); setShowNewProspect(true); }} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#FF9F0A,#FF6723)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(255,159,10,.3)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus size={16} /> Nouveau prospect
                </button>
              </div>
            </div>

            {/* ── CLIENTS Section ── */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 6, height: 24, borderRadius: 3, background: "linear-gradient(135deg,#0071e3,#00c7be)" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>Clients</h2>
                <span style={{ fontSize: 13, color: "#86868b", fontWeight: 500 }}>({stats.total} dossiers)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Total",      value: stats.total,      color: "#0071e3", Icon: FolderOpen,  filter: "all"         },
                  { label: "Complets",    value: stats.complete,   color: "#34C759", Icon: CheckCircle, filter: "complete"    },
                  { label: "En cours",    value: stats.inProgress, color: "#FF9F0A", Icon: Clock,       filter: "in_progress" },
                  { label: "En attente",  value: stats.pending,    color: "#FF3B30", Icon: AlertCircle, filter: "pending"     },
                ].map((s) => {
                  const active = dashClientFilter === s.filter;
                  return (
                    <div key={s.label}
                      onClick={() => setDashClientFilter(active ? "all" : s.filter)}
                      style={{ background: active ? s.color : "white", borderRadius: 14, padding: "16px 18px", boxShadow: active ? `0 4px 18px ${s.color}40` : "0 2px 10px rgba(0,0,0,.05)", borderLeft: `4px solid ${s.color}`, cursor: "pointer", transition: "all .2s" }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: active ? "white" : s.color }}>{s.value}</div>
                        <s.Icon size={16} color={active ? "white" : s.color} />
                      </div>
                      <div style={{ fontSize: 11, color: active ? "rgba(255,255,255,.85)" : "#86868b", marginTop: 4 }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", margin: 0 }}>
                    {dashClientFilter === "all" ? "Tous les clients" : dashClientFilter === "complete" ? "Clients complets" : dashClientFilter === "in_progress" ? "Clients en cours" : "Clients en attente"}
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#86868b", marginLeft: 6 }}>({allClients.filter(c => dashClientFilter === "all" || c.status === dashClientFilter).length})</span>
                  </h3>
                  <button onClick={() => setView("clients")} style={{ fontSize: 13, color: "#0071e3", background: "none", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                    Voir tout <ChevronRight size={14} />
                  </button>
                </div>
                {allClients.filter(c => dashClientFilter === "all" || c.status === dashClientFilter).slice(0, 5).map((client) => {
                  const prog = getProgress(client);
                  return (
                    <div key={client.id} onClick={() => { setSelectedClient(client); setView("clients"); }}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #f2f2f7", cursor: "pointer" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Building2 size={16} color="#0071e3" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{client.name}</div>
                        <div style={{ fontSize: 11, color: "#86868b" }}>{client.advisor} · {client.createdAt}</div>
                      </div>
                      <div style={{ width: 60 }}>
                        <div style={{ height: 4, background: "#f2f2f7", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#34C759" : "#0071e3", borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#86868b", marginTop: 2, textAlign: "right" }}>{prog}%</div>
                      </div>
                      <div style={{ padding: "3px 8px", borderRadius: 20, background: getStatusColor(client.status) + "18", color: getStatusColor(client.status), fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                        <StatusIcon status={client.status} size={10} /> {getStatusLabel(client.status)}
                      </div>
                    </div>
                  );
                })}
                {allClients.length === 0 && <div style={{ textAlign: "center", color: "#86868b", padding: 20, fontSize: 13 }}>Aucun client</div>}
              </div>
            </div>

            {/* ── PROSPECTS Section ── */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 6, height: 24, borderRadius: 3, background: "linear-gradient(135deg,#FF9F0A,#FF6723)" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>Prospects</h2>
                <span style={{ fontSize: 13, color: "#86868b", fontWeight: 500 }}>({prospectStats.total} dossiers)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Total",      value: prospectStats.total,      color: "#FF9F0A", Icon: FolderOpen,  filter: "all"         },
                  { label: "Complets",    value: prospectStats.complete,   color: "#34C759", Icon: CheckCircle, filter: "complete"    },
                  { label: "En cours",    value: prospectStats.inProgress, color: "#0071e3", Icon: Clock,       filter: "in_progress" },
                  { label: "En attente",  value: prospectStats.pending,    color: "#FF3B30", Icon: AlertCircle, filter: "pending"     },
                ].map((s) => {
                  const active = dashProspectFilter === s.filter;
                  return (
                    <div key={s.label}
                      onClick={() => setDashProspectFilter(active ? "all" : s.filter)}
                      style={{ background: active ? s.color : "white", borderRadius: 14, padding: "16px 18px", boxShadow: active ? `0 4px 18px ${s.color}40` : "0 2px 10px rgba(0,0,0,.05)", borderLeft: `4px solid ${s.color}`, cursor: "pointer", transition: "all .2s" }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: active ? "white" : s.color }}>{s.value}</div>
                        <s.Icon size={16} color={active ? "white" : s.color} />
                      </div>
                      <div style={{ fontSize: 11, color: active ? "rgba(255,255,255,.85)" : "#86868b", marginTop: 4 }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", margin: 0 }}>
                    {dashProspectFilter === "all" ? "Tous les prospects" : dashProspectFilter === "complete" ? "Prospects complets" : dashProspectFilter === "in_progress" ? "Prospects en cours" : "Prospects en attente"}
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#86868b", marginLeft: 6 }}>({allProspects.filter(p => dashProspectFilter === "all" || p.status === dashProspectFilter).length})</span>
                  </h3>
                  <button onClick={() => setView("prospects")} style={{ fontSize: 13, color: "#FF9F0A", background: "none", border: "none", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                    Voir tout <ChevronRight size={14} />
                  </button>
                </div>
                {allProspects.filter(p => dashProspectFilter === "all" || p.status === dashProspectFilter).slice(0, 5).map((prospect) => {
                  const prog = getProspectProgress(prospect);
                  const docsDone = PROSPECT_DOC_LIST.filter(d => !!prospect.docs?.[d.id]).length;
                  return (
                    <div key={prospect.id} onClick={() => { setSelectedProspect(prospect); setView("prospects"); }}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #f2f2f7", cursor: "pointer" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF5E6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <MapPin size={16} color="#FF9F0A" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{prospect.name}</div>
                        <div style={{ fontSize: 11, color: "#86868b" }}>{prospect.advisor} · {docsDone}/{PROSPECT_DOC_LIST.length} docs</div>
                      </div>
                      <div style={{ width: 60 }}>
                        <div style={{ height: 4, background: "#f2f2f7", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#34C759" : "#FF9F0A", borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#86868b", marginTop: 2, textAlign: "right" }}>{prog}%</div>
                      </div>
                      <div style={{ padding: "3px 8px", borderRadius: 20, background: getStatusColor(prospect.status) + "18", color: getStatusColor(prospect.status), fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                        <StatusIcon status={prospect.status} size={10} /> {getStatusLabel(prospect.status)}
                      </div>
                    </div>
                  );
                })}
                {allProspects.length === 0 && <div style={{ textAlign: "center", color: "#86868b", padding: 20, fontSize: 13 }}>Aucun prospect</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── CLIENTS LIST ── */}
        {view === "clients" && !selectedClient && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -.5 }}>Dossiers clients</h1>
                <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>{visibleClients.length} agences en cours d'intégration</p>
              </div>
              <button onClick={() => setShowNewClient(true)} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0071e3,#00c7be)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,113,227,.3)", display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={16} /> Nouveau client
              </button>
            </div>

            {/* Filters — admin only */}
            {currentUser.role === "admin" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                {/* Filter by advisor */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", borderRadius: 10, padding: "6px 6px 6px 12px", boxShadow: "0 1px 6px rgba(0,0,0,.06)", border: "1px solid rgba(0,0,0,.05)" }}>
                  <User size={13} color="#86868b" />
                  <span style={{ fontSize: 12, color: "#86868b", fontWeight: 500 }}>Négociateur</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["all", ...ADVISORS].map((a) => (
                      <button key={a} onClick={() => setFilterAdvisor(a)} style={{ padding: "4px 10px", borderRadius: 7, border: "none", background: filterAdvisor === a ? "#0071e3" : "#f2f2f7", color: filterAdvisor === a ? "white" : "#3a3a3c", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
                        {a === "all" ? "Tous" : a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort by date */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", borderRadius: 10, padding: "6px 6px 6px 12px", boxShadow: "0 1px 6px rgba(0,0,0,.06)", border: "1px solid rgba(0,0,0,.05)" }}>
                  <Clock size={13} color="#86868b" />
                  <span style={{ fontSize: 12, color: "#86868b", fontWeight: 500 }}>Trier par date</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[{ val: "asc", label: "Plus ancien" }, { val: "desc", label: "Plus récent" }].map((opt) => (
                      <button key={opt.val} onClick={() => setSortOrder(opt.val)} style={{ padding: "4px 10px", borderRadius: 7, border: "none", background: sortOrder === opt.val ? "#0071e3" : "#f2f2f7", color: sortOrder === opt.val ? "white" : "#3a3a3c", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result count */}
                {(filterAdvisor !== "all") && (
                  <div style={{ fontSize: 12, color: "#86868b", marginLeft: 4 }}>
                    {visibleClients.filter(c => filterAdvisor === "all" || c.advisor === filterAdvisor).length} dossier(s)
                  </div>
                )}
              </div>
            )}

            {/* New client modal */}
            {showNewClient && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                <div style={{ background: "white", borderRadius: 20, padding: 32, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1d1d1f" }}>Nouveau dossier client</h2>
                    <button onClick={() => setShowNewClient(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#86868b" }}><X size={20} /></button>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase" }}>Civilité</label>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      {["M.", "Mme"].map((c) => (
                        <button key={c} onClick={() => setNewClientCivility(c)} style={{ padding: "9px 20px", borderRadius: 10, border: newClientCivility === c ? "none" : "1px solid #d1d1d6", background: newClientCivility === c ? "#0071e3" : "white", color: newClientCivility === c ? "white" : "#3a3a3c", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{c === "M." ? "Monsieur" : "Madame"}</button>
                      ))}
                    </div>
                  </div>
                  {[
                    { label: "Nom de l'agence *",   value: newClientName,              set: setNewClientName,              ph: "Ex: Century 21 Paris 8e" },
                    { label: "Prénom du contact",   value: newClientContactFirstName, set: setNewClientContactFirstName, ph: "Ex: Jean" },
                    { label: "Nom du contact",      value: newClientContact,           set: setNewClientContact,           ph: "Ex: Dupont" },
                    { label: "Email",               value: newClientEmail,             set: setNewClientEmail,             ph: "contact@agence.fr" },
                    { label: "Téléphone",           value: newClientPhone,             set: setNewClientPhone,             ph: "+33 1 23 45 67 89" },
                  ].map((f) => (
                    <div key={f.label} style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase" }}>{f.label}</label>
                      <input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} style={{ display: "block", width: "100%", padding: "11px 14px", marginTop: 6, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  {currentUser.role === "admin" && (
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase" }}>Conseiller assigné</label>
                      <select value={newClientAdvisor} onChange={(e) => setNewClientAdvisor(e.target.value)} style={{ display: "block", width: "100%", padding: "11px 14px", marginTop: 6, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 14, outline: "none" }}>
                        {ADVISORS.map((a) => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setShowNewClient(false)} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "1px solid #d1d1d6", background: "white", fontSize: 14, cursor: "pointer", color: "#3a3a3c" }}>Annuler</button>
                    <button onClick={addClient} style={{ flex: 2, padding: "12px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0071e3,#00c7be)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Créer le dossier</button>
                  </div>
                </div>
              </div>
            )}

            {/* Grouped by advisor (admin) or flat list (advisor) */}
            {currentUser.role === "admin" ? (() => {
              const advisorsToShow = filterAdvisor === "all" ? ADVISORS : [filterAdvisor];
              return advisorsToShow.map((advisor) => {
                const group = visibleClients
                  .filter((c) => c.advisor === advisor);
                if (group.length === 0) return null;
                const groupComplete   = group.filter((c) => c.status === "complete").length;
                const groupInProgress = group.filter((c) => c.status === "in_progress").length;
                return (
                  <div key={advisor} style={{ marginBottom: 32 }}>
                    {/* Advisor header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,rgba(0,113,227,.1),rgba(0,199,190,.08))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <User size={17} color="#0071e3" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>{advisor}</div>
                        <div style={{ fontSize: 11, color: "#86868b" }}>
                          {group.length} dossier{group.length > 1 ? "s" : ""} · {groupComplete} complet{groupComplete > 1 ? "s" : ""} · {groupInProgress} en cours
                        </div>
                      </div>
                      <div style={{ height: 1, flex: 3, background: "linear-gradient(90deg,#e5e5ea,transparent)" }} />
                    </div>

                    {/* Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
                      {group.map((client, idx) => {
                        const prog      = getProgress(client);
                        const docsDone  = DOCUMENT_LIST.filter(d => !!client.docs?.[d.id]).length;
                        const infosDone = INFO_LIST.filter(i => !!String(client.infos?.[i.id] || "").trim()).length;
                        const commsDone = COMM_LIST.filter(c => !!client.comms?.[c.id]).length;
                        return (
                          <div key={client.id} onClick={() => setSelectedClient(client)}
                            style={{ background: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 10px rgba(0,0,0,.05)", border: "1px solid rgba(0,0,0,.04)", cursor: "pointer", transition: "transform .2s,box-shadow .2s", position: "relative" }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.10)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "none";             e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,.05)"; }}>
                            {/* Date badge */}
                            <div style={{ position: "absolute", top: 14, right: 14, fontSize: 10, color: "#aeaeb2", background: "#f5f5f7", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>
                              {sortOrder === "asc" ? `#${idx + 1}` : ""} {client.createdAt}
                            </div>
                            <div style={{ marginBottom: 12, paddingRight: 60 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f", marginBottom: 2 }}>{client.name}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ padding: "3px 8px", borderRadius: 20, background: getStatusColor(client.status) + "18", color: getStatusColor(client.status), fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                                  <StatusIcon status={client.status} size={9} /> {getStatusLabel(client.status)}
                                </div>
                              </div>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 11, color: "#86868b" }}>Progression</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: prog === 100 ? "#34C759" : "#0071e3" }}>{prog}%</span>
                              </div>
                              <div style={{ height: 5, background: "#f2f2f7", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#34C759" : "linear-gradient(90deg,#0071e3,#00c7be)", borderRadius: 3 }} />
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 5 }}>
                              {[
                                { label: "Docs",  done: docsDone,  total: DOCUMENT_LIST.length, Icon: FileText },
                                { label: "Infos", done: infosDone, total: INFO_LIST.length,     Icon: ClipboardList },
                                { label: "Comm",  done: commsDone, total: COMM_LIST.length,     Icon: Image },
                              ].map((cat) => {
                                const full = cat.done === cat.total;
                                return (
                                  <div key={cat.label} style={{ flex: 1, padding: "5px 6px", borderRadius: 7, background: full ? "#f0fdf4" : "#f5f5f7", textAlign: "center", border: full ? "1px solid #34C75930" : "none" }}>
                                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 1 }}>
                                      {full ? <CheckCircle size={10} color="#34C759" /> : <cat.Icon size={10} color="#86868b" />}
                                    </div>
                                    <div style={{ fontSize: 9, color: full ? "#34C759" : "#86868b", fontWeight: full ? 600 : 400 }}>{cat.label}</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: full ? "#34C759" : "#1d1d1f" }}>{cat.done}/{cat.total}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })() : (
              // Flat list for advisors
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
                {visibleClients.map((client) => {
                  const prog = getProgress(client);
                  const docsDone  = DOCUMENT_LIST.filter(d => !!client.docs?.[d.id]).length;
                  const infosDone = INFO_LIST.filter(i => !!String(client.infos?.[i.id] || "").trim()).length;
                  const commsDone = COMM_LIST.filter(c => !!client.comms?.[c.id]).length;
                  return (
                    <div key={client.id} onClick={() => setSelectedClient(client)}
                      style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)", border: "1px solid rgba(0,0,0,.04)", cursor: "pointer", transition: "transform .2s,box-shadow .2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.10)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none";             e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>{client.name}</div>
                          <div style={{ fontSize: 12, color: "#86868b", marginTop: 3 }}>{client.createdAt}</div>
                        </div>
                        <div style={{ padding: "4px 10px", borderRadius: 20, background: getStatusColor(client.status) + "18", color: getStatusColor(client.status), fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          <StatusIcon status={client.status} size={11} /> {getStatusLabel(client.status)}
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "#86868b" }}>Progression</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: prog === 100 ? "#34C759" : "#0071e3" }}>{prog}%</span>
                        </div>
                        <div style={{ height: 6, background: "#f2f2f7", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#34C759" : "linear-gradient(90deg,#0071e3,#00c7be)", borderRadius: 3 }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { label: "Documents", done: docsDone,  total: DOCUMENT_LIST.length, Icon: FileText },
                          { label: "Infos",     done: infosDone, total: INFO_LIST.length,     Icon: ClipboardList },
                          { label: "Comm",      done: commsDone, total: COMM_LIST.length,     Icon: Image },
                        ].map((cat) => {
                          const full = cat.done === cat.total;
                          return (
                            <div key={cat.label} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, background: full ? "#f0fdf4" : "#f5f5f7", textAlign: "center", border: full ? "1px solid #34C75930" : "none" }}>
                              <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                                {full ? <CheckCircle size={11} color="#34C759" /> : <cat.Icon size={11} color="#86868b" />}
                              </div>
                              <div style={{ fontSize: 10, color: full ? "#34C759" : "#86868b", fontWeight: full ? 600 : 400 }}>{cat.label}</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: full ? "#34C759" : "#1d1d1f" }}>{cat.done}/{cat.total}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CLIENT DETAIL ── */}
        {view === "clients" && selectedClient && (() => {
          const client = clients.find((c) => c.id === selectedClient.id);
          const prog = getProgress(client);
          const docsFull  = DOCUMENT_LIST.filter(d => !!client.docs?.[d.id]).length === DOCUMENT_LIST.length;
          const infosFull = INFO_LIST.filter(i => !!String(client.infos?.[i.id] || "").trim()).length === INFO_LIST.length;
          const commsFull = COMM_LIST.filter(c => !!client.comms?.[c.id]).length === COMM_LIST.length;

          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <button onClick={() => setSelectedClient(null)} style={{ fontSize: 14, color: "#0071e3", background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Retour aux dossiers
                </button>
                {currentUser.role === "admin" && (
                  <button onClick={async () => {
                    if (!window.confirm(`Supprimer le dossier "${client.name}" ? Cette action est irréversible.`)) return;
                    try {
                      await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${client.id}`, {
                        method: "DELETE",
                        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
                      });
                    } catch(e) { console.error(e); }
                    setClients(prev => prev.filter(c => c.id !== client.id));
                    setSelectedClient(null);
                    showNotif("Dossier supprimé !");
                  }} style={{ fontSize: 13, color: "#FF3B30", background: "rgba(255,59,48,.08)", border: "none", cursor: "pointer", fontWeight: 600, padding: "7px 14px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <X size={13} /> Supprimer le dossier
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
                {/* Left column */}
                <div>
                  {/* Header card */}
                  <div style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    {editingClient && editingClient.id === client.id ? (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>Modifier la fiche client</h3>
                          <button onClick={() => setEditingClient(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#86868b" }}><X size={18} /></button>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>Civilité</label>
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            {["M.", "Mme"].map((c) => (
                              <button key={c} onClick={() => setEditingClient((prev) => ({ ...prev, civility: c }))} style={{ padding: "8px 18px", borderRadius: 10, border: editingClient.civility === c ? "none" : "1px solid #d1d1d6", background: editingClient.civility === c ? "#0071e3" : "white", color: editingClient.civility === c ? "white" : "#3a3a3c", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{c === "M." ? "Monsieur" : "Madame"}</button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          {[
                            { key: "name",             label: "Nom de l'agence",  ph: "Nom" },
                            { key: "contactFirstName", label: "Prénom du contact", ph: "Jean" },
                            { key: "contact",          label: "Nom du contact",   ph: "Dupont" },
                            { key: "email",            label: "E-mail",           ph: "email@agence.fr" },
                            { key: "phone",            label: "Téléphone",        ph: "+33 6 00 00 00 00" },
                          ].map((f) => (
                            <div key={f.key}>
                              <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>{f.label}</label>
                              <input value={editingClient[f.key] || ""} onChange={(e) => setEditingClient((prev) => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.ph}
                                style={{ display: "block", width: "100%", padding: "10px 12px", marginTop: 4, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                            </div>
                          ))}
                          {currentUser.role === "admin" && (
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>Conseiller assigné</label>
                              <select value={editingClient.advisor} onChange={(e) => setEditingClient((prev) => ({ ...prev, advisor: e.target.value }))}
                                style={{ display: "block", width: "100%", padding: "10px 12px", marginTop: 4, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                                {ADVISORS.map((a) => <option key={a} value={a}>{a}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                          <button onClick={() => {
                            const updated = { ...client, name: editingClient.name, civility: editingClient.civility, contactFirstName: editingClient.contactFirstName, contact: editingClient.contact, email: editingClient.email, phone: editingClient.phone, advisor: editingClient.advisor };
                            setClients((prev) => prev.map((c) => c.id === client.id ? updated : c));
                            saveClient(updated);
                            setSelectedClient(updated);
                            setEditingClient(null);
                            showNotif("Fiche client mise à jour !");
                          }} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0071e3,#00c7be)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                            <Save size={14} /> Enregistrer
                          </button>
                          <button onClick={() => setEditingClient(null)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #d1d1d6", background: "white", color: "#3a3a3c", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", margin: "0 0 8px", letterSpacing: -.5 }}>{client.name}</h1>
                        {(client.contactFirstName || client.contact) && <div style={{ fontSize: 13, color: "#3a3a3c", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><User size={12} /> {[client.civility, client.contactFirstName, client.contact].filter(Boolean).join(" ")}</div>}
                        <div style={{ fontSize: 13, color: "#86868b", display: "flex", alignItems: "center", gap: 16 }}>
                          {client.email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={12} />{client.email}</span>}
                          {client.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} />{client.phone}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#aeaeb2", marginTop: 6 }}>{client.advisor} · Créé le {client.createdAt}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => setEditingClient({ id: client.id, name: client.name, civility: client.civility || "", contactFirstName: client.contactFirstName || "", contact: client.contact || "", email: client.email, phone: client.phone, advisor: client.advisor })}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#f2f2f7", color: "#0071e3", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                          <Pencil size={12} /> Modifier
                        </button>
                        <div style={{ padding: "6px 14px", borderRadius: 20, background: getStatusColor(client.status) + "18", color: getStatusColor(client.status), fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                          <StatusIcon status={client.status} size={13} /> {getStatusLabel(client.status)}
                        </div>
                      </div>
                    </div>
                    )}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#86868b" }}>Progression globale</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: prog === 100 ? "#34C759" : "#0071e3" }}>{prog}%</span>
                      </div>
                      <div style={{ height: 8, background: "#f2f2f7", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#34C759" : "linear-gradient(90deg,#0071e3,#00c7be)", borderRadius: 4 }} />
                      </div>
                    </div>
                    {/* Lien portail agence */}
                    <div style={{ marginTop: 16, padding: "12px 14px", background: "#f5f5f7", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <a href={`${PORTAIL_URL}?id=${client.id}`} target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, fontSize: 12, color: "#0071e3", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "none", minWidth: 0 }}>
                        {PORTAIL_URL}?id={client.id}
                      </a>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <a href={`${PORTAIL_URL}?id=${client.id}`} target="_blank" rel="noopener noreferrer"
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#34C759", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                          <Eye size={12} /> Ouvrir
                        </a>
                        <button onClick={() => { navigator.clipboard.writeText(`${PORTAIL_URL}?id=${client.id}`); showNotif("Lien copié !"); }}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#0071e3", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          Copier
                        </button>
                        <a href={`mailto:${client.email || ""}?subject=${encodeURIComponent("Votre espace GNI - Dépôt de documents")}&body=${encodeURIComponent(`Bonjour${(client.contactFirstName || client.contact) ? " " + [client.civility, client.contact].filter(Boolean).join(" ") : ""},\n\nVous pouvez déposer vos documents directement sur votre espace dédié en cliquant sur le lien ci-dessous :\n\n${PORTAIL_URL}?id=${client.id}\n\nN'hésitez pas à revenir vers nous si vous avez des questions.\n\nCordialement,\n${currentUser.name}\nGroupe National de l'Immobilier`)}`}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#FF9F0A", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                          <Send size={12} /> Partager
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Tabs with completion badges */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {[
                      { id: "docs",  label: "Documents",    full: docsFull,  Icon: FileText },
                      { id: "infos", label: "Informations", full: infosFull, Icon: ClipboardList },
                      { id: "comms", label: "Communication",full: commsFull, Icon: Image },
                    ].map((tab) => {
                      const active = activeTab === tab.id;
                      return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "8px 16px", borderRadius: 10, border: tab.full && !active ? "2px solid #34C75930" : "none", background: active ? "#0071e3" : tab.full ? "#f0fdf4" : "white", color: active ? "white" : tab.full ? "#34C759" : "#3a3a3c", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 6 }}>
                          {tab.full
                            ? <CheckCircle size={13} color={active ? "white" : "#34C759"} />
                            : <tab.Icon size={13} />}
                          {tab.label}
                          {tab.full && <span style={{ fontSize: 10, opacity: .8 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Checklist */}
                  <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    {activeTab === "docs"  && DOCUMENT_LIST.map((item) => <FileItem key={item.id} item={item} value={client.docs[item.id]} />)}
                    {activeTab === "comms" && COMM_LIST.map((item)     => <FileItem key={item.id} item={item} value={client.comms[item.id]} />)}
                    {activeTab === "infos" && (
                      <div>
                        {INFO_LIST.map((item) => {
                          const val = client.infos?.[item.id];
                          const hasVal = val && String(val).trim();
                          return (
                            <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f7" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: hasVal ? 6 : 0 }}>
                                <item.Icon size={13} color={hasVal ? "#0071e3" : "#c7c7cc"} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: hasVal ? "#1d1d1f" : "#c7c7cc" }}>{item.label}</span>
                                {hasVal && <CheckCircle size={12} color="#34C759" style={{ marginLeft: "auto" }} />}
                              </div>
                              {hasVal ? (
                                <div style={{ fontSize: 13, color: "#3a3a3c", background: "#f5f5f7", borderRadius: 8, padding: "8px 12px", marginLeft: 21, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                  {String(val)}
                                </div>
                              ) : (
                                <div style={{ fontSize: 12, color: "#c7c7cc", marginLeft: 21, fontStyle: "italic" }}>Non renseigné</div>
                              )}
                            </div>
                          );
                        })}
                        {/* SIRET séparé */}
                        {client.infos?.siret && (
                          <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0f7ff", borderRadius: 10, border: "1px solid #0071e320" }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#0071e3", marginBottom: 2 }}>SIRET</div>
                            <div style={{ fontSize: 14, fontFamily: "monospace", color: "#1d1d1f", fontWeight: 600 }}>{client.infos.siret}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right column */}
                <div>
                  {/* Send relance */}
                  {isRelanceAllowed(client) ? (
                    <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "#1d1d1f" }}>Envoyer une relance</h3>
                      {[
                        { ch: "Email",           Icon: Mail,          color: "#0071e3" },
                        { ch: "SMS",             Icon: MessageSquare, color: "#34C759" },
                        { ch: "Assistant vocal", Icon: Mic,           color: "#FF9F0A" },
                      ].map((btn) => {
                        const isVocal = btn.ch === "Assistant vocal";
                        const isCalling = isVocal && callingClientId === client.id;
                        return (
                          <button key={btn.ch} onClick={() => !isCalling && logRelance(client.id, btn.ch)} disabled={isCalling} style={{ width: "100%", padding: "10px 14px", marginBottom: 8, borderRadius: 10, border: "none", background: isCalling ? btn.color + "20" : btn.color + "10", color: btn.color, fontSize: 13, fontWeight: 600, cursor: isCalling ? "not-allowed" : "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8, opacity: isCalling ? .7 : 1 }}>
                            {isCalling ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <btn.Icon size={14} />} {isCalling ? "Appel en cours..." : btn.ch} {!isCalling && <Send size={12} style={{ marginLeft: "auto", opacity: .4 }} />}
                            {isCalling && <Phone size={12} style={{ marginLeft: "auto", animation: "pulse 1.5s ease-in-out infinite" }} />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#aeaeb2", fontSize: 13, fontStyle: "italic" }}>
                        <BellOff size={15} /> Relances désactivées
                      </div>
                    </div>
                  )}

                  {/* Missing items */}
                  <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#1d1d1f" }}>Éléments manquants</h3>
                    {(() => {
                      const missing = getMissingLabels(client);
                      if (missing.length === 0) return (
                        <div style={{ fontSize: 13, color: "#34C759", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle size={15} /> Dossier complet !
                        </div>
                      );
                      return missing.slice(0, 6).map((label, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f5f5f7", fontSize: 12, color: "#3a3a3c" }}>
                          <Circle size={7} color="#FF3B30" fill="#FF3B30" />
                          <span style={{ flex: 1, lineHeight: 1.3 }}>{label}</span>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Relance history */}
                  <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px", color: "#1d1d1f", display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={14} color="#86868b" /> Historique des relances
                    </h3>
                    {(!client.relanceHistory || client.relanceHistory.length === 0) ? (
                      <div style={{ fontSize: 12, color: "#aeaeb2", fontStyle: "italic" }}>Aucune relance envoyée</div>
                    ) : client.relanceHistory.map((entry, i) => {
                      const meta = CHANNEL_META[entry.channel] || { Icon: Send, color: "#86868b" };
                      const isLast = i === client.relanceHistory.length - 1;
                      return (
                        <div key={entry.id} style={{ marginBottom: isLast ? 0 : 14, paddingBottom: isLast ? 0 : 14, borderBottom: isLast ? "none" : "1px solid #f5f5f7" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 6, background: meta.color + "14", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <meta.Icon size={12} color={meta.color} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{entry.channel}</span>
                            <span style={{ fontSize: 11, color: "#86868b" }}>par {entry.by}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#aeaeb2", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={10} /> {formatDateTime(entry.date)}
                          </div>
                          {entry.callId && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 6 }}>
                              {entry.callStatus === "in_progress" && <span style={{ color: "#FF9F0A", display: "flex", alignItems: "center", gap: 4 }}><Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> Appel en cours...</span>}
                              {entry.callStatus === "ended" && entry.duration != null && <span style={{ color: "#34C759" }}>{Math.floor(entry.duration / 60)}:{String(entry.duration % 60).padStart(2, "0")} min</span>}
                              {entry.callStatus === "failed" && <span style={{ color: "#FF3B30" }}>Appel échoué</span>}
                              {(entry.summary || callTranscripts[entry.callId]?.summary) && (
                                <button onClick={() => setCallTranscripts(prev => ({ ...prev, [`show_${entry.callId}`]: !prev[`show_${entry.callId}`] }))} style={{ background: "none", border: "1px solid #e5e5ea", borderRadius: 6, padding: "2px 8px", fontSize: 10, color: "#0071e3", cursor: "pointer" }}>
                                  {callTranscripts[`show_${entry.callId}`] ? "Masquer" : "Voir résumé"}
                                </button>
                              )}
                            </div>
                          )}
                          {entry.callId && callTranscripts[`show_${entry.callId}`] && (entry.summary || callTranscripts[entry.callId]?.summary) && (
                            <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "8px 10px", marginBottom: 6, fontSize: 11, color: "#3a3a3c", lineHeight: 1.5 }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: "#0071e3", letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Résumé de l'appel</div>
                              {entry.summary || callTranscripts[entry.callId]?.summary}
                            </div>
                          )}
                          {entry.missing && entry.missing.length > 0 && (
                            <div style={{ background: "#f9f9fb", borderRadius: 8, padding: "8px 10px" }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: "#aeaeb2", letterSpacing: .5, textTransform: "uppercase", marginBottom: 5 }}>
                                Éléments relancés ({entry.missing.length})
                              </div>
                              {entry.missing.map((m, j) => (
                                <div key={j} style={{ fontSize: 11, color: "#86868b", display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                                  <Circle size={5} color="#FF9F0A" fill="#FF9F0A" /> {m}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── RELANCES CONFIG ── */}
        {view === "relances" && currentUser.role === "admin" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -.5 }}>Scénarios de relance</h1>
              <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>Configurez vos relances automatiques — textes, canaux et délais</p>
            </div>

            {/* Activation relances */}
            <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.07)", marginBottom: 24, border: "1px solid rgba(0,0,0,.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>Activation des relances</div>
                  <div style={{ fontSize: 12, color: "#86868b", marginTop: 2 }}>Activez ou désactivez les relances globalement et par commercial</div>
                </div>
                <button onClick={() => setRelancesEnabled((v) => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, border: "none", background: relancesEnabled ? "#34C75918" : "#FF3B3018", color: relancesEnabled ? "#34C759" : "#FF3B30", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .18s" }}>
                  {relancesEnabled ? <><ToggleRight size={18} /> Activées</> : <><ToggleLeft size={18} /> Désactivées</>}
                </button>
              </div>

              {relancesEnabled && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase", marginBottom: 12 }}>Par commercial</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                    {team.map((member) => {
                      const enabled = member.relancesEnabled !== false;
                      return (
                        <button key={member.id}
                          onClick={() => setTeam((prev) => prev.map((m) => m.id === member.id ? { ...m, relancesEnabled: !enabled } : m))}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${enabled ? "#34C75940" : "#e5e5ea"}`, background: enabled ? "#34C75908" : "#fafafa", cursor: "pointer", transition: "all .18s" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: enabled ? "linear-gradient(135deg,#0071e3,#00c7be)" : "#e5e5ea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: "white" }}>{(member.firstName[0] + member.lastName[0]).toUpperCase()}</span>
                          </div>
                          <div style={{ flex: 1, textAlign: "left" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{member.firstName}</div>
                            <div style={{ fontSize: 11, color: enabled ? "#34C759" : "#aeaeb2" }}>{enabled ? "Relances actives" : "Relances désactivées"}</div>
                          </div>
                          {enabled ? <Bell size={14} color="#34C759" /> : <BellOff size={14} color="#aeaeb2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {relanceTemplates.map((tpl, idx) => {
              const isGenerating = generatingId === tpl.id;
              const CHANNELS = [
                { key: "email",    Icon: Mail,          label: "Email",    color: "#0071e3" },
                { key: "sms",      Icon: MessageSquare, label: "SMS",      color: "#34C759" },
                { key: "vocal",    Icon: Mic,           label: "Assistant vocal", color: "#FF9F0A" },
              ];
              const toggleChannel = (key) => setRelanceTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, channels: { ...t.channels, [key]: !t.channels[key] } } : t));
              const updateDelay   = (d)   => setRelanceTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, delay: Math.max(1, t.delay + d) } : t));

              return (
                <div key={tpl.id} style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.07)", marginBottom: 16, border: "1px solid rgba(0,0,0,.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>Relance {idx + 1}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f5f5f7", borderRadius: 12, padding: "6px 14px" }}>
                      <Clock size={13} color="#86868b" />
                      <span style={{ fontSize: 12, color: "#86868b", fontWeight: 500 }}>Envoi après</span>
                      <button onClick={() => updateDelay(-1)} style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}><Minus size={11} /></button>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", minWidth: 24, textAlign: "center" }}>{tpl.delay}</span>
                      <button onClick={() => updateDelay(1)}  style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}><Plus  size={11} /></button>
                      <span style={{ fontSize: 12, color: "#86868b", fontWeight: 500 }}>jour{tpl.delay > 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase", marginBottom: 10 }}>Canaux d'envoi</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {CHANNELS.map(({ key, Icon, label, color }) => {
                        const active = tpl.channels[key];
                        return (
                          <button key={key} onClick={() => toggleChannel(key)} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, border: `2px solid ${active ? color : "#e5e5ea"}`, background: active ? color + "10" : "#fafafa", color: active ? color : "#86868b", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .18s" }}>
                            <Icon size={14} /> {label} {active && <Check size={11} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase", marginBottom: 8 }}>Message</div>
                    <div style={{ position: "relative" }}>
                      <textarea value={tpl.message} onChange={(e) => setRelanceTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, message: e.target.value } : t))}
                        style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid #d1d1d6", fontSize: 13, color: isGenerating ? "#86868b" : "#1d1d1f", resize: "none", height: 90, boxSizing: "border-box", outline: "none", lineHeight: 1.6, background: isGenerating ? "#f9f9fb" : "white" }}
                        disabled={isGenerating} />
                      {isGenerating && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "rgba(255,255,255,.7)", backdropFilter: "blur(2px)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0071e3", fontSize: 13, fontWeight: 600 }}>
                            <Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> Génération…
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: "#aeaeb2" }}>Utilisez <strong style={{ color: "#86868b" }}>{"{civilite} {nom}"}</strong> pour personnaliser</span>
                      <button onClick={() => generateMessage(tpl.id, tpl.delay)} disabled={isGenerating}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "none", background: isGenerating ? "#f2f2f7" : "linear-gradient(135deg,#6e40c9,#0071e3)", color: isGenerating ? "#aeaeb2" : "white", fontSize: 12, fontWeight: 600, cursor: isGenerating ? "default" : "pointer", boxShadow: isGenerating ? "none" : "0 2px 10px rgba(110,64,201,.3)", whiteSpace: "nowrap" }}>
                        {isGenerating ? <Loader size={12} /> : <Sparkles size={12} />}
                        {isGenerating ? "Génération…" : "Générer avec l'IA"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <button onClick={() => showNotif("Scénarios sauvegardés !")} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0071e3,#00c7be)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,113,227,.3)", display: "flex", alignItems: "center", gap: 8 }}>
              <Check size={15} /> Sauvegarder les scénarios
            </button>

            {/* ── PROSPECT RELANCES ── */}
            <div style={{ marginTop: 40, marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -.5 }}>Relances Prospection</h1>
              <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>Configurez les relances pour vos prospects</p>
            </div>

            {/* Activation relances prospect */}
            <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.07)", marginBottom: 24, border: "1px solid rgba(255,159,10,.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: prospectRelancesEnabled ? 20 : 0 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>Activation des relances prospect</div>
                  <div style={{ fontSize: 12, color: "#86868b", marginTop: 2 }}>Activez ou désactivez les relances prospect globalement et par commercial</div>
                </div>
                <button onClick={() => setProspectRelancesEnabled((v) => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, border: "none", background: prospectRelancesEnabled ? "#34C75918" : "#FF3B3018", color: prospectRelancesEnabled ? "#34C759" : "#FF3B30", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .18s" }}>
                  {prospectRelancesEnabled ? <><ToggleRight size={18} /> Activées</> : <><ToggleLeft size={18} /> Désactivées</>}
                </button>
              </div>

              {prospectRelancesEnabled && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase", marginBottom: 12 }}>Par commercial</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                    {team.map((member) => {
                      const enabled = member.prospectRelancesEnabled !== false;
                      return (
                        <button key={member.id}
                          onClick={() => setTeam((prev) => prev.map((m) => m.id === member.id ? { ...m, prospectRelancesEnabled: !enabled } : m))}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${enabled ? "#FF9F0A40" : "#e5e5ea"}`, background: enabled ? "#FF9F0A08" : "#fafafa", cursor: "pointer", transition: "all .18s" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: enabled ? "linear-gradient(135deg,#FF9F0A,#FF6723)" : "#e5e5ea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: "white" }}>{(member.firstName[0] + member.lastName[0]).toUpperCase()}</span>
                          </div>
                          <div style={{ flex: 1, textAlign: "left" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{member.firstName}</div>
                            <div style={{ fontSize: 11, color: enabled ? "#FF9F0A" : "#aeaeb2" }}>{enabled ? "Relances actives" : "Relances désactivées"}</div>
                          </div>
                          {enabled ? <Bell size={14} color="#FF9F0A" /> : <BellOff size={14} color="#aeaeb2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {prospectTemplates.map((tpl, idx) => {
              const CHANNELS = [
                { key: "email", Icon: Mail,          label: "Email",           color: "#0071e3" },
                { key: "sms",   Icon: MessageSquare, label: "SMS",             color: "#34C759" },
                { key: "vocal", Icon: Mic,           label: "Assistant vocal", color: "#FF9F0A" },
              ];
              const toggleChannel = (key) => setProspectTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, channels: { ...t.channels, [key]: !t.channels[key] } } : t));
              const updateDelay   = (d)   => setProspectTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, delay: Math.max(1, t.delay + d) } : t));

              return (
                <div key={tpl.id} style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.07)", marginBottom: 16, border: "1px solid rgba(255,159,10,.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>Relance prospect {idx + 1}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f5f5f7", borderRadius: 12, padding: "6px 14px" }}>
                      <Clock size={13} color="#86868b" />
                      <span style={{ fontSize: 12, color: "#86868b", fontWeight: 500 }}>Envoi après</span>
                      <button onClick={() => updateDelay(-1)} style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}><Minus size={11} /></button>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", minWidth: 24, textAlign: "center" }}>{tpl.delay}</span>
                      <button onClick={() => updateDelay(1)}  style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}><Plus  size={11} /></button>
                      <span style={{ fontSize: 12, color: "#86868b", fontWeight: 500 }}>jour{tpl.delay > 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase", marginBottom: 10 }}>Canaux d'envoi</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {CHANNELS.map(({ key, Icon, label, color }) => {
                        const active = tpl.channels[key];
                        return (
                          <button key={key} onClick={() => toggleChannel(key)} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, border: `2px solid ${active ? color : "#e5e5ea"}`, background: active ? color + "10" : "#fafafa", color: active ? color : "#86868b", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .18s" }}>
                            <Icon size={14} /> {label} {active && <Check size={11} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase", marginBottom: 8 }}>Message</div>
                    <textarea value={tpl.message} onChange={(e) => setProspectTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, message: e.target.value } : t))}
                      style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid #d1d1d6", fontSize: 13, color: "#1d1d1f", resize: "none", height: 90, boxSizing: "border-box", outline: "none", lineHeight: 1.6 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: "#aeaeb2" }}>Utilisez <strong style={{ color: "#86868b" }}>{"{civilite} {nom}"}</strong> pour personnaliser</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <button onClick={() => showNotif("Scénarios prospect sauvegardés !")} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#FF9F0A,#FF6723)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(255,159,10,.3)", display: "flex", alignItems: "center", gap: 8 }}>
              <Check size={15} /> Sauvegarder les scénarios prospect
            </button>
          </div>
        )}

        {/* ── TEAM ── */}
        {view === "team" && currentUser.role === "admin" && (() => {
          const genPassword = () => {
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
            return Array.from({length: 12}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
          };
          return (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -.5 }}>Équipe commerciale</h1>
                <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>Gérez les profils, accès et photos de vos conseillers</p>
              </div>

              {/* Edit/manage modal */}
              {editingMember && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}>
                  <div style={{ background: "white", borderRadius: 24, padding: 0, width: 480, boxShadow: "0 24px 64px rgba(0,0,0,.2)", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
                    {/* Modal header */}
                    <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #f2f2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1d1d1f" }}>Gérer le profil</h2>
                      <button onClick={() => setEditingMember(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#86868b" }}><X size={20} /></button>
                    </div>

                    <div style={{ padding: "24px 28px" }}>
                      {/* Photo upload */}
                      <div style={{ marginBottom: 24 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Photo de présentation</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 72, height: 72, borderRadius: 18, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#0071e3,#00c7be)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,113,227,.2)" }}>
                            {editingMember.photo
                              ? <img src={editingMember.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <span style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{(editingMember.firstName[0] + editingMember.lastName[0]).toUpperCase()}</span>
                            }
                          </div>
                          <div style={{ flex: 1 }}>
                            <label htmlFor="photo-upload-admin" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: "1.5px dashed #d1d1d6", background: "#fafafa", fontSize: 13, color: "#0071e3", fontWeight: 600, cursor: "pointer", justifyContent: "center" }}>
                              <Image size={15} /> {editingMember.photo ? "Changer la photo" : "Importer une photo"}
                            </label>
                            <input id="photo-upload-admin" type="file" accept="image/*" style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => setEditingMember((prev) => ({ ...prev, photo: ev.target.result }));
                                reader.readAsDataURL(file);
                              }} />
                            {editingMember.photo && (
                              <button onClick={() => setEditingMember((prev) => ({ ...prev, photo: null }))}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 0", background: "none", border: "none", color: "#FF3B30", fontSize: 12, cursor: "pointer", marginTop: 6 }}>
                                <X size={11} /> Supprimer la photo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info fields */}
                      {[
                        { label: "Prénom",    field: "firstName", ph: "Ex: Sandra",           type: "text"  },
                        { label: "Nom",       field: "lastName",  ph: "Ex: Martin",           type: "text"  },
                        { label: "E-mail",    field: "email",     ph: "prenom@gni-reseau.fr", type: "email" },
                        { label: "Téléphone", field: "phone",     ph: "+33 6 00 00 00 00",    type: "tel"   },
                      ].map((f) => (
                        <div key={f.field} style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase" }}>{f.label}</label>
                          <input type={f.type} value={editingMember[f.field] || ""}
                            onChange={(e) => setEditingMember((prev) => ({ ...prev, [f.field]: e.target.value }))}
                            placeholder={f.ph}
                            style={{ display: "block", width: "100%", padding: "11px 14px", marginTop: 6, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                        </div>
                      ))}

                      {/* Password section */}
                      <div style={{ background: editingMember._isAdmin ? "#fff8f0" : "#f8f9ff", border: `1px solid ${editingMember._isAdmin ? "#fed7aa" : "#e0e7ff"}`, borderRadius: 14, padding: "16px 18px", marginTop: 20, marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: editingMember._isAdmin ? "#c2410c" : "#3730a3", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                          <Lock size={13} /> {editingMember._isAdmin ? "Mot de passe administrateur" : "Mot de passe de l'espace sécurisé"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
                          Modifiez le mot de passe ou conservez l'actuel.
                        </div>
                        <div style={{ position: "relative", marginBottom: 10 }}>
                          <input
                            type={editingMember._showPwd ? "text" : "password"}
                            value={editingMember.password || ""}
                            onChange={(e) => setEditingMember((prev) => ({ ...prev, password: e.target.value }))}
                            placeholder="Mot de passe"
                            style={{ display: "block", width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                          />
                          <button onClick={() => setEditingMember((prev) => ({ ...prev, _showPwd: !prev._showPwd }))}
                            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#86868b" }}>
                            {editingMember._showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {!editingMember._isAdmin && (
                          <button onClick={() => {
                            const pwd = genPassword();
                            setEditingMember((prev) => ({ ...prev, password: pwd, _showPwd: true }));
                            showNotif("Mot de passe généré !");
                          }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6e40c9,#0071e3)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            <RefreshCw size={12} /> Générer un mot de passe aléatoire
                          </button>
                        )}
                      </div>

                      {/* Danger zone — disable access (advisors only) */}
                      {!editingMember._isAdmin && (
                        <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 14, padding: "16px 18px", marginBottom: 24 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            <AlertCircle size={13} /> Accès au compte
                          </div>
                          <div style={{ fontSize: 12, color: "#7f1d1d", marginBottom: 10, lineHeight: 1.5 }}>
                            {editingMember.disabled
                              ? "Ce conseiller n'a plus accès à l'application. Vous pouvez réactiver son compte."
                              : "Désactiver l'accès empêche ce conseiller de se connecter. Ses dossiers restent accessibles."}
                          </div>
                          <button onClick={() => setEditingMember((prev) => ({ ...prev, disabled: !prev.disabled }))}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", background: editingMember.disabled ? "#22c55e" : "#FF3B30", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            {editingMember.disabled ? <><CheckCircle size={12} /> Réactiver l'accès</> : <><UserX size={12} /> Désactiver l'accès</>}
                          </button>
                        </div>
                      )}

                      {/* Relances toggles (advisors only) */}
                      {!editingMember._isAdmin && (
                        <div style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: "16px 18px", marginBottom: 24 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                            <Bell size={13} /> Relances
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setEditingMember((prev) => ({ ...prev, relancesEnabled: prev.relancesEnabled === false ? true : false }))}
                              style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${editingMember.relancesEnabled !== false ? "#0071e340" : "#e5e5ea"}`, background: editingMember.relancesEnabled !== false ? "#0071e308" : "#fafafa", cursor: "pointer", textAlign: "left" }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#1d1d1f", marginBottom: 2 }}>Clients</div>
                              <div style={{ fontSize: 11, color: editingMember.relancesEnabled !== false ? "#0071e3" : "#aeaeb2" }}>
                                {editingMember.relancesEnabled !== false ? "Activées" : "Désactivées"}
                              </div>
                            </button>
                            <button onClick={() => setEditingMember((prev) => ({ ...prev, prospectRelancesEnabled: prev.prospectRelancesEnabled === false ? true : false }))}
                              style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${editingMember.prospectRelancesEnabled !== false ? "#FF9F0A40" : "#e5e5ea"}`, background: editingMember.prospectRelancesEnabled !== false ? "#FF9F0A08" : "#fafafa", cursor: "pointer", textAlign: "left" }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#1d1d1f", marginBottom: 2 }}>Prospects</div>
                              <div style={{ fontSize: 11, color: editingMember.prospectRelancesEnabled !== false ? "#FF9F0A" : "#aeaeb2" }}>
                                {editingMember.prospectRelancesEnabled !== false ? "Activées" : "Désactivées"}
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => setEditingMember(null)} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "1px solid #d1d1d6", background: "white", fontSize: 14, cursor: "pointer", color: "#3a3a3c" }}>Annuler</button>
                        <button onClick={() => {
                          const { generatedPassword, _isAdmin, _showAdminPwd, _showPwd, ...toSave } = editingMember;
                          if (_isAdmin) {
                            setAdminProfile(toSave);
                            setCurrentUser((prev) => ({ ...prev, name: toSave.firstName }));
                            localStorage.setItem("gni_session", JSON.stringify({ role: "admin", name: toSave.firstName }));
                          } else {
                            setTeam((prev) => prev.map((m) => m.id === toSave.id ? toSave : m));
                          }
                          setEditingMember(null);
                          showNotif("Profil mis à jour !");
                        }} style={{ flex: 2, padding: "12px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0071e3,#00c7be)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <Save size={15} /> Enregistrer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin profile card */}
              <div style={{ background: "linear-gradient(135deg,#1d1d1f,#2d2d30)", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,.15)", marginBottom: 24, position: "relative" }}>
                <div style={{ position: "absolute", top: 12, right: 12, background: "#FF9F0A", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: .5, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                  <Crown size={10} /> Administrateur
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", background: "linear-gradient(135deg,#FF9F0A,#FF6723)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(255,159,10,.3)" }}>
                    {adminProfile.photo
                      ? <img src={adminProfile.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{(adminProfile.firstName[0] + (adminProfile.lastName?.[0] || "A")).toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "white" }}>{adminProfile.firstName} {adminProfile.lastName}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.6)" }}><Mail size={11} /> {adminProfile.email}</div>
                      {adminProfile.phone && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.6)" }}><Phone size={11} /> {adminProfile.phone}</div>}
                    </div>
                  </div>
                  <button onClick={() => setEditingMember({ ...adminProfile, _isAdmin: true, generatedPassword: null })}
                    style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}>
                    <Pencil size={12} /> Modifier
                  </button>
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase", marginBottom: 12 }}>Conseillers commerciaux</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
                {team.map((member) => {
                  const adC = clients.filter((c) => c.advisor === member.firstName);
                  const initials = (member.firstName[0] + member.lastName[0]).toUpperCase();
                  return (
                    <div key={member.id} style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,.06)", position: "relative", opacity: member.disabled ? .55 : 1, border: member.disabled ? "1.5px solid #fecaca" : "1.5px solid transparent" }}>
                      {member.disabled && (
                        <div style={{ position: "absolute", top: 12, left: 12, background: "#FF3B30", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: .5, textTransform: "uppercase" }}>Accès désactivé</div>
                      )}
                      <button onClick={() => setEditingMember({ ...member, generatedPassword: null })}
                        style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 8, border: "none", background: "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#86868b", transition: "all .15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#0071e314"; e.currentTarget.style.color = "#0071e3"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#f2f2f7";   e.currentTarget.style.color = "#86868b"; }}>
                        <Pencil size={14} />
                      </button>

                      {/* Avatar with photo support */}
                      <div style={{ width: 56, height: 56, borderRadius: 16, overflow: "hidden", background: "linear-gradient(135deg,#0071e3,#00c7be)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, boxShadow: "0 4px 12px rgba(0,113,227,.2)", flexShrink: 0 }}>
                        {member.photo
                          ? <img src={member.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{initials}</span>
                        }
                      </div>

                      <div style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f" }}>{member.firstName} {member.lastName}</div>
                      <div style={{ fontSize: 12, color: "#86868b", marginBottom: 12, marginTop: 2 }}>Conseiller commercial</div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                        {[{ Icon: Mail, val: member.email }, { Icon: Phone, val: member.phone }].map(({ Icon, val }, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 6, background: "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Icon size={11} color="#86868b" />
                            </div>
                            <span style={{ fontSize: 12, color: val ? "#3a3a3c" : "#aeaeb2", fontStyle: val ? "normal" : "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {val || "Non renseigné"}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, borderTop: "1px solid #f5f5f7", paddingTop: 14 }}>
                        {[
                          { label: "Dossiers", value: adC.length,                                           color: "#0071e3" },
                          { label: "En cours", value: adC.filter((c) => c.status === "in_progress").length, color: "#FF9F0A" },
                          { label: "Complets", value: adC.filter((c) => c.status === "complete").length,    color: "#34C759" },
                        ].map((s) => (
                          <div key={s.label} style={{ background: "#f5f5f7", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: "#86868b" }}>{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {!member.disabled && (
                        <button onClick={() => {
                          const session = { role: "advisor", name: member.firstName, memberId: member.id, impersonatedBy: "admin" };
                          setCurrentUser(session);
                          localStorage.setItem("gni_session", JSON.stringify(session));
                          setView("dashboard");
                          showNotif(`Connecté en tant que ${member.firstName}`);
                        }}
                          style={{ width: "100%", marginTop: 14, padding: "8px 0", borderRadius: 10, border: "1.5px solid #0071e320", background: "#0071e308", color: "#0071e3", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#0071e315"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#0071e308"; }}>
                          <LogOut size={12} style={{ transform: "scaleX(-1)" }} /> Se connecter en tant que {member.firstName}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── PROSPECTS LIST ── */}
        {view === "prospects" && !selectedProspect && (() => {
          const visibleProspects = prospects
            .filter((p) => currentUser.role === "admin" || p.advisor === currentUser.name)
            .filter((p) => filterProspectAdvisor === "all" || p.advisor === filterProspectAdvisor)
            .filter((p) => filterProspectStatus === "all" || p.status === filterProspectStatus);
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -.5 }}>Prospection</h1>
                  <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>{visibleProspects.length} prospect{visibleProspects.length > 1 ? "s" : ""} en cours</p>
                </div>
                <button onClick={() => setShowNewProspect(true)} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#FF9F0A,#FF6723)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(255,159,10,.3)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus size={16} /> Nouveau prospect
                </button>
              </div>

              {/* Filters — admin only */}
              {currentUser.role === "admin" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", borderRadius: 10, padding: "6px 6px 6px 12px", boxShadow: "0 1px 6px rgba(0,0,0,.06)", border: "1px solid rgba(0,0,0,.05)" }}>
                    <User size={13} color="#86868b" />
                    <span style={{ fontSize: 12, color: "#86868b", fontWeight: 500 }}>Négociateur</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {["all", ...ADVISORS].map((a) => (
                        <button key={a} onClick={() => setFilterProspectAdvisor(a)} style={{ padding: "4px 10px", borderRadius: 7, border: "none", background: filterProspectAdvisor === a ? "#FF9F0A" : "#f2f2f7", color: filterProspectAdvisor === a ? "white" : "#3a3a3c", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
                          {a === "all" ? "Tous" : a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", borderRadius: 10, padding: "6px 6px 6px 12px", boxShadow: "0 1px 6px rgba(0,0,0,.06)", border: "1px solid rgba(0,0,0,.05)" }}>
                    <Circle size={13} color="#86868b" />
                    <span style={{ fontSize: 12, color: "#86868b", fontWeight: 500 }}>Statut</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[{ val: "all", label: "Tous" }, { val: "pending", label: "En attente" }, { val: "in_progress", label: "En cours" }, { val: "complete", label: "Complets" }].map((opt) => (
                        <button key={opt.val} onClick={() => setFilterProspectStatus(opt.val)} style={{ padding: "4px 10px", borderRadius: 7, border: "none", background: filterProspectStatus === opt.val ? "#FF9F0A" : "#f2f2f7", color: filterProspectStatus === opt.val ? "white" : "#3a3a3c", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* New prospect form */}
              {showNewProspect && (
                <div style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)", border: "2px solid #FF9F0A30" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>Ajouter un prospect</h3>
                    <button onClick={() => setShowNewProspect(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#86868b" }}><X size={18} /></button>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>Civilité</label>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      {["M.", "Mme"].map((c) => (
                        <button key={c} onClick={() => setNewProspectData((prev) => ({ ...prev, civility: c }))} style={{ padding: "8px 18px", borderRadius: 10, border: newProspectData.civility === c ? "none" : "1px solid #d1d1d6", background: newProspectData.civility === c ? "#FF9F0A" : "white", color: newProspectData.civility === c ? "white" : "#3a3a3c", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{c === "M." ? "Monsieur" : "Madame"}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      { field: "name",             label: "Nom de l'agence *",  ph: "Ex: Agence Immo Lyon",    type: "text" },
                      { field: "contactFirstName", label: "Prénom du contact",  ph: "Ex: Jean",                type: "text" },
                      { field: "contact",          label: "Nom du contact",     ph: "Ex: Dupont",              type: "text" },
                      { field: "email",            label: "E-mail",             ph: "contact@agence.fr",       type: "email" },
                      { field: "phone",            label: "Téléphone",          ph: "+33 6 00 00 00 00",       type: "tel" },
                    ].map((f) => (
                      <div key={f.field}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>{f.label}</label>
                        <input type={f.type} value={newProspectData[f.field]} onChange={(e) => setNewProspectData((prev) => ({ ...prev, [f.field]: e.target.value }))} placeholder={f.ph}
                          style={{ display: "block", width: "100%", padding: "10px 12px", marginTop: 4, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>Notes</label>
                    <textarea value={newProspectData.notes} onChange={(e) => setNewProspectData((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Informations complémentaires..."
                      style={{ display: "block", width: "100%", padding: "10px 12px", marginTop: 4, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "none", height: 60 }} />
                  </div>
                  {currentUser.role === "admin" && (
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>Conseiller assigné</label>
                      <select value={newProspectData.advisor} onChange={(e) => setNewProspectData((prev) => ({ ...prev, advisor: e.target.value }))}
                        style={{ display: "block", width: "100%", padding: "10px 12px", marginTop: 4, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                        {ADVISORS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  )}
                  <button onClick={addProspect} disabled={!newProspectData.name.trim()}
                    style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, border: "none", background: newProspectData.name.trim() ? "linear-gradient(135deg,#FF9F0A,#FF6723)" : "#e5e5ea", color: "white", fontSize: 14, fontWeight: 600, cursor: newProspectData.name.trim() ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6 }}>
                    <Plus size={14} /> Ajouter le prospect
                  </button>
                </div>
              )}

              {/* Grouped by advisor (admin) or flat list (advisor) */}
              {currentUser.role === "admin" ? (() => {
                const advisorsToShow = filterProspectAdvisor === "all" ? ADVISORS : [filterProspectAdvisor];
                return advisorsToShow.map((advisor) => {
                  const group = visibleProspects.filter((p) => p.advisor === advisor);
                  if (group.length === 0) return null;
                  const groupComplete   = group.filter((p) => p.status === "complete").length;
                  const groupInProgress = group.filter((p) => p.status === "in_progress").length;
                  return (
                    <div key={advisor} style={{ marginBottom: 32 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,rgba(255,159,10,.12),rgba(255,103,35,.08))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={17} color="#FF9F0A" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>{advisor}</div>
                          <div style={{ fontSize: 11, color: "#86868b" }}>
                            {group.length} prospect{group.length > 1 ? "s" : ""} · {groupComplete} complet{groupComplete > 1 ? "s" : ""} · {groupInProgress} en cours
                          </div>
                        </div>
                        <div style={{ height: 1, flex: 3, background: "linear-gradient(90deg,#e5e5ea,transparent)" }} />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
                        {group.map((prospect) => {
                          const prog = getProspectProgress(prospect);
                          const docsDone = PROSPECT_DOC_LIST.filter(d => !!prospect.docs?.[d.id]).length;
                          return (
                            <div key={prospect.id} onClick={() => setSelectedProspect(prospect)}
                              style={{ background: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 10px rgba(0,0,0,.05)", border: "1px solid rgba(255,159,10,.1)", cursor: "pointer", transition: "transform .2s,box-shadow .2s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.10)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,.05)"; }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                <div>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f" }}>{prospect.name}</div>
                                  {(prospect.contactFirstName || prospect.contact) && <div style={{ fontSize: 12, color: "#86868b", marginTop: 2 }}>{[prospect.civility, prospect.contactFirstName, prospect.contact].filter(Boolean).join(" ")}</div>}
                                  <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 2 }}>{prospect.createdAt}</div>
                                </div>
                                <div style={{ padding: "4px 10px", borderRadius: 20, background: getStatusColor(prospect.status) + "18", color: getStatusColor(prospect.status), fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                                  <StatusIcon status={prospect.status} size={11} /> {getStatusLabel(prospect.status)}
                                </div>
                              </div>
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ fontSize: 12, color: "#86868b" }}>Contrats reçus</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: prog === 100 ? "#34C759" : "#FF9F0A" }}>{docsDone}/{PROSPECT_DOC_LIST.length}</span>
                                </div>
                                <div style={{ height: 5, background: "#f2f2f7", borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#34C759" : "linear-gradient(90deg,#FF9F0A,#FF6723)", borderRadius: 3 }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })() : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
                  {visibleProspects.map((prospect) => {
                    const prog = getProspectProgress(prospect);
                    const docsDone = PROSPECT_DOC_LIST.filter(d => !!prospect.docs?.[d.id]).length;
                    return (
                      <div key={prospect.id} onClick={() => setSelectedProspect(prospect)}
                        style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)", border: "1px solid rgba(255,159,10,.1)", cursor: "pointer", transition: "transform .2s,box-shadow .2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.10)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"; }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>{prospect.name}</div>
                            {(prospect.contactFirstName || prospect.contact) && <div style={{ fontSize: 12, color: "#86868b", marginTop: 2 }}>{[prospect.civility, prospect.contactFirstName, prospect.contact].filter(Boolean).join(" ")}</div>}
                            <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 2 }}>{prospect.createdAt}</div>
                          </div>
                          <div style={{ padding: "4px 10px", borderRadius: 20, background: getStatusColor(prospect.status) + "18", color: getStatusColor(prospect.status), fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <StatusIcon status={prospect.status} size={11} /> {getStatusLabel(prospect.status)}
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: "#86868b" }}>Contrats reçus</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: prog === 100 ? "#34C759" : "#FF9F0A" }}>{docsDone}/{PROSPECT_DOC_LIST.length}</span>
                          </div>
                          <div style={{ height: 5, background: "#f2f2f7", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#34C759" : "linear-gradient(90deg,#FF9F0A,#FF6723)", borderRadius: 3 }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {visibleProspects.length === 0 && !showNewProspect && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#aeaeb2" }}>
                  <Building2 size={40} style={{ marginBottom: 12, opacity: .4 }} />
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Aucun prospect</div>
                  <div style={{ fontSize: 13 }}>Ajoutez votre premier prospect pour commencer</div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── PROSPECT DETAIL ── */}
        {view === "prospects" && selectedProspect && (() => {
          const prospect = prospects.find((p) => p.id === selectedProspect.id);
          if (!prospect) return null;
          const prog = getProspectProgress(prospect);
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <button onClick={() => setSelectedProspect(null)} style={{ fontSize: 14, color: "#FF9F0A", background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Retour aux prospects
                </button>
                <button onClick={() => {
                  if (!window.confirm(`Supprimer le prospect "${prospect.name}" ?`)) return;
                  setProspects((prev) => prev.filter((p) => p.id !== prospect.id));
                  setSelectedProspect(null);
                  showNotif("Prospect supprimé !");
                }} style={{ fontSize: 13, color: "#FF3B30", background: "rgba(255,59,48,.08)", border: "none", cursor: "pointer", fontWeight: 600, padding: "7px 14px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <X size={13} /> Supprimer
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
                {/* Left — info + docs */}
                <div>
                  {/* Header */}
                  <div style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    {editingProspectInfo && editingProspectInfo.id === prospect.id ? (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>Modifier la fiche prospect</h3>
                          <button onClick={() => setEditingProspectInfo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#86868b" }}><X size={18} /></button>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>Civilité</label>
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            {["M.", "Mme"].map((c) => (
                              <button key={c} onClick={() => setEditingProspectInfo((prev) => ({ ...prev, civility: c }))} style={{ padding: "8px 18px", borderRadius: 10, border: editingProspectInfo.civility === c ? "none" : "1px solid #d1d1d6", background: editingProspectInfo.civility === c ? "#FF9F0A" : "white", color: editingProspectInfo.civility === c ? "white" : "#3a3a3c", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{c === "M." ? "Monsieur" : "Madame"}</button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          {[
                            { key: "name",             label: "Nom de l'agence",  ph: "Nom" },
                            { key: "contactFirstName", label: "Prénom du contact", ph: "Jean" },
                            { key: "contact",          label: "Nom du contact",   ph: "Dupont" },
                            { key: "email",            label: "E-mail",           ph: "email@agence.fr" },
                            { key: "phone",            label: "Téléphone",        ph: "+33 6 00 00 00 00" },
                          ].map((f) => (
                            <div key={f.key}>
                              <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>{f.label}</label>
                              <input value={editingProspectInfo[f.key] || ""} onChange={(e) => setEditingProspectInfo((prev) => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.ph}
                                style={{ display: "block", width: "100%", padding: "10px 12px", marginTop: 4, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                            </div>
                          ))}
                          {currentUser.role === "admin" && (
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>Conseiller assigné</label>
                              <select value={editingProspectInfo.advisor} onChange={(e) => setEditingProspectInfo((prev) => ({ ...prev, advisor: e.target.value }))}
                                style={{ display: "block", width: "100%", padding: "10px 12px", marginTop: 4, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                                {ADVISORS.map((a) => <option key={a} value={a}>{a}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .5, textTransform: "uppercase" }}>Notes</label>
                          <textarea value={editingProspectInfo.notes || ""} onChange={(e) => setEditingProspectInfo((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Informations complémentaires..."
                            style={{ display: "block", width: "100%", padding: "10px 12px", marginTop: 4, borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "none", height: 60 }} />
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                          <button onClick={() => {
                            const updated = { ...prospect, name: editingProspectInfo.name, civility: editingProspectInfo.civility, contactFirstName: editingProspectInfo.contactFirstName, contact: editingProspectInfo.contact, email: editingProspectInfo.email, phone: editingProspectInfo.phone, advisor: editingProspectInfo.advisor, notes: editingProspectInfo.notes };
                            setProspects((prev) => prev.map((p) => p.id === prospect.id ? updated : p));
                            setSelectedProspect(updated);
                            setEditingProspectInfo(null);
                            showNotif("Fiche prospect mise à jour !");
                          }} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#FF9F0A,#FF6723)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                            <Save size={14} /> Enregistrer
                          </button>
                          <button onClick={() => setEditingProspectInfo(null)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #d1d1d6", background: "white", color: "#3a3a3c", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", margin: "0 0 8px", letterSpacing: -.5 }}>{prospect.name}</h1>
                        {(prospect.contactFirstName || prospect.contact) && <div style={{ fontSize: 13, color: "#3a3a3c", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><User size={12} /> {[prospect.civility, prospect.contactFirstName, prospect.contact].filter(Boolean).join(" ")}</div>}
                        <div style={{ fontSize: 13, color: "#86868b", display: "flex", alignItems: "center", gap: 16 }}>
                          {prospect.email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={12} />{prospect.email}</span>}
                          {prospect.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} />{prospect.phone}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#aeaeb2", marginTop: 6 }}>{prospect.advisor} · Créé le {prospect.createdAt}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => setEditingProspectInfo({ id: prospect.id, name: prospect.name, civility: prospect.civility || "", contactFirstName: prospect.contactFirstName || "", contact: prospect.contact, email: prospect.email, phone: prospect.phone, advisor: prospect.advisor, notes: prospect.notes })}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#FFF5E6", color: "#FF9F0A", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                          <Pencil size={12} /> Modifier
                        </button>
                        <div style={{ padding: "6px 14px", borderRadius: 20, background: getStatusColor(prospect.status) + "18", color: getStatusColor(prospect.status), fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                          <StatusIcon status={prospect.status} size={13} /> {getStatusLabel(prospect.status)}
                        </div>
                      </div>
                    </div>
                    )}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#86868b" }}>Contrats reçus</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: prog === 100 ? "#34C759" : "#FF9F0A" }}>{prog}%</span>
                      </div>
                      <div style={{ height: 8, background: "#f2f2f7", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#34C759" : "linear-gradient(90deg,#FF9F0A,#FF6723)", borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#1d1d1f", display: "flex", alignItems: "center", gap: 6 }}>
                      <ClipboardList size={14} color="#FF9F0A" /> Notes du conseiller
                    </h3>
                    <textarea value={prospect.notes || ""} onChange={(e) => setProspects((prev) => prev.map((p) => p.id === prospect.id ? { ...p, notes: e.target.value } : p))}
                      placeholder="Ajoutez des notes sur ce prospect..."
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 13, color: "#1d1d1f", resize: "none", height: 80, boxSizing: "border-box", outline: "none", lineHeight: 1.6 }} />
                  </div>

                  {/* Lien portail prospect */}
                  <div style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#1d1d1f", display: "flex", alignItems: "center", gap: 6 }}>
                      <Link size={14} color="#FF9F0A" /> Lien portail prospect
                    </h3>
                    <div style={{ padding: "12px 14px", background: "#FFF8EE", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <a href={`${PORTAIL_URL}?prospect=${prospect.id}`} target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, fontSize: 12, color: "#FF9F0A", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "none", minWidth: 0 }}>
                        {PORTAIL_URL}?prospect={prospect.id}
                      </a>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <a href={`${PORTAIL_URL}?prospect=${prospect.id}`} target="_blank" rel="noopener noreferrer"
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#34C759", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                          <Eye size={12} /> Ouvrir
                        </a>
                        <button onClick={() => { navigator.clipboard.writeText(`${PORTAIL_URL}?prospect=${prospect.id}`); showNotif("Lien copié !"); }}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#FF9F0A", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          Copier
                        </button>
                        <a href={`mailto:${prospect.email || ""}?subject=${encodeURIComponent("Votre espace GNI - Dépôt de contrats")}&body=${encodeURIComponent(`Bonjour${(prospect.contactFirstName || prospect.contact) ? " " + [prospect.civility, prospect.contact].filter(Boolean).join(" ") : ""},\n\nVous pouvez déposer vos contrats directement sur votre espace dédié en cliquant sur le lien ci-dessous :\n\n${PORTAIL_URL}?prospect=${prospect.id}\n\nN'hésitez pas à revenir vers nous si vous avez des questions.\n\nCordialement,\n${currentUser.name}\nGroupe National de l'Immobilier`)}`}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#0071e3", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                          <Send size={12} /> Partager
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Documents / Contrats */}
                  <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "#1d1d1f", display: "flex", alignItems: "center", gap: 6 }}>
                      <FileText size={14} color="#FF9F0A" /> Contrats à récupérer
                    </h3>
                    {PROSPECT_DOC_LIST.map((item) => (
                      <FileItem key={item.id} item={item} value={prospect.docs[item.id]} />
                    ))}
                  </div>
                </div>

                {/* Right — relances */}
                <div>
                  {/* Send relance */}
                  {isProspectRelanceAllowed(prospect) ? (
                    <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "#1d1d1f" }}>Envoyer une relance</h3>
                      {[
                        { ch: "Email",           Icon: Mail,          color: "#0071e3" },
                        { ch: "SMS",             Icon: MessageSquare, color: "#34C759" },
                        { ch: "Assistant vocal", Icon: Mic,           color: "#FF9F0A" },
                      ].map((btn) => {
                        const isVocal = btn.ch === "Assistant vocal";
                        const isCalling = isVocal && callingClientId === prospect.id;
                        return (
                          <button key={btn.ch} onClick={() => !isCalling && logProspectRelance(prospect.id, btn.ch)} disabled={isCalling} style={{ width: "100%", padding: "10px 14px", marginBottom: 8, borderRadius: 10, border: "none", background: isCalling ? btn.color + "20" : btn.color + "10", color: btn.color, fontSize: 13, fontWeight: 600, cursor: isCalling ? "not-allowed" : "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8, opacity: isCalling ? .7 : 1 }}>
                            {isCalling ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <btn.Icon size={14} />} {isCalling ? "Appel en cours..." : btn.ch} {!isCalling && <Send size={12} style={{ marginLeft: "auto", opacity: .4 }} />}
                            {isCalling && <Phone size={12} style={{ marginLeft: "auto", animation: "pulse 1.5s ease-in-out infinite" }} />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#aeaeb2", fontSize: 13, fontStyle: "italic" }}>
                        <BellOff size={15} /> Relances désactivées
                      </div>
                    </div>
                  )}

                  {/* Missing docs */}
                  <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#1d1d1f" }}>Contrats manquants</h3>
                    {(() => {
                      const missing = getProspectMissing(prospect);
                      if (missing.length === 0) return (
                        <div style={{ fontSize: 13, color: "#34C759", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle size={15} /> Tous les contrats reçus !
                        </div>
                      );
                      return missing.map((label, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f5f5f7", fontSize: 12, color: "#3a3a3c" }}>
                          <Circle size={7} color="#FF9F0A" fill="#FF9F0A" />
                          <span style={{ flex: 1, lineHeight: 1.3 }}>{label}</span>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Relance history */}
                  <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px", color: "#1d1d1f", display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={14} color="#86868b" /> Historique des relances
                    </h3>
                    {(!prospect.relanceHistory || prospect.relanceHistory.length === 0) ? (
                      <div style={{ fontSize: 12, color: "#aeaeb2", fontStyle: "italic" }}>Aucune relance envoyée</div>
                    ) : prospect.relanceHistory.map((entry, i) => {
                      const meta = CHANNEL_META[entry.channel] || { Icon: Send, color: "#86868b" };
                      const isLast = i === prospect.relanceHistory.length - 1;
                      return (
                        <div key={entry.id} style={{ marginBottom: isLast ? 0 : 14, paddingBottom: isLast ? 0 : 14, borderBottom: isLast ? "none" : "1px solid #f5f5f7" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <div style={{ width: 26, height: 26, borderRadius: 8, background: meta.color + "14", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <meta.Icon size={12} color={meta.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{entry.channel}</div>
                              <div style={{ fontSize: 11, color: "#86868b" }}>par {entry.by} · {formatDateTime(entry.date)}</div>
                            </div>
                          </div>
                          {entry.callId && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginLeft: 34, marginBottom: 4 }}>
                              {entry.callStatus === "in_progress" && <span style={{ color: "#FF9F0A", display: "flex", alignItems: "center", gap: 4 }}><Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> Appel en cours...</span>}
                              {entry.callStatus === "ended" && entry.duration != null && <span style={{ color: "#34C759" }}>{Math.floor(entry.duration / 60)}:{String(entry.duration % 60).padStart(2, "0")} min</span>}
                              {entry.callStatus === "failed" && <span style={{ color: "#FF3B30" }}>Appel échoué</span>}
                              {(entry.summary || callTranscripts[entry.callId]?.summary) && (
                                <button onClick={() => setCallTranscripts(prev => ({ ...prev, [`show_${entry.callId}`]: !prev[`show_${entry.callId}`] }))} style={{ background: "none", border: "1px solid #e5e5ea", borderRadius: 6, padding: "2px 8px", fontSize: 10, color: "#0071e3", cursor: "pointer" }}>
                                  {callTranscripts[`show_${entry.callId}`] ? "Masquer" : "Voir résumé"}
                                </button>
                              )}
                            </div>
                          )}
                          {entry.callId && callTranscripts[`show_${entry.callId}`] && (entry.summary || callTranscripts[entry.callId]?.summary) && (
                            <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "8px 10px", marginLeft: 34, marginBottom: 4, fontSize: 11, color: "#3a3a3c", lineHeight: 1.5 }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: "#0071e3", letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Résumé de l'appel</div>
                              {entry.summary || callTranscripts[entry.callId]?.summary}
                            </div>
                          )}
                          {entry.missing?.length > 0 && (
                            <div style={{ fontSize: 11, color: "#aeaeb2", marginLeft: 34 }}>Manquants : {entry.missing.join(", ")}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {view === "profile" && currentUser.role === "advisor" && (() => {
          const member = team.find((m) => m.firstName === currentUser.name);
          if (!member) return null;
          const isEditing = editingMember?.id === member.id;
          const draft = isEditing ? editingMember : member;

          return (
            <div style={{ maxWidth: 520 }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: -.5 }}>Mon profil</h1>
                <p style={{ fontSize: 14, color: "#86868b", margin: "4px 0 0" }}>Vos informations visibles par l'équipe GNI</p>
              </div>

              <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,.07)", marginBottom: 16 }}>
                {/* Photo + identity */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #f5f5f7" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, overflow: "hidden", background: "linear-gradient(135deg,#0071e3,#00c7be)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,113,227,.25)" }}>
                      {draft.photo
                        ? <img src={draft.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: 24, fontWeight: 800, color: "white" }}>{(draft.firstName[0] + draft.lastName[0]).toUpperCase()}</span>
                      }
                    </div>
                    {isEditing && (
                      <label htmlFor="photo-self" style={{ position: "absolute", bottom: -6, right: -6, width: 24, height: 24, borderRadius: "50%", background: "#0071e3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,113,227,.4)" }}>
                        <Pencil size={11} color="white" />
                        <input id="photo-self" type="file" accept="image/*" style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => setEditingMember((prev) => ({ ...prev, photo: ev.target.result }));
                            reader.readAsDataURL(file);
                          }} />
                      </label>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f" }}>{draft.firstName} {draft.lastName}</div>
                    <div style={{ fontSize: 13, color: "#86868b", marginTop: 2 }}>Conseiller commercial · GNI</div>
                    {isEditing && draft.photo && (
                      <button onClick={() => setEditingMember((prev) => ({ ...prev, photo: null }))}
                        style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, color: "#FF3B30", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <X size={10} /> Supprimer la photo
                      </button>
                    )}
                    {!isEditing && !draft.photo && (
                      <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 4, fontStyle: "italic" }}>Aucune photo — cliquez sur Modifier pour en ajouter une</div>
                    )}
                  </div>
                </div>

                {/* Fields */}
                {[
                  { label: "Prénom",    field: "firstName", Icon: User,  type: "text"  },
                  { label: "Nom",       field: "lastName",  Icon: User,  type: "text"  },
                  { label: "E-mail",    field: "email",     Icon: Mail,  type: "email" },
                  { label: "Téléphone", field: "phone",     Icon: Phone, type: "tel"   },
                ].map((f) => (
                  <div key={f.field} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                      <f.Icon size={11} /> {f.label}
                    </label>
                    {isEditing ? (
                      <input type={f.type} value={draft[f.field] || ""}
                        onChange={(e) => setEditingMember((prev) => ({ ...prev, [f.field]: e.target.value }))}
                        style={{ display: "block", width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #0071e380", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f8fbff" }} />
                    ) : (
                      <div style={{ padding: "11px 14px", borderRadius: 10, background: "#f5f5f7", fontSize: 14, color: draft[f.field] ? "#1d1d1f" : "#aeaeb2", fontStyle: draft[f.field] ? "normal" : "italic" }}>
                        {draft[f.field] || "Non renseigné"}
                      </div>
                    )}
                  </div>
                ))}

                <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => setEditingMember(null)} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "1px solid #d1d1d6", background: "white", fontSize: 14, cursor: "pointer", color: "#3a3a3c" }}>Annuler</button>
                      <button onClick={() => {
                        setTeam((prev) => prev.map((m) => m.id === editingMember.id ? editingMember : m));
                        setEditingMember(null);
                        showNotif("Profil mis à jour !");
                      }} style={{ flex: 2, padding: "12px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0071e3,#00c7be)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Save size={15} /> Enregistrer les modifications
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditingMember({ ...member })} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0071e3,#00c7be)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(0,113,227,.3)" }}>
                      <Pencil size={15} /> Modifier mon profil
                    </button>
                  )}
                </div>
              </div>

              {/* Change password card */}
              <ChangePasswordCard member={member} setTeam={setTeam} showNotif={showNotif} />
            </div>
          );
        })()}

      </div>
    </div>
  );
}

// ── FileItem — affiche le fichier uploadé par l'agence (ou un état vide) ──────
function FileItem({ item, value }) {
  const IconComponent = item.Icon;
  const isUrl  = typeof value === "string" && value.startsWith("http");
  const isText = typeof value === "string" && !value.startsWith("http") && value.trim();

  if (isUrl) {
    const rawName = decodeURIComponent(value.split("/").pop().split("?")[0]);
    const ext     = rawName.split(".").pop().toLowerCase();
    const isImage = ["jpg","jpeg","png","gif","webp","svg"].includes(ext);
    return (
      <div style={{ padding: "14px 0", borderBottom: "1px solid #f5f5f7" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isImage ? (
            <img src={value} alt={rawName} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: "1px solid #f2f2f7" }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 10, background: "#e8f0fd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconComponent size={22} color="#0071e3" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <CheckCircle size={13} color="#34C759" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#34C759" }}>Reçu</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: "#86868b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rawName}</div>
          </div>
          <a href={value} target="_blank" rel="noopener noreferrer"
            style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#0071e3", textDecoration: "none", fontWeight: 600, padding: "7px 14px", background: "#e8f0fd", borderRadius: 10 }}>
            <Download size={13} /> Télécharger
          </a>
        </div>
      </div>
    );
  }

  if (isText) {
    return (
      <div style={{ padding: "14px 0", borderBottom: "1px solid #f5f5f7", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconComponent size={22} color="#34C759" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#86868b", marginBottom: 3 }}>{item.label}</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{value}</div>
        </div>
        <CheckCircle size={16} color="#34C759" />
      </div>
    );
  }

  // Validé manuellement (true sans URL)
  if (value === true) {
    return (
      <div style={{ padding: "14px 0", borderBottom: "1px solid #f5f5f7", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconComponent size={22} color="#34C759" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{item.label}</div>
          <div style={{ fontSize: 11, color: "#34C759", marginTop: 3 }}>Validé — pas de fichier joint</div>
        </div>
        <CheckCircle size={16} color="#34C759" />
      </div>
    );
  }

  // État vide — en attente de l'agence
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid #f5f5f7", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 52, height: 52, borderRadius: 10, background: "#f5f5f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px dashed #d1d1d6" }}>
        <IconComponent size={22} color="#c7c7cc" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#86868b" }}>{item.label}</div>
        <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 3 }}>En attente de l'agence</div>
      </div>
      <AlertCircle size={16} color="#FF9F0A" />
    </div>
  );
}

// ── CheckItem ─────────────────────────────────────────────────────────────────


// ── ChangePasswordCard ────────────────────────────────────────────────────────
function ChangePasswordCard({ member, setTeam, showNotif }) {
  const [currentPwd,  setCurrentPwd]  = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [error,       setError]       = useState("");

  const handleChange = () => {
    setError("");
    if (currentPwd !== member.password) { setError("Le mot de passe actuel est incorrect."); return; }
    if (newPwd.length < 8)              { setError("Le nouveau mot de passe doit contenir au moins 8 caractères."); return; }
    if (newPwd !== confirmPwd)          { setError("Les deux mots de passe ne correspondent pas."); return; }
    setTeam((prev) => prev.map((m) => m.id === member.id ? { ...m, password: newPwd } : m));
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    showNotif("Mot de passe mis à jour !");
  };

  return (
    <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f0f0f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock size={15} color="#86868b" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>Changer mon mot de passe</div>
          <div style={{ fontSize: 12, color: "#86868b" }}>Minimum 8 caractères</div>
        </div>
      </div>

      {[
        { label: "Mot de passe actuel",    val: currentPwd, set: setCurrentPwd, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
        { label: "Nouveau mot de passe",   val: newPwd,     set: setNewPwd,     show: showNew,     toggle: () => setShowNew(p => !p)     },
        { label: "Confirmer le nouveau",   val: confirmPwd, set: setConfirmPwd, show: showNew,     toggle: () => setShowNew(p => !p)     },
      ].map((f, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#86868b", letterSpacing: .8, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{f.label}</label>
          <div style={{ position: "relative" }}>
            <input type={f.show ? "text" : "password"} value={f.val}
              onChange={(e) => { f.set(e.target.value); setError(""); }}
              placeholder="••••••••"
              style={{ display: "block", width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10, border: "1px solid #d1d1d6", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fafafa" }} />
            <button onClick={f.toggle} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#86868b", padding: 0 }}>
              {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      ))}

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff1f1", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
          <AlertCircle size={13} color="#FF3B30" />
          <span style={{ fontSize: 13, color: "#FF3B30" }}>{error}</span>
        </div>
      )}

      <button onClick={handleChange} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0071e3,#00c7be)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(0,113,227,.25)" }}>
        <Save size={15} /> Enregistrer le nouveau mot de passe
      </button>
    </div>
  );
}
