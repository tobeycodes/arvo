import type { StorybookConfig } from "@storybook/experimental-nextjs-vite";

import { dirname, join } from "node:path";

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/experimental-addon-test"),
    getAbsolutePath("@storybook/addon-storysource"),
    getAbsolutePath("@storybook/addon-designs"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-queryparams"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("storybook-dark-mode"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/experimental-nextjs-vite"),
    options: {},
  },
};

export default config;
