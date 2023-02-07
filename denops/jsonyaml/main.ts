import * as YAML from "https://deno.land/std@0.170.0/encoding/yaml.ts";
import * as fn from "https://deno.land/x/denops_std@v3.9.1/function/mod.ts";
import { Denops } from "https://deno.land/x/denops_std@v3.9.1/mod.ts";
import * as opt from "https://deno.land/x/denops_std@v3.9.1/option/mod.ts";
import { assertNumber, } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";

// from https://qiita.com/usoda/items/dbedc06fd4bf38a59c48
const stringifyReplacer = (_: unknown, v: unknown) =>
  (!(v instanceof Array || v === null) && typeof v == "object")
    ? Object.keys(v).sort().reduce((r, k) => {
      r[k] = (v as Record<string, unknown>)[k];
      return r;
    }, {} as Record<string, unknown>)
    : v;

export function main(denops: Denops) {
  denops.dispatcher = {
    async jsonYAML(start: unknown, end: unknown) {
      assertNumber(start)
      assertNumber(end)
      const lines = await fn.getline(denops, start, end);
      const obj = JSON.parse(lines.join(""));
      const yaml = YAML.stringify(obj);
      await fn.appendbufline(denops, "%", end, yaml.split("\n").slice(0, -1));
      await fn.deletebufline(denops, "%", start, end);
      await opt.filetype.setLocal(denops, "yaml");
    },
    async yamlJSON(start: unknown, end: unknown) {
      assertNumber(start)
      assertNumber(end)
      const lines = await fn.getline(denops, start, end);
      const obj = YAML.parse(lines.join("\n")); // YAMLは改行に意味があるので\nを含める
      const json = JSON.stringify(obj, stringifyReplacer, 2);
      await fn.appendbufline(denops, "%", end, json.split("\n"));
      await fn.deletebufline(denops, "%", start, end);
      await opt.filetype.setLocal(denops, "json");
    },
  };
}
