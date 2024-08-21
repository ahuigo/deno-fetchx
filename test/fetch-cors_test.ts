import { assertEquals } from "$std/assert/mod.ts";
import fetchx from "$fetchx/main.ts";

Deno.test('fetch-cors-nocookie', async function () {
  const res = await fetchx.
    setCredentials('omit').
    setMode('cors').
    post("https://httpbin.org/post", {
      params: {
        "name": "Alex",
      },
      // credentials: 'omit', // is ok
      mode: "cors",
    }).then((res: Response) => res.json());
  assertEquals(res.args.name, "Alex");
});