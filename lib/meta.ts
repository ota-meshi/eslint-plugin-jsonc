import pkg from "../package.json" with { type: "json" };

export const name = pkg.name;
export const version = pkg.version;
export const namespace = "jsonc";
