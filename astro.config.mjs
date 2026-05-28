// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: cloudflare(),
    site: "https://cashpilot.com",
    integrations: [mdx(), sitemap(), react()],
    vite: {
        plugins: [tailwindcss()],
        ssr: {
            external: ["mysql2"],
        },
    },
});