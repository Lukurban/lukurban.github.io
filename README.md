# L4U · Lukas Urbanek

Jekyll site for [transportundgarten.de](https://transportundgarten.de).

## Edit content

All copy, links, and the accent color live in **`_data/data.yaml`**.

Change texts, services, FAQ, contact links, or `theme.accent` there. The layout in `_layouts/` stays as-is.

`theme.accent` is the first Orangeton picker color (Sonnenuntergangsorange, `#ed702f`).

## Deploy

The built `_site/` is committed together with a `.nojekyll` marker, so GitHub
Pages serves the files as-is instead of running its own Jekyll build (which
kept erroring). After changing anything, rebuild locally **before** pushing,
otherwise the live site will not change:

    jekyll build

