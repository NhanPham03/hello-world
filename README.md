# hello-world

## License

- **Code**: Licensed under the [GPL-3.0 License](./LICENSE)
- **Content (posts, articles, etc.)**: Licensed under the [Creative Commons BY-NC-SA 4.0 International License](./LICENSE-CONTENT.txt)

## Project Structure

Inside of this Astro project, you'll see the following folders and files:

```text
/
├── public/                       # Public assets (images, fonts, etc.)
│   └── fonts/
│
├── src/
│   ├── components/               # Reusable components
│   │   ├── layout/
│   │   ├── post/
│   │   └── window/
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro      # Global layout
│   │   └── PostLayout.astro      # Post layout
│   │
│   ├── data/post/                # Written content (.md/mdx)
│   │   └── example.{md,mdx}
│   │
│   ├── pages/                    # Pages
│   │
│   ├── scripts/                  # Scripts
│   │
│   ├── styles/                   # CSS files
│   │
│   ├── content.config.ts         # Content collection config
│   └── head.const.ts             # Global head constants
│
└── package.json
```

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install` or `npm i`  | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
