# Powernux — official website

Static website for [Powernux](https://github.com/hakim-AI-hub-88/Powernux): plain **HTML, CSS and JavaScript**,
no framework and no build step. Ready for free hosting on **GitHub Pages**.

### Using another address

The full address is written in the SEO tags (canonical, Open Graph, sitemap, RSS). If you publish under a different
repository name or a custom domain, replace it everywhere:

```bash
grep -rl "hakim-ai-hub-88.github.io/powernux-site/" . | xargs sed -i "s#https://hakim-ai-hub-88.github.io/powernux-site/#https://your-new-address/#g"
```

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
