/**
 * Site-wide copy that isn't stored in Supabase. Only `profile_image_url`
 * and `hero_image_url` are admin-editable (per the brief); everything
 * below is template content meant to be edited here directly for a real
 * client. Name/CV content is intentionally a placeholder, not a real
 * person — swap it for the real bio, photo credits and CV before launch.
 */

export const SITE = {
  name: "Prénom Nom",
  role: "Styliste Photo & Direction Artistique",
  labelTopLeft: "Direction artistique",
  labelTopRight: "Scénographie",
  wordmark: "Portfolio",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
];

export const ABOUT_CONTENT = {
  heading: "Salut !",
  paragraphs: [
    "Styliste photo et directrice artistique, je construis des ambiances avant de construire des images. Chaque projet démarre par une question simple : quelle histoire cet objet, ce vêtement, ce lieu a-t-il envie de raconter ?",
    "Mon travail se situe à la croisée du styling, de la scénographie et de la direction artistique — je pense la composition, la matière et la lumière comme un tout, du brief jusqu'au dernier réglage sur le plateau.",
    "Les pages qui suivent rassemblent une sélection de projets récents, entre commandes éditoriales et collaborations plus personnelles.",
  ],
  ctaLabel: "Voir le portfolio →",
  ctaHref: "/",
};

export const CV = {
  name: SITE.name,
  subtitle: SITE.role,
  experience: [
    {
      period: "2023 — Aujourd'hui",
      org: "[Nom du studio / agence]",
      role: "Styliste photo freelance",
    },
    {
      period: "2021 — 2023",
      org: "[Nom de la maison]",
      role: "Assistante direction artistique",
    },
    {
      period: "2019 — 2021",
      org: "[Nom du studio]",
      role: "Styliste junior",
    },
  ],
  education: [
    {
      period: "2018 — 2019",
      org: "[Nom de l'école]",
      role: "Formation styling & direction artistique",
    },
    {
      period: "2015 — 2018",
      org: "[Nom de l'école]",
      role: "Diplôme en design de mode",
    },
  ],
  skills: [
    "Direction artistique",
    "Styling",
    "Scénographie",
    "Recherche d'ambiance",
    "Direction de shooting",
    "Storyboard",
  ],
  software: ["Adobe Photoshop", "Adobe InDesign", "Adobe Lightroom", "Suite Office"],
  languages: ["Français (natif)", "Anglais (courant)"],
};
