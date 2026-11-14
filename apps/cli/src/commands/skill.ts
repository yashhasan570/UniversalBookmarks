import { Command } from "@commander-js/extra-typings";
import { readFileSync } from "node:fs";

declare const __UNIVERSALBOOKMARKS_SKILL_CONTENT__: string;

const skillContent =
  typeof __UNIVERSALBOOKMARKS_SKILL_CONTENT__ === "string"
    ? __UNIVERSALBOOKMARKS_SKILL_CONTENT__
    : readFileSync(
        new URL("../../../../skills/SKILL.md", import.meta.url),
        "utf8",
      );

export const skillCmd = new Command()
  .name("skill")
  .description("prints the official UniversalBookmarks agent skill")
  .action(() => {
    process.stdout.write(skillContent);
  });
