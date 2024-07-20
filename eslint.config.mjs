import globals from "globals";
import pluginJs from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "src/app/app.guard.ts",
      "src/app/auth.service.ts",
      "src/app/components/header/header.component.ts",
      "src/app/pages/main/home/home.component.ts",
      "src/app/pages/main/login/login.component.ts",
      "src/app/pages/main/main.component.ts"
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.browser,
      parser: tsParser
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-console": "off",
      "no-debugger": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-undef": "off"
    }
  },
  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        expect: "readonly"
      }
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  },
  pluginJs.configs.recommended
];
