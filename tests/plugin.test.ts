import { describe, expect, it } from "vitest";
import { createPluginContext, renderPlugin, resolveReleaseBaseUrl } from "../scripts/lib/render-plugin.mjs";

describe("plugin rendering", () => {
  it("生成包含 Script 和 MITM 的插件文件", () => {
    const context = createPluginContext({
      author: "tester",
      homepage: "https://github.com/example/localflag64",
      repository: {
        url: "https://github.com/example/localflag64.git"
      },
      version: "1.2.3"
    });

    const plugin = renderPlugin(context);
    expect(plugin).toContain("#!name= LocalFlag64");
    expect(plugin).toContain("[Script]");
    expect(plugin).toContain("[MITM]");
    expect(plugin).toContain(
      "script-path=https://cdn.jsdelivr.net/gh/example/localflag64@release/localflag64.min.js"
    );
  });

  it("默认回退到 GitHub Release 地址", () => {
    const releaseBase = resolveReleaseBaseUrl({
      homepage: "https://github.com/<owner>/<repo>",
      version: "1.0.0"
    });

    expect(releaseBase).toBe("https://github.com/<owner>/<repo>/releases/latest/download");
  });
});
