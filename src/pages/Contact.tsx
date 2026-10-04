import { useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  );
  const [ref, setRef] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRef(json.reference ?? "");
      setStatus("ok");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-[#3A64C2]";

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[#092E6D] sm:text-4xl">
        Contact Us
      </h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-4 rounded bg-[#E5E5E5] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="name" placeholder="Your name *" className={field} required />
            <input name="company" placeholder="Company" className={field} />
            <input
              name="email"
              type="email"
              placeholder="Email *"
              className={field}
              required
            />
            <input name="phone" placeholder="Telephone" className={field} />
          </div>
          <input name="vessel" placeholder="Vessel / WBS ID of interest" className={field} />
          <textarea
            name="message"
            placeholder="Your enquiry *"
            rows={6}
            className={field}
            required
          />
          <button
            disabled={status === "sending"}
            className="rounded bg-[#092E6D] px-6 py-3 font-bold text-white transition hover:bg-[#072253] disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send Enquiry"}
          </button>
          {status === "ok" && (
            <p className="font-semibold text-green-700">
              Thank you — your enquiry has been received. Reference {ref}.
            </p>
          )}
          {status === "error" && (
            <p className="font-semibold text-red-700">
              Sorry, something went wrong. Please email info@agms.com.ng.
            </p>
          )}
        </form>

        <div className="space-y-3 leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold text-[#092E6D]">
            AGMS Ltd. — Brokerage desk
          </h2>
          <p className="font-semibold">Abideen Olayinka</p>
          <p>S &amp; P Specialist | Chartering | Oil &amp; Gas Broker</p>
          <p>
            #60 Emekuku Street D/Line, Port-Harcourt,
            <br />
            Rivers State, Nigeria.
          </p>
          <p>
            WhatsApp:{" "}
            <a className="text-[#3A64C2]" href="https://wa.me/2348073492253">
              +234 807 349 2253
            </a>
            <br />
            Mob:{" "}
            <a className="text-[#3A64C2]" href="tel:+2348163897314">
              +234 816 389 7314
            </a>
            <br />
            Email:{" "}
            <a className="text-[#3A64C2]" href="mailto:info@agms.com.ng">
              info@agms.com.ng
            </a>
          </p>
          <div className="rounded bg-[#E5E5E5] p-4 text-sm text-slate-600">
            <strong>Disclaimer:</strong> We are business facilitators /
            consultants / brokers and make no warranties or representations as
            to the Owners, Charterers or Transaction. All due diligence is the
            responsibility of the Owners &amp; Charterers. Any disputes between
            Owners &amp; Charterers are clearly as per Charter party / fixture
            note terms which does not affect our role and interest. This letter
            and attached documents are never to be considered a solicitation for
            any purpose in any form or content.
          </div>
        </div>
      </div>
    </div>
  );
}
