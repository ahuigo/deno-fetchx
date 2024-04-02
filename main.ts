export * from "./fetch-factory.ts";
export type * from "./fetch-factory.ts";
import { FetchFactory } from "./fetch-factory.ts";

function errorHandler(err: any, req: Request) {
  const url = req.url;
  const msg = `can't access: ${url.slice(0, 200)}\n`;
  console.error(msg, err);
  throw err;
}

const responseHandler = <T = any>(response: Response, request: Request): Promise<T> => {
  return Promise.resolve(response) as Promise<T>;
};

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
