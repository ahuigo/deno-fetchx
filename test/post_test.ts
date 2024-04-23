import { assertEquals } from "$std/assert/mod.ts";
import { fetchx, responseJsonHandler } from "$fetchx/main.ts";

Deno.test(async function fetchPostQuery() {
  const res = await fetchx.post("https://httpbin.org/post", {
    params: {
      "name": "Alex",
    },
  }).then((res: Response) => res.json());
  assertEquals(res.args.name, "Alex");
});

Deno.test(async function fetchPostRawData() {
  const rawData = "raw data";
  const res = await fetchx.post("https://httpbin.org/post", {
    data: rawData,
    headers: {
      "Content-Type": "text/plain"
    },
  }).then((res: Response) => res.json());
  assertEquals(res.data, rawData);
});

Deno.test(async function fetchPostFormData() {
  const data = await fetchx<any>("https://httpbin.org/post", {
    method: "POST",
    data: {
      "name": "Alex",
    },
  }).then((res: Response) => res.json());
  assertEquals(data.form.name, "Alex");
});


Deno.test(async function fetchPostJson() {
  const data = await fetchx<any>("https://httpbin.org/post", {
    method: "POST",
    json: {
      "name": "Alex",
    },
  }).then((res: Response) => res.json());
  assertEquals(data.json.name, "Alex");
});
