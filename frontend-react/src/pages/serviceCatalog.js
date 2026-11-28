const iconAsset = (filename) => `${import.meta.env.BASE_URL}images/icons/${filename}`;

export const serviceCatalog = [
  {
    id: "financial-services",
    title: "Financial Services",
    description: "Financial solutions for your needs",
    icon: "bank",
    services: [
      {
        name: "Housing Loan",
        icon: "home",
        image: iconAsset("housing-loan.jpeg"),
      },
      {
        name: "Mudra Loan",
        icon: "briefcase",
        image: iconAsset("PR-upto5.png"),
      },
      {
        name: "Property Loan",
        icon: "building",
        image: iconAsset("property-loan.jpeg"),
      },
      {
        name: "Personal Loan",
        icon: "user",
        image: iconAsset("personal-loan.jpeg"),
      },
      {
        name: "Business Loan – Secured",
        icon: "briefcase",
        image: iconAsset("bl-secured.jpeg"),
      },
      {
        name: "Business Loan – Unsecured",
        icon: "briefcase",
        image: iconAsset("bl-unsecured.jpeg"),
      },
      {
        name: "Take Over Loan",
        icon: "exchange",
        image: iconAsset("Takeover-loan.png"),
      },
      {
        name: "MSME Loan",
        icon: "building",
        image: iconAsset("MSME-loan.png"),
      },
    ],
  },
  {
    id: "legal-services",
    title: "Legal Services",
    description: "Documentation, registration and compliance services.",
    icon: "file",
    services: [
      {
        name: "CIBIL Report",
        icon: "report",
        image: iconAsset("Cibil.png"),
      },
      {
        name: "MSME",
        icon: "building",
        image: iconAsset("MSME.png"),
      },
      {
        name: "Mudra Project Report (up to ₹5 lakh)",
        icon: "file",
        image: iconAsset("PR-upto5.png"),
      },
      {
        name: "Mudra Project Report (above ₹5 lakh)",
        icon: "file",
        image: iconAsset("PR-above5.png"),
      },
      {
        name: "GST Registration",
        icon: "receipt",
        image: iconAsset("GST.png"),
      },
      {
        name: "ITR – Income Tax Filing",
        icon: "file",
        image: iconAsset("ITR.png"),
      },
      {
        name: "FSSAI Registration Fee",
        icon: "certificate",
        image: iconAsset("FSSAI.png"),
      },
      {
        name: "FSSAI License Fee",
        icon: "shield",
        image: iconAsset("FSSAI.png"),
      },
      {
        name: "FSSAI Registration Modification",
        icon: "file",
        image: iconAsset("FSSAI.png"),
      },
      {
        name: "FSSAI License Modification",
        icon: "shield",
        image: iconAsset("FSSAI.png"),
      },
      {
        name: "FSSAI Manufacture Registration",
        icon: "certificate",
        image: iconAsset("FSSAI.png"),
      },
      {
        name: "FSSAI Manufacture License",
        icon: "shield",
        image: iconAsset("FSSAI.png"),
      },
      {
        name: "Import Export Code",
        icon: "world",
        image: iconAsset("import-export.png"),
      },
      {
        name: "ISO Certificate",
        icon: "certificate",
        image: iconAsset("ISO.png"),
      },
      {
        name: "Private Limited Company Registration",
        icon: "building",
        image: iconAsset("PVT-LTD.png"),
      },
      {
        name: "Partnership Registration Only",
        icon: "users",
        image: iconAsset("partner-reg.png"),
      },
      {
        name: "Partnership Without Registration (PAN + Deed)",
        icon: "file",
        image: iconAsset("partnership-without-reg.png"),
      },
      {
        name: "Partnership With Registration (REG + PAN + Deed)",
        icon: "report",
        image: iconAsset("partnership-with-reg.png"),
      },
      {
        name: "Limited Liability Partnership Registration (LLP)",
        icon: "building",
        image: iconAsset("LLP.png"),
      },
      {
        name: "Trademark - Individual, MSME (Without Track Records)",
        icon: "trademark",
        image: iconAsset("Trademark.png"),
      },
      {
        name: "Trademark - Individual, MSME (With Track Records)",
        icon: "trademark",
        image: iconAsset("Trademark.png"),
      },
      {
        name: "Trademark - LLP/Co/PS (Other Than MSME Without Track Records)",
        icon: "trademark",
        image: iconAsset("Trademark.png"),
      },
      {
        name: "Trademark - LLP/Co/PS (Other Than MSME With Track Records)",
        icon: "trademark",
        image: iconAsset("Trademark.png"),
      },
      {
        name: "Trademark - Ownership Change",
        icon: "trademark",
        image: iconAsset("Trademark.png"),
      },
      {
        name: "PCC - Police Clearance Certificate",
        icon: "shield",
        image: iconAsset("PCC.png"),
      },
      {
        name: "Vyapar Mithra",
        icon: "user",
        image: iconAsset("vyaparmithra.png"),
      },
      {
        name: "Vyapar Mithra Plus",
        icon: "user",
        image: iconAsset("vyaparmithra-plus.png"),
      },
      {
        name: "Vyapar Mithra All In One",
        icon: "user",
        image: iconAsset("vyaparmithra-allinone.png"),
      },
    ],
  },
  {
    id: "business-development",
    title: "Business Development",
    description: "Business opportunities and partnership programmes.",
    icon: "briefcase",
    services: [
      {
        name: "Business Associate",
        icon: "users",
        image: iconAsset("BA.png"),
      },
      {
        name: "Premium Franchise",
        icon: "store",
        image: iconAsset("PF.png"),
      },
      {
        name: "Normal Franchise",
        icon: "building",
        image: iconAsset("NF.png"),
      },
      {
        name: "Virtual Franchise",
        icon: "world",
        image: iconAsset("VF.png"),
      },
    ],
  },
  {
    id: "jaytrade-jobs",
    title: "Jaytrade Jobs",
    description: "Explore our registration and employment-related services.",
    icon: "school",
    services: [
      {
        name: "Udyog Registration",
        icon: "report",
        image: iconAsset("Udyog.png"),
      },
      {
        name: "Udyog Plus Registration",
        icon: "shield",
        image: iconAsset("Udplus.png"),
      },
      {
        name: "Standard Registration",
        icon: "file",
        image: iconAsset("Standard.png"),
      },
      {
        name: "Corporate Plus",
        icon: "building",
        image: iconAsset("Corporate.png"),
      },
    ],
  },
  {
    id: "jaytrade-times",
    title: "Jaytrade Times & Technologies",
    description: "Media, advertising and technology solutions.",
    icon: "news",
    services: [
      {
        name: "Growup Package",
        icon: "briefcase",
        image: iconAsset("growup.png"),
      },
      {
        name: "Standard Package",
        icon: "file",
        image: iconAsset("ST.png"),
      },
      {
        name: "Premium Package",
        icon: "certificate",
        image: iconAsset("premium.png"),
      },
      {
        name: "Corporate Package",
        icon: "building",
        image: iconAsset("Corp.png"),
      },
    ],
  },
];

const serviceDestinations = {
  "financial-services": "onSelectService",
  "legal-services": "onSelectLegalService",
  "business-development": "onSelectService",
  "jaytrade-jobs": "onOpenJobs",
  "jaytrade-times": "onOpenTimes",
};

export function selectCatalogService(categoryId, service, handlers) {
  const action = serviceDestinations[categoryId];
  if (action === "onOpenJobs" || action === "onOpenTimes") handlers[action]?.();
  else handlers[action]?.(service);
}
