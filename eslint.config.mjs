import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    // don't lint any of these paths
    globalIgnores(["**/*.js*", "**/*config.js", "**/*config.ts", "/vendor/*", "/node_modules/*", ".storybook", "/public/*"]),
    // don't lint recursively, and don't lint the router's generated routes
    { ignores: ["eslint.config.mjs", "/resources/src/static/router/*"] },
    {
        files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        settings: {
            react: {
                version: "19.1.1",
            },
        },
        rules: {
            // The 'recommended' rule list is pretty sparse, and the 'all' is unusable, so we pick and choose.
            // See https://github.com/jsx-eslint/eslint-plugin-react?tab=readme-ov-file#list-of-supported-rules for a complete list
            "react/boolean-prop-naming": "error",
            "react/button-has-type": "error",
            "react/checked-requires-onchange-or-readonly": "error",
            "react/jsx-boolean-value": ["error", "always"],
            "react/jsx-no-constructed-context-values": "error",
            "react/jsx-no-script-url": "error",
            "react/jsx-no-useless-fragment": "warn",
            "react/jsx-pascal-case": "error",
            "react/jsx-props-no-spread-multi": "error",
            "react/no-adjacent-inline-elements": "error",
            "react/no-array-index-key": "error",
            "react/no-danger": "error",
            "react/no-namespace": "error",
            "react/no-unstable-nested-components": "error",
            "react/no-unused-state": "error",
            "react/self-closing-comp": "error",
            "react/style-prop-object": "error",
            "react/void-dom-elements-no-children": "error",

            /**
             * Disabled rules
             */

            // Removed apostrophes and double quotes from the forbidden list. '{"I\'ve"}' is harder to read than 'I've'.
            "react/no-unescaped-entities": "off",

            // This older pattern of defining default property types is made obsolete with Typescript.
            "react/prop-types": "off",
        },
    },

    {
        /**
         * Activated rules.
         */

        rules: {
            "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
        },
    },
    {
        /**
         * Disabled rules.
         *
         * When two disabled rules are grouped together, it's because they are coupled and both need to be disabled.
         * Assume the comment applies for both.
         */
        rules: {
            // Overly restricts template strings from containing numbers or coalescers.
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-base-to-string": "off",

            // This would require most arrow functions to use enclosing braces.
            "@typescript-eslint/no-confusing-void-expression": "off",

            // We often call async promises without expecting a return - i.e: when navigating to a new page.
            "@typescript-eslint/no-floating-promises": "off",

            // We often have an onClick call a navigation promise.
            "@typescript-eslint/no-misused-promises": "off",

            // We often have mutations that throw a Promise rejection, and have the client compose the error seperately.
            "prefer-promise-reject-errors": "off",
            "@typescript-eslint/prefer-promise-reject-errors": "off",

            // There are times in densely nested code where '!thing' is more easily missed than 'thing === false'
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",

            // React hooks often provide unbound methods without a 'this' object
            "@typescript-eslint/unbound-method": "off",

            // Both React Suspense and Tanstack router throw objects that aren't errors.
            "no-throw-literal": "off",
            "@typescript-eslint/only-throw-error": "off",

            // We use empty arrow functions as occaisional default params
            "no-empty-function": "off",
            "@typescript-eslint/no-empty-function": "off",

            // While definitely safer, it's onerous to have to define the shape of every object returned from the backend.
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",

            // This prevents accessing properties from an <any> object.
            // We should refactor <any> uses so we can eventually re-enable this rule.
            "@typescript-eslint/no-unsafe-assignment": "off",
        },
    }
);
