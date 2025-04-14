import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

import { playwrightBrowserAgent } from "./agents";

export const mastra: Mastra = new Mastra({
  agents: { playwrightBrowserAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
