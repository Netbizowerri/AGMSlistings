import { ReactNode } from "react";
import { useSeo } from "../lib/seo";

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <h1 className="mb-5 text-3xl font-bold text-[#092E6D] sm:text-4xl">
        {title}
      </h1>
      <div className="space-y-4 leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}

export function About() {
  useSeo({
    title: "About AGMS Ltd. — Marine Brokerage in Port Harcourt, Nigeria",
    description:
      "AGMS Ltd. is a marine brokerage and consultancy in Port Harcourt, Nigeria, helping owners and charterers buy, sell and charter commercial workboats worldwide.",
    path: "/about",
  });
  return (
    <Page title="About us">
      <p>
        AGMS Ltd. is a marine brokerage and consultancy working in the
        commercial marine markets — helping vessel owners, builders, charterers
        and brokers to buy, sell and charter workboats worldwide.
      </p>
      <p>
        We market tugs, barges, crew transfer vessels, dredgers, offshore
        support vessels, passenger craft and multi-purpose workboats, connecting
        principals quickly and discreetly across Europe, West Africa, the Middle
        East and Asia.
      </p>
      <h2 className="pt-3 text-2xl font-bold text-[#092E6D]">
        Sale &amp; Purchase, Chartering
      </h2>
      <p>
        Our brokerage desk is led by Abideen Olayinka, S &amp; P Specialist,
        Chartering and Oil &amp; Gas Broker, supporting owners and charterers
        with valuation, marketing, negotiation and fixture documentation from
        our office in Port-Harcourt, Rivers State, Nigeria.
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>Sale &amp; purchase brokerage of commercial workboats</li>
        <li>Time charter, bareboat and spot chartering</li>
        <li>Newbuilding and resale introductions</li>
        <li>Marine logistics support for oil &amp; gas projects</li>
      </ul>
    </Page>
  );
}

export function Privacy() {
  useSeo({
    title: "Privacy Policy — AGMS Ltd.",
    description:
      "How AGMS Ltd. collects, uses and protects personal information submitted through vessel enquiry forms.",
    path: "/privacy",
  });
  return (
    <Page title="Privacy Policy">
      <p>
        We respect your privacy. Personal information submitted through our
        enquiry forms (name, company, email, telephone) is used solely to
        respond to your vessel enquiry and to provide brokerage services.
      </p>
      <p>
        We do not sell or rent personal data to third parties. Details may be
        shared with the relevant owner, charterer or their broker only where
        necessary to progress your enquiry.
      </p>
      <p>
        Our site uses minimal cookies for basic analytics and anti-spam
        protection. You may request access to, correction of, or deletion of
        your data at any time by writing to info@agms.com.ng.
      </p>
    </Page>
  );
}

export function Legal() {
  useSeo({
    title: "Legal Statement & Disclaimer — AGMS Ltd.",
    description:
      "Confidentiality notice and disclaimer for AGMS Ltd., marine brokerage and consultancy, Port Harcourt, Nigeria.",
    path: "/legal",
  });
  return (
    <Page title="Legal Statement">
      <h2 className="text-xl font-bold text-[#092E6D]">Confidentiality Notice</h2>
      <p>
        This transmission (the e-mail and all attachments) contains confidential
        information which may also be subject to legal professional or other
        privilege. If you are not the named addressee, or if this transmission
        has been addressed to you in error, you should not disseminate,
        distribute or copy it. Please notify the sender immediately by e-mail if
        you have received this transmission by mistake and delete it from your
        system. Delivery of this transmission to any person other than the
        intended recipient(s) does not waive confidentiality or privilege.
      </p>
      <h2 className="pt-3 text-xl font-bold text-[#092E6D]">Disclaimer</h2>
      <p>
        We are business facilitators / consultants / brokers and make no
        warranties or representations as to the Owners, Charterers or
        Transaction. All due diligence is the responsibility of the Owners
        &amp; Charterers. Any disputes between Owners &amp; Charterers are
        clearly as per Charter party / fixture note terms which does not affect
        our role and interest.
      </p>
      <p>
        This e-mail letter and the attached related documents are never to be
        considered a solicitation for any purpose in any form or content. Upon
        receipt of these documents, the recipient hereby acknowledges this
        disclaimer.
      </p>
      <p>
        All vessel particulars are given in good faith but without guarantee and
        are offered subject to prior sale, charter or withdrawal without notice.
      </p>
    </Page>
  );
}
