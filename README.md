# Powernux — official website

Static website for [Powernux](https://github.com/hakim-AI-hub-88/Powernux): plain **HTML, CSS and JavaScript**,
no framework and no build step. Ready for free hosting on **GitHub Pages**.

## Preview locally

```bash
cd powernux-site
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly works too, but the 3D scene needs a local server because it uses JavaScript modules.)

## Deploy on GitHub Pages (free)

1. Create a **public** repository named `powernux-site` on GitHub and push this folder:
   ```bash
   git init && git add -A && git commit -m "Powernux website"
   git branch -M main
   git remote add origin https://github.com/hakim-AI-hub-88/powernux-site.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `/ (root)`** → Save.
3. After about a minute the site is live at **https://hakim-ai-hub-88.github.io/powernux-site/**.

### Using another address

The full address is written in the SEO tags (canonical, Open Graph, sitemap, RSS). If you publish under a different
repository name or a custom domain, replace it everywhere:

```bash
grep -rl "hakim-ai-hub-88.github.io/powernux-site/" . | xargs sed -i "s#https://hakim-ai-hub-88.github.io/powernux-site/#https://your-new-address/#g"
```

## SEO checklist after publishing

- Add the site to **Google Search Console** and submit `sitemap.xml`.
- Add it to **Bing Webmaster Tools** (also feeds DuckDuckGo).
- Link the website from the Powernux README and your LinkedIn profile.
- Publish new blog articles regularly (copy an existing file in `blog/`, then add it to `blog/index.html`,
  `sitemap.xml` and `rss.xml`).

## Structure

```
index.html          Home: 3D hero, install terminal, features, tools, screenshots, FAQ, author
docs.html           Full documentation (install, tools, shortcuts, AI keys, run from source, create a tool…)
download.html       Packages for every distribution and processor (recommends the right one)
blog/               Articles (SEO)
404.html            Not-found page
assets/css/         Styles
assets/js/main.js   Interactions (typing terminal, copy buttons, tabs, tilt, reveal…)
assets/js/hero3d.js 3D planet (Three.js)
assets/vendor/      Three.js (minified subset, MIT license)
assets/fonts/       Inter & JetBrains Mono (SIL Open Font License)
assets/img/         Logo, Open Graph image, screenshots
sitemap.xml · rss.xml · robots.txt · site.webmanifest · favicon.svg · .nojekyll
```

## Credits

Icons: [Font Awesome Free](https://fontawesome.com) (CC BY 4.0). 3D: [Three.js](https://threejs.org) (MIT).
Fonts: Inter and JetBrains Mono (SIL OFL 1.1).

© Es-somid Abdelhakim — [GitHub](https://github.com/hakim-AI-hub-88) · [LinkedIn](https://ma.linkedin.com/in/abdelhakim-essomid)
