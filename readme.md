# FetchX
## Example
Refer: https://github.com/ahuigo/deno-fetchx/tree/main/test

## Post json
```
  import {fetchx} from "https://deno.land/x/fetchx@v0.0.4/main.ts";
  const data = await fetchx<any>("https://httpbin.org/post", {
    method: "POST",
    json: {
      "name": "Alex",
    },
  }).then((res: Response) => res.json());
  assertEquals(data.json.name, "Alex");
```
## Post query 

```
  import {fetchx} from "https://deno.land/x/fetchx@v0.0.4/main.ts";

  const res = await fetchx.post("https://httpbin.org/post", {
    params: {
      "name": "Alex",
    },
  }).then((res: Response) => res.json());
  assertEquals(res.args.name, "Alex");
```
## Post raw data
```
  import {fetchx} from "https://deno.land/x/fetchx@v0.0.4/main.ts";

  const rawData = "raw data";
  const res = await fetchx.post("https://httpbin.org/post", {
    data: rawData,
    headers: {
      "Content-Type": "text/plain"
    },
  }).then((res: Response) => res.json());

  assertEquals(res.data, rawData);
```
## Post form data
```
  import {fetchx} from "https://deno.land/x/fetchx@v0.0.4/main.ts";
  const data = await fetchx<any>("https://httpbin.org/post", {
    method: "POST",
    data: {
      "name": "Alex",
    },
  }).then((res: Response) => res.json());
  assertEquals(data.form.name, "Alex");
```