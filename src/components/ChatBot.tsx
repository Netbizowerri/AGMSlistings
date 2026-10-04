import { useEffect, useRef, useState } from "react";
import { Send, X, MessageCircle, Anchor, Ship } from "lucide-react";

type Msg = { from: "bot" | "user"; text: string };

const GREETING: Msg[] = [
  {
    from: "bot",
    text: "Welcome to AGMS Ltd. 👋 I'm the AGMS assistant. Ask me anything about buying, selling or chartering commercial workboats — or about our brokerage desk in Port-Harcourt.",
  },
];

type Entry = { keys: string[]; answer: string };

const KB: Entry[] = [
  {
    keys: ["hello", "hi", "hey", "good morning", "good afternoon"],
    answer:
      "Hello! How can I help today? I can tell you about our vessel categories, sale & purchase brokerage, chartering, fees, inspections or how to contact Mr. Abideen Olayinka.",
  },
  {
    keys: ["who", "about", "agms", "company", "yourself"],
    answer:
      "AGMS Ltd. is a marine brokerage and consultancy based at #60 Emekuku Street D/Line, Port-Harcourt, Rivers State, Nigeria. We buy, sell and charter commercial workboats worldwide and support oil & gas marine logistics projects.",
  },
  {
    keys: ["contact", "phone", "call", "whatsapp", "email", "address", "reach", "number"],
    answer:
      "You can reach our brokerage desk on:\n• WhatsApp: +234 807 349 2253\n• Mob: +234 816 389 7314\n• Email: info@agms.com.ng\n• Office: #60 Emekuku Street D/Line, Port-Harcourt, Rivers State, Nigeria.",
  },
  {
    keys: ["broker", "abideen", "olayinka", "specialist", "team"],
    answer:
      "Our desk is led by Abideen Olayinka — S & P Specialist, Chartering and Oil & Gas Broker. He handles valuation, marketing, negotiation and fixture documentation for owners and charterers.",
  },
  {
    keys: ["buy", "purchase", "sell", "sale", "s & p", "s&p", "marketing", "list my"],
    answer:
      "For sale & purchase we act as brokers between owners and buyers: we value the vessel, prepare the particulars, market it to our worldwide list, arrange inspections, negotiate the MOA and coordinate delivery. Send us your vessel particulars and we will take it from there.",
  },
  {
    keys: ["charter", "hire", "time charter", "bareboat", "fixture"],
    answer:
      "We arrange time charter, trip charter and bareboat on tugs, barges, crew vessels, dredgers, OSVs and passenger craft. Fixture terms are always documented in a charter party / fixture note between the principals.",
  },
  {
    keys: ["fee", "commission", "cost", "charge", "price", "p oa", "poa"],
    answer:
      "Commission and brokerage fees are agreed on a case-by-case basis and confirmed in writing before we act. Many listings show 'POA' (price on application) — just ask us and we will give you the vendor's guide price.",
  },
  {
    keys: ["categor", "type of", "vessel types", "boats", "what do you", "available"],
    answer:
      "We list 28 categories including Barges, Cargo, Crane Barge, Crew vessels, Dive Vessels, Dredgers, Fire Fighting Vessels, Fishing Boats, Guard / Safety, Jack up Barges, Landing craft, Marine plant & equipment, Multi Purpose, Multicat, Passenger Ferries, Patrol boats, Pilot boats, Pollution control, Project vessel, Ribs & Tenders, Semi submarine, Supply Vessel, Survey, Tankers and Tugs. Use Vessel Search to filter by category.",
  },
  {
    keys: ["inspect", "survey", "viewing", "visit", "condition"],
    answer:
      "Inspections can be arranged worldwide with the owner's local agent or attending superintendent. We recommend an independent condition survey before any purchase — all due diligence is the responsibility of the buyer and seller.",
  },
  {
    keys: ["where", "location", "nigeria", "port harcourt", "operate", "region"],
    answer:
      "AGMS Ltd. is based in Port-Harcourt, Rivers State, Nigeria, and brokers vessels across Europe, West Africa, the Middle East and Asia — including the UK, North Sea, Baltic, Mediterranean, Black Sea and South East Asia.",
  },
  {
    keys: ["document", "paperwork", "title", "registry", "class"],
    answer:
      "We assist with the sales agreement, class and registry records, delivery protocol and hand-over documents. Ownership transfer formalities remain the responsibility of the Owners & Charterers.",
  },
  {
    keys: ["legal", "disclaimer", "confidential", "terms", "condition", "warranty"],
    answer:
      "Legal statement: we are business facilitators / consultants / brokers and make no warranties or representations as to the Owners, Charterers or Transaction. All due diligence is the responsibility of the Owners & Charterers, and any disputes are strictly as per charter party / fixture note terms. Full wording is on our Legal Statement page.",
  },
  {
    keys: ["how to", "sell my", "add listing", "submit", "send particulars"],
    answer:
      "To list a vessel: email the particulars (type, LOA, beam, draft, build year, class, location, price expectations and photos) to info@agms.com.ng, or use the Contact Us form. We respond within one working day.",
  },
  {
    keys: ["time", "hour", "open", "respond", "reply"],
    answer:
      "Our desk is open Monday to Saturday, 08:00–18:00 WAT. Enquiries received outside those hours are answered the next working day.",
  },
  {
    keys: ["thank", "thanks", "great", "ok"],
    answer:
      "You're very welcome. If you'd like a specific vessel or a quotation, our broker will respond personally at info@agms.com.ng or on WhatsApp +234 807 349 2253.",
  },
];

const QUICK = [
  "What vessel types do you have?",
  "How do I sell my vessel?",
  "Charter a tug",
  "Contact the broker",
];

function reply(input: string): string {
  const text = input.toLowerCase();
  let best: Entry | null = null;
  let bestScore = 0;
  for (const e of KB) {
    const score = e.keys.reduce(
      (acc, k) => (text.includes(k) ? acc + k.length : acc),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      best = e;
    }
  }
  return best
    ? best.answer
    : "Thanks for your message. I can help with vessel availability, sale & purchase, chartering, inspections and contact details. For anything specific, our broker replies personally at info@agms.com.ng or WhatsApp +234 807 349 2253.";
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(GREETING);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("agms:open-chat", handler);
    return () => window.removeEventListener("agms:open-chat", handler);
  }, []);

  useEffect(() => {
    const container = messagesRef.current;
    if (open && container) {
      // Scroll only the conversation, never the page behind the chat.
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [msgs, typing, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMsgs((m) => [...m, { from: "user", text: clean }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text: reply(clean) }]);
    }, 550);
  }

  return (
    <>
      {/* Mobile uses the sticky footer; only desktop needs a launcher. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with AGMS"}
        aria-expanded={open}
        aria-controls="agms-chat"
        className={`fixed bottom-8 right-8 z-50 hidden h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition hover:scale-105 active:scale-95 lg:flex ${
          open ? "bg-[#3A64C2]" : "bg-[#092E6D]"
        }`}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* panel */}
      <div
        id="agms-chat"
        className={`fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 z-50 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 transition-all duration-300 lg:bottom-28 lg:right-8 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ height: "min(28rem, calc(100dvh - 8rem - env(safe-area-inset-bottom)))" }}
        role="dialog"
        aria-label="AGMS chat assistant"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="flex shrink-0 items-center gap-3 bg-[#092E6D] px-4 py-3 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCC00] text-[#092E6D]">
            <Anchor size={18} />
          </span>
          <div>
            <p className="font-bold leading-tight">AGMS Assistant</p>
            <p className="flex items-center gap-1 text-xs text-white/75">
              <Ship size={12} /> Online · usually replies instantly
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div
          ref={messagesRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#F1F3F7] px-3 py-4"
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                m.from === "bot"
                  ? "rounded-bl-sm bg-white text-slate-700"
                  : "ml-auto rounded-br-sm bg-[#3A64C2] text-white"
              }`}
            >
              {m.text}
            </div>
          ))}
          {typing && (
            <div className="flex w-16 items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-slate-200 bg-white px-3 py-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="whitespace-nowrap rounded-full border border-[#3A64C2]/40 px-3 py-1.5 text-xs font-medium text-[#092E6D] transition hover:bg-[#3A64C2] hover:text-white"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-3 py-2.5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Your message"
            placeholder="Type your message…"
            className="min-w-0 flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#3A64C2]"
          />
          <button
            type="submit"
            aria-label="Send"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#092E6D] text-white transition hover:bg-[#3A64C2]"
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    </>
  );
}
