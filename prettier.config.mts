import { type Config } from "prettier";

const prettierConfig: Config = {
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  printWidth: 100,
  tabWidth: 2,
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      "files": ["*.astro"],
      options: {
        parser: "astro",
      },
    }
  ],
};

export default prettierConfig;