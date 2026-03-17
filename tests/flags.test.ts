import { describe, expect, it } from "vitest";
import { applyFlagToName } from "../src/core/flags";

describe("flag rules", () => {
  it("覆盖用户指定的地区关键词", () => {
    expect(applyFlagToName("香港 IEPL 01")).toBe("🇭🇰 香港 IEPL 01");
    expect(applyFlagToName("台湾家宽 01")).toBe("🇹🇼 台湾家宽 01");
    expect(applyFlagToName("日本 01")).toBe("🇯🇵 日本 01");
    expect(applyFlagToName("韩国 01")).toBe("🇰🇷 韩国 01");
    expect(applyFlagToName("新加坡 01")).toBe("🇸🇬 新加坡 01");
    expect(applyFlagToName("美国 01")).toBe("🇺🇸 美国 01");
    expect(applyFlagToName("俄罗斯下载专用")).toBe("🇷🇺 俄罗斯下载专用");
    expect(applyFlagToName("菲律宾-ChatGPT支持")).toBe("🇵🇭 菲律宾-ChatGPT支持");
    expect(applyFlagToName("迪拜下载专用")).toBe("🇦🇪 迪拜下载专用");
  });

  it("覆盖英文别名和机场常见缩写", () => {
    expect(applyFlagToName("RU Moscow 01")).toBe("🇷🇺 RU Moscow 01");
    expect(applyFlagToName("MNL Manila 01")).toBe("🇵🇭 MNL Manila 01");
    expect(applyFlagToName("dibai premium 01")).toBe("🇦🇪 dibai premium 01");
  });
});
