import {
  supabase,
  ensureAuthOnLoad,
  ensureDisplayName,
  loadProfileRole,
  handleLogout,
} from "./modules/auth.js";
import {
  getCurrentUser,
  getDisplayName,
  getCurrentRole,
} from "./modules/state.js";
import {
  updateAuthUI,
  openAccountDrawer,
  closeAccountDrawer,
} from "./modules/ui.js";
import {
  loadMessages,
  sendMessage,
  clearAllMessages,
} from "./modules/messages.js";

// Event: Login form
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  let email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;
  const loginStatusEl = document.getElementById("login-status");

  if (!email || !password) {
    loginStatusEl.textContent = "Skriv inn både e-post og passord.";
    return;
  }

  loginStatusEl.textContent = "Logger inn...";

  let { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    if (signInError.message.includes("Invalid login credentials")) {
      loginStatusEl.textContent =
        "Bruker finnes ikke – oppretter ny og sender verifisering...";

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href },
        });

      if (signUpError) {
        loginStatusEl.textContent =
          "Feil ved oppretting: " + signUpError.message;
        return;
      }

      loginStatusEl.textContent =
        "Bruker opprettet! Sjekk e-posten din for en bekreftelseslenke.";
      return;
    }

    loginStatusEl.textContent = "Innlogging feilet: " + signInError.message;
    return;
  }

  if (!signInData.user.confirmed_at) {
    loginStatusEl.textContent =
      "E-posten er ikke bekreftet ennå. Sjekk innboksen din.";
    await supabase.auth.signOut();
    return;
  }

  await ensureDisplayName();
  await loadProfileRole();
  updateAuthUI();
  await loadMessages();
});

// Logout buttons
document.getElementById("logout-btn")?.addEventListener("click", async () => {
  await handleLogout();
  updateAuthUI();
});

document
  .getElementById("drawer-logout-btn")
  ?.addEventListener("click", async () => {
    await handleLogout();
    updateAuthUI();
  });

// Messages
document.getElementById("form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  form.classList.add("was-validated");
  if (!form.checkValidity()) return;

  const msg = document.getElementById("content").value;
  await sendMessage(msg);
});

document.getElementById("refresh-btn")?.addEventListener("click", async () => {
  await loadMessages();
});

document.getElementById("clear-btn")?.addEventListener("click", async () => {
  await clearAllMessages();
});

// Navigation
document.getElementById("open-messages")?.addEventListener("click", (e) => {
  e.preventDefault();
  if (!getCurrentUser()) {
    document.getElementById("status").textContent = "Logg inn først.";
    return;
  }
  document.getElementById("portfolio-area")?.classList.add("d-none");
  document.getElementById("app-area")?.classList.remove("d-none");
});

document.getElementById("back-to-portfolio")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("app-area")?.classList.add("d-none");
  document.getElementById("portfolio-area")?.classList.remove("d-none");
});

// Account drawer
document.getElementById("min-side-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  if (!getCurrentUser()) return;
  openAccountDrawer();
});

document
  .getElementById("close-drawer-btn")
  ?.addEventListener("click", closeAccountDrawer);
document
  .getElementById("account-drawer-overlay")
  ?.addEventListener("click", closeAccountDrawer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAccountDrawer();
});

// Initialize
ensureAuthOnLoad().then(() => {
  updateAuthUI();
  loadMessages();
});

// Project 1
const project1Code = `#Oppgave 1.
#Svaret ville vært 0 siden tall varibalene er lik svaret til 13-9 som er 4 og du oppdaterer variabelen med seg selv minus seg selv så det blir 0.

#Oppgave 2.
#B er 19 siden a er større enn 10 som vil si at if løkken blir oppfylt. Da kjører den koden b = a + b som er i 1

#Oppgave 3.
navn = "Oscar"
farge = "Hvit"
by = "Drammen"
print(f"Hei jeg heter {navn}\\nYndlingsfargen min er {farge}. \\nJeg bor i {by}.")

#Oppgave 4.
#< betyr at den er større enn tallet som kommer etter det første. For eksempel 1 < 2 er sant fordi 2 er større enn 1.
#> Derimot betyr at den er mindre enn tallet som kommer etter det første. For eksempel 2 > 1 er sant fordi 2 er større enn 1.
#= betyr at de er like. For eksempel 1 = 1 er sant fordi de er like. Men ikke identiske. det kan være at 3+2=5 er sant,
#== betyr at de er helt identiske. For eksempel 1.4 == 1.4 er sant fordi de er like. Men 3+2 == 5 er ikke sant fordi de ikke er helt identiske.

#Oppgave 5.
# A) Først åpner du terminalen. Så skriver du cd hvis du ikke allerede er i hjemmappen din. Etter det må du skrive cd kode for å åpne mappen. Men du må skrive ls først hvis du ikke vet hva mappen heter.
# B) Du skriver python3 Oscar.py for å kjøre koden i Oscar.py filen. Hvis du ikke er i mappen der Oscar.py ligger, må du skrive cd Prøve først for å åpne mappen. Etter det kan du skrive python3 Oscar.py.
# B)  Det er at det ikke er en python-fil. Det er en png-fil som er et bilde. En python-fil må ha .py som filendelse for at den skal kunne kjøres i python. Så du må endre filnavnet til helloworld.py for at det skal være en gyldig python-fil.

#Oppgave 6.
# Den vil printe hade fordi 4 er ikke større enn 6. Den vil heller ikke printe at det er på tide åskrifte sommerdekk siden 6 er ikke større enn 10.

#Oppgave 7.

score = 0
liste = ["Det var helt riktig", "Det var ikke riktig prøv igjen"]
#Jeg bruker en liste siden da kan jeg skrive 0 og 1 istedenfor rktig og galt. Det gjør det lettere å bruke i koden.
svar = input("Hvem er statsminister i Norge? ")
if svar.lower() == "jonas gahr støre":
    print(liste[0])
    score += 1

else:
    print(liste[1])
print("----------------------------------")
  
#Oppgave 8.
liste = ["a", "b", "c"]
liste.append("d")
for i in range(2):
    print(liste[i])
print("----------------------------------")

#Oppgave 9.
import time
time.sleep(1) 
i = 1
while i <= 10:
    print(i)
    time.sleep(1)
    i += 1
`;

document.getElementById("project1")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("portfolio-area")?.classList.add("d-none");
  document.getElementById("app-area")?.classList.add("d-none");
  document.getElementById("project2-area")?.classList.add("d-none");
  document.getElementById("project3-area")?.classList.add("d-none");
  document.getElementById("project4-area")?.classList.add("d-none");
  document.getElementById("project5-area")?.classList.add("d-none");
  document.getElementById("project1-area")?.classList.remove("d-none");
  const project1Content = document.getElementById("project1-content");
  if (project1Content) project1Content.textContent = project1Code;
  window.scrollTo(0, 0);
});

document.getElementById("project1-back-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("project1-area")?.classList.add("d-none");
  document.getElementById("portfolio-area")?.classList.remove("d-none");
  window.scrollTo(0, 0);
});

// Project 2
const pythonCode = `import random

alle_dager = []

def registrer_vaner(dagens_vaner):
    antall_vaner = int(input("Hvor mange vaner vil du skrive inn i dag? "))
    i = 0
    while i < antall_vaner: 
        vane_navn = input("Skriv inn navnet på vanen: ")
        dagens_vaner.append({"navn": vane_navn, "fullført": False})
        i = i + 1 

def marker_fullførte_vaner(dagens_vaner):
    index = 0
    while index < len(dagens_vaner):
        svar = input("Har du gjort '{}' i dag? Skriv ja eller nei: ".format(dagens_vaner[index]["navn"]))
        if svar == "ja":
            dagens_vaner[index]["fullført"] = True
        else:
            dagens_vaner[index]["fullført"] = False
        index += 1

def vis_status(dagens_vaner):
    fullførte = 0
    for vane in dagens_vaner:
        if vane["fullført"] == True: 
            fullførte += 1
    totalt = len(dagens_vaner)
    print("I dag har du klart {} av {} vaner".format(fullførte, totalt))

def gi_motivasjon(antall=1):
    sitater = [
        "Små steg hver dag gir store resultater",
        "Det du gjør teller, fortsett så godt du kan",
        "Selv små seire er viktige",
        "Tro på deg selv, du klarer mer enn du tror"
    ]
    i = 0
    while i < antall: 
        tilfeldig_index = random.randint(0, len(sitater)-1)
        print("Motivasjon {}: {}".format(i+1, sitater[tilfeldig_index]))
        i += 1

fortsett_program = True

while fortsett_program == True: 
    dagens_vaner = []
    dag_navn = input("Hva heter dagen i dag? ")
    alle_dager.append({"dag": dag_navn, "vaner": dagens_vaner})
    
    registrer_vaner(dagens_vaner)
    marker_fullførte_vaner(dagens_vaner)
    vis_status(dagens_vaner)
    
    gi_motivasjon(1)
    
    svar = input("Vil du skrive inn flere vaner senere? ja/nei: ")
    if svar != "ja":
        fortsett_program = False
        print("Programmet avsluttes for i dag")

print("\\nHer er historikken din over alle dager:")
for dag in alle_dager:
    fullførte = 0;
    totalt = len(dag["vaner"]);
    for vane in dag["vaner"]:
        if vane["fullført"] == True:
            fullførte += 1;
    print("{}: {}/{} vaner fullført".format(dag["dag"], fullførte, totalt));
`;

document.getElementById("project2")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("portfolio-area")?.classList.add("d-none");
  document.getElementById("app-area")?.classList.add("d-none");
  document.getElementById("project3-area")?.classList.add("d-none");
  document.getElementById("project4-area")?.classList.add("d-none");
  document.getElementById("project2-area")?.classList.remove("d-none");
  const codePageContent = document.getElementById("code-page-content");
  if (codePageContent) codePageContent.textContent = pythonCode;
  window.scrollTo(0, 0);
});

document.getElementById("project2-back-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("project2-area")?.classList.add("d-none");
  document.getElementById("portfolio-area")?.classList.remove("d-none");
  window.scrollTo(0, 0);
});

// Project 3
const project3Text = `# Innloggingssystem med Supabase

## Hvordan jeg lagde det

Jeg satt opp et innloggingssystem med Supabase, her er hva jeg gjorde 

## 1. Lagde en profiles-tabell

Først lagde jeg en tabell som kobler hver bruker til en rolle (admin eller vanlig bruker):

\`\`\`sql
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'user',
  created_at timestamptz default now()
);
\`\`\`

Tabellen lagrer:
- id → brukerens unike ID fra Supabase Auth
- role → "admin" eller "user"
- created_at → når profilen ble laget

## 2. Skrudde på RLS

For at brukere bare skal kunne lese sin egen rad:

\`\`\`sql
alter table profiles enable row level security;

create policy "read-own-profile"
on profiles for select using (id = auth.uid());
\`\`\`

## 3. Automatisk profil ved registrering

\`\`\`sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (
    new.id,
    case when lower(new.email) = lower('49johosc@stud.akademiet.no') then 'admin' else 'user' end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
\`\`\`

## 4. JavaScript-koden

Logg inn, eller lag bruker hvis den ikke finnes:

\`\`\`javascript
let { data: signInData, error: signInError } =
  await supabase.auth.signInWithPassword({ email, password });

if (signInError) {
  const { data: signUpData, error: signUpError } =
    await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.href },
    });
}
\`\`\`

Hent rollen:

\`\`\`javascript
async function loadProfileRole() {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();
  
  currentRole = data?.role || "user";
}
\`\`\`

Sjekk om bruker er innlogget ved oppstart:

\`\`\`javascript
async function ensureAuthOnLoad() {
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    currentUser = data.user;
    await loadProfileRole();
    await loadMessages();
  }
}
\`\`\`

## 5. Hvordan alt fungerer

1. Bruker skriver inn e-post og passord  
2. Hvis brukeren finnes → logg inn  
3. Hvis ikke → lag ny bruker  
4. Hent rollen fra profiles  
5. Hvis admin → vis admin-knapper  


## 6. Hvilke kompetansemål
1. administrere brukere, tilganger og rettigheter i relevante systemer
2. utforske og beskrive relevante nettverksprotokoller, nettverkstjenester og serverroller
3. planlegge og dokumentere arbeidsprosesser og IT-løsninger
4. utforske og beskrive relevante nettverksprotokoller, nettverkstjenester og serverroller
5. gjennomføre risikoanalyse av nettverk og tjenester i en virksomhets systemer og foreslå tiltak for å redusere risikoen
`;

document.getElementById("project3")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("portfolio-area")?.classList.add("d-none");
  document.getElementById("app-area")?.classList.add("d-none");
  document.getElementById("project2-area")?.classList.add("d-none");
  document.getElementById("project4-area")?.classList.add("d-none");
  document.getElementById("project3-area")?.classList.remove("d-none");
  const project3Content = document.getElementById("project3-content");
  if (project3Content) {
    if (typeof marked !== "undefined") {
      project3Content.innerHTML = marked.parse(project3Text);
    } else {
      project3Content.innerHTML = `<pre>${project3Text}</pre>`;
    }
  }
  window.scrollTo(0, 0);
});

document.getElementById("project3-back-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("project3-area")?.classList.add("d-none");
  document.getElementById("portfolio-area")?.classList.remove("d-none");
  window.scrollTo(0, 0);
});

// Project 3 Kompetanse
document
  .getElementById("project3-kompetanse")
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("portfolio-area")?.classList.add("d-none");
    document.getElementById("app-area")?.classList.add("d-none");
    document.getElementById("project2-area")?.classList.add("d-none");
    document.getElementById("project3-area")?.classList.add("d-none");
    document.getElementById("project4-area")?.classList.add("d-none");
    document.getElementById("project5-area")?.classList.add("d-none");
    document
      .getElementById("project3-kompetanse-area")
      ?.classList.remove("d-none");
    window.scrollTo(0, 0);
  });

document
  .getElementById("project3-kompetanse-back-btn")
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .getElementById("project3-kompetanse-area")
      ?.classList.add("d-none");
    document.getElementById("portfolio-area")?.classList.remove("d-none");
    window.scrollTo(0, 0);
  });

// Project 4
document.getElementById("project4")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("portfolio-area")?.classList.add("d-none");
  document.getElementById("app-area")?.classList.add("d-none");
  document.getElementById("project2-area")?.classList.add("d-none");
  document.getElementById("project3-area")?.classList.add("d-none");
  document.getElementById("project4-area")?.classList.remove("d-none");
  window.scrollTo(0, 0);
});

document.getElementById("project4-back-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("project4-area")?.classList.add("d-none");
  document.getElementById("portfolio-area")?.classList.remove("d-none");
  window.scrollTo(0, 0);
});

// Project 5
document.getElementById("project5")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("portfolio-area")?.classList.add("d-none");
  document.getElementById("app-area")?.classList.add("d-none");
  document.getElementById("project2-area")?.classList.add("d-none");
  document.getElementById("project3-area")?.classList.add("d-none");
  document.getElementById("project4-area")?.classList.add("d-none");
  document.getElementById("project5-area")?.classList.remove("d-none");
  window.scrollTo(0, 0);
});

document.getElementById("project5-back-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("project5-area")?.classList.add("d-none");
  document.getElementById("portfolio-area")?.classList.remove("d-none");
  window.scrollTo(0, 0);
});
