import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { youpiScriptAttrs } from "../lib/youpiScriptAttrs.ts";

describe("youpiScriptAttrs", () => {
  it("builds the SDK src URL and strips trailing slashes", () => {
    assert.equal(
      youpiScriptAttrs("http://localhost:7000/", "k").src,
      "http://localhost:7000/youpi.js",
    );
    assert.equal(
      youpiScriptAttrs("http://localhost:7000", "k").src,
      "http://localhost:7000/youpi.js",
    );
    assert.equal(
      youpiScriptAttrs("https://pay.example.com", "k").src,
      "https://pay.example.com/youpi.js",
    );
  });

  it("sets data-merchant-id to the publishable key (SDK contract)", () => {
    const id = "00000000-0000-0000-0000-000000000001";
    const attrs = youpiScriptAttrs("http://localhost:7000", id);
    assert.equal(attrs.dataMerchantId, id);
    assert.equal(attrs.dataYoupiKey, id);
    assert.equal(attrs.dataCurrency, "INR");
  });

  it("keeps empty checkout URL from producing a broken src", () => {
    assert.equal(youpiScriptAttrs("", "k").src, "/youpi.js");
  });
});
