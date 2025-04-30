import type { PlopTypes } from "@turbo/gen";

interface ComponentData {
  name: string;
  createStory: boolean;
}

const skipStory = (data: ComponentData) => {
  if (data.createStory === false) {
    return "Skip this step as createStory is set to false.";
  }

  return true;
};

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("component", {
    description: "Adds a new component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the component?",
        validate: (value: string) =>
          value ? true : "Component name is required",
      },
      {
        message: "Do you want to create a Storybook story?",
        type: "confirm",
        name: "createStory",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/ui/src/components/{{ kebabCase name }}.tsx",
        templateFile: "templates/component.hbs",
      },
      {
        type: "add",
        path: "apps/docs/src/{{ kebabCase name }}.stories.tsx",
        templateFile: "templates/story.hbs",
        skip: skipStory,
      },
    ],
  });
}
