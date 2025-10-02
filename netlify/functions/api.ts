import serverless from "serverless-http";
import { createApp } from "../../server";

export const handler = async (event: any, context: any) => {
  const app = await createApp();
  const serverlessHandler = serverless(app);
  return await serverlessHandler(event, context);
};