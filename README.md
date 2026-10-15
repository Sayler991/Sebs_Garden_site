# Seb’s Garden — Kiffane, Tlemcen (maquette de démonstration)

Site une page (FR) + tableau de bord patron pour **Seb’s Garden**, restaurant à Kiffane (Tlemcen, Algérie).
**Maquette de démonstration** — non officielle, réalisée sans contact avec l’établissement. Le site actuel https://sebsgarden.com/ affiche « Site en cours de traveaux » ; aucun de ses textes génériques (« 15+ Chefs Experts », « Chefs Étoilés », témoignages types, plats « signature ») n’est repris.

- Site : https://sayler991.github.io/Sebs_Garden_site/
- Espace patron : https://sayler991.github.io/Sebs_Garden_site/admin/ (compte propriétaire benduy0@gmail.com via `public.owners`)


## v2 (16/10/2026) — refonte « restaurant gastronomique » bleu nuit & or
État précédent : tag `v1` (main) et `v1-gh-pages` (site publié). Palette : bleu nuit #14233C / #35516D, nuit #03040C, or #C9A86A, crème ; ciel étoilé discret dans le hero, note ♪ (clin d’œil jazz).
Faits mis à jour : Google Maps 4,5/5 (787 avis), plus code VMQF+7F, gamme 1 000–6 000 DA, terrasse, cocktails, plats végans ; **fermé temporairement** depuis le 3 octobre (Instagram « Une page se tourne… ») → `business.open=false`, `booking.open=false` (à rebasculer dans l’admin à la réouverture). Horaires : RestosDZ (sam–jeu 11:00–23:00, ven 14:00–23:30) ; trigger SQL aligné (dernière résa 22:00 / ven 22:30). Instagram https://www.instagram.com/restaurant_sebs_garden/ ; Facebook « Restaurant Seb’s Garden » (lien de recherche, URL exacte non vérifiée).
Carte : aucune carte avec prix trouvée (QR « Menu Digital – Plat 3D » → https://www.sebsgarden.com/menu = « Site en cours de travaux, Menu d’été prochainement » ; RestosDZ, Mindtrip, winrouh : pas de carte). Plats listés = vus sur les photos (« prix à venir »).
Photos (plus aucune Pexels) : rdz_* = photos du restaurant via RestosDZ (hero=pizza à la bougie, pizza, brochettes, pates, grillade, dessert, cheesecake, cocktail) ; gm_* = photos clients Google Maps (salle, crevettes, brochettes2). WebP + AVIF 480/800/1600 (plafonnées à la taille source).

## Faits réels utilisés (v1) (relevés le 15/10/2026)
| Fait | Valeur | Source |
|---|---|---|
| Adresse | Kiffane, Tlemcen 13000 | Mindtrip, RestosDZ |
| Coordonnées | 34.888179, -1.326264 | exa.ai/library/place/7g8y37w9wsv (miroir Google Maps) |
| Téléphone / WhatsApp | 05 62 70 62 19 (+213 562 70 62 19) | exa.ai (Google), RestosDZ (WhatsApp) |
| Horaires | lun–mer, sam, dim 12:00–00:00 ; jeu 12:00–00:30 ; ven 16:30–00:30 | exa.ai (Google Maps) |
| Note | 4,6/5 sur 629 avis Google | Mindtrip (exa.ai affiche 4,5/662) |
| Lieu | comptoir sur cuisine ouverte, coin salon avec canapés, musique douce, espace enfants, tables couples/familles | RestosDZ (texte cité mot pour mot) |
| Plats / boissons cités | brochettes bœuf-fromage, steak, pâtes (crevettes, champignons, pesto pistache), sushis, pain farci, cocktails, café, pâtisseries | avis Google (exa.ai, winrouh.com) |
| Avis cités tels quels (anglais) | 3 avis Google (5/5 juil. 2025 ×2, 4/5 déc. 2025) | exa.ai/library/place/7g8y37w9wsv |
| Menu | lien Instagram https://www.instagram.com/p/C812nNGMR6y/ (non lisible sans connexion) — aucun prix publié lisible | exa.ai |

## Éléments provisoires (à confirmer avec le client)
- **Carte et prix** : aucun plat/prix publié lisible → 3 familles (Plats / Entrées & à partager / Boissons & douceurs) + « Carte à venir » ; le patron ajoute articles et prix dans l’admin.
- **Horaires** : d’autres annuaires divergent (winrouh/WinNaklou : 11:30–23:30, ven 16:00 ; RestosDZ : 11:00–23:00, ven 14:00–23:30). Retenus : ceux de la fiche Google.
- Autre numéro vu sur winrouh (+213 43 27 89 01) : non retenu.
- Mindtrip évoque « tajines » et « cadre de jardin » dans un résumé automatique : non affirmé sur le site (au-delà du nom). Pas d’offre « événements » publiée → non mentionnée.
- Réservation : créneaux 30 min, de l’ouverture à 23h00, 1–20 pers., ≤ 60 jours (paramètres de maquette, vérifiés aussi côté base).
- Titres de sections et textes de liaison : rédaction de la maquette.

## Photos (licence Pexels — usage libre, commercial compris ; toutes légendées « Illustration »)
Converties en WebP + AVIF 480/800/1600 px (`site/assets/img/`). Aucune photo de Google ni du site actuel.
- `hero` — Jardin éclairé la nuit : Thang Nguyen — https://www.pexels.com/photo/34160987/
- `terrasse` — Terrasse, guirlandes et plantes : Huỳnh Như Mavi — https://www.pexels.com/photo/37564033/
- `lanternes` — Tables en terrasse aux lanternes : Chris F — https://www.pexels.com/photo/18331431/
- `grill` — Viandes grillées : Malte Luk — https://www.pexels.com/photo/13037139/
- `the` — Thé et menthe : Moussa Idrissi — https://www.pexels.com/photo/30906050/
- `tajine` — Table en terre cuite : Taryn Elliott — https://www.pexels.com/photo/4502970/
- Plan : © contributeurs OpenStreetMap (iframe). Polices Fraunces + Outfit (SIL OFL), auto-hébergées.

## Structure (même pile que Café Dib v2)
- `site/` : index.html, config.js, content.json (secours), assets/, admin/. Scripts classiques, `prefers-reduced-motion` respecté.
- `site/assets/js/live.js` : contenu `sebsgarden.site_content` → `content.json` → HTML ; formulaire réservation / message ; animations.
- `site/admin/` : Réservations, Messages (nouveau / confirmé / honoré / annulé), Clients, Stats, Contenu, Carte & prix, Horaires, Photos, Historique + restauration ; `alerts.js` (temps réel + relève 30 s, son, bannière, notifications).
- `supabase/schema.sql` + `seed.sql` : schéma `sebsgarden` (RLS, propriétaire via `public.is_owner()`, anti-abus par trigger : pot de miel, statut forcé, date ≤ 60 j, heure dans les horaires Africa/Algiers, 20 demandes/min, 3/téléphone/10 min, historique 50 versions, publication realtime). Schéma ajouté aux schémas exposés (liste existante conservée).
- `tools/e2e/` : e2e.js (site en ligne 1440 + 390, envoi réel puis suppression), admin_test.js (faux client Supabase).
