import type { Handler } from "@netlify/functions";
import serverless from "serverless-http";
import { createExpressApp } from "../../server/app";

let cachedHandler: Handler | null = null;

export const handler: Handler = async (event, context) => {
  if (!cachedHandler) {
    const { app } = await createExpressApp();
    const expressHandler = serverless(app, { provider: "aws" });
    cachedHandler = (evt, ctx) => expressHandler(evt as any, ctx as any) as any;
  }
  return await cachedHandler(event, context);
};


