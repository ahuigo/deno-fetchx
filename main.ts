export * from "./fetch-factory.ts";
export type * from "./fetch-factory.ts";
import { FetchFactory } from "./fetch-factory.ts";

const responseHandler = async <T = any>(response: Response, request: Request): Promise<T> => {
  if (request?.mode == 'no-cors') {
    return "" as T;
  } else if (response?.status) {
    // const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    const text = await response.text();
    let responseObj: any;
    // 1. handle status
    if (status == 401) {
      throw new Error('401');
    }
    // 2. handle json
    try {
      responseObj = JSON.parse(text);
    } catch (e) {
      const errmsg = "can't parse json: " + text + `(${url})`;
      console.error("can't parse json: " + errmsg);
      throw new Error(errmsg);
    }
    return responseObj;
  } else {
    const msg = `can't connect: ${(request?.url)?.slice(0, 200)}`;
    throw msg;
  }
};

function errorHandler(err: any, req: Request) {
  const url = req.url;
  const msg = `can't access: ${url.slice(0, 200)}\n`;
  console.error(err);
  throw { err: msg };
}

export const fetchx = new FetchFactory(
  {
    mode: "cors",
    credentials: 'include', // include cookie
  },
  responseHandler,
  errorHandler,
);

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("refer to fetch_test.ts for usage");
}
