import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/experimental-nextjs-vite";
import { beforeAll } from "vitest";
import * as projectAnnotations from "./preview.ts";

const project = setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
]);

beforeAll(project.beforeAll);
