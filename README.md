# Vidhi Henna Studio

Website for Vidhi Henna Studio: portfolio of past work, services, appointment booking and contact details.

It is a plain HTML/CSS/JavaScript site with no build step, so it can be hosted free on GitHub Pages.

## Updating the site

Almost everything is in **`js/config.js`**:

| What | Where in `js/config.js` |
|---|---|
| Phone, WhatsApp, email, Instagram | top of the file |
| Availability hours | `hours` |
| Services and prices | `services` |
| Portfolio photos | `portfolio` |
| Client reviews | `testimonials` (section is hidden while empty) |

### Adding portfolio photos

1. Upload your photos to `images/portfolio/` (portrait JPGs around 1200px tall work best).
2. Add a line for each in `portfolio`, e.g.
   `{ src: "images/portfolio/bride-priya.jpg", title: "Bridal full hands", category: "bridal" },`
3. Categories: `bridal`, `minimal`, `festive`, `kids`.
4. Delete the sample `.svg` entries and files.

## How booking works

The booking form puts the client's details into a ready-made message and opens WhatsApp (or their email app) addressed to you. The client taps Send, and you confirm the slot.

## Publishing with GitHub Pages

Repository **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)` → Save. The site appears at `https://<username>.github.io/vidhihennastudio/` within a minute or two.

## Files

```
index.html          page structure
css/style.css       design and colours
js/config.js        your details (edit this)
js/main.js          gallery, booking form, menu
images/logo.svg     logo
images/favicon.svg  browser tab icon
images/portfolio/   portfolio photos
```
