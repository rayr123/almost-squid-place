import { sdk } from "./deps.ts";

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - object with request body data
    'env' - object with environment variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200
  
  If an error is thrown, a response with code 500 will be returned.
*/

export default async function (req: any, res: any) {
  const client = new sdk.Client();

  const payload = JSON.parse(req.payload || "{}");

  if (!payload.x || !payload.y) {
    return res.json({
      success: false,
      message: "Please select location.",
    });
  }

  payload.x = +payload.x;
  payload.y = +payload.y;

  if (!payload.x || !payload.y) {
    return res.json({
      success: false,
      message: "Please select valid location.",
    });
  }

  if (!payload.hex) {
    payload.hex = "000000";
  }

  payload.hex = payload.hex.split("#").join("");

  const pixelId = `${payload.x}_${payload.y}`;

  let database = new sdk.Database(client);

  client
    .setEndpoint(req.env["APPWRITE_FUNCTION_ENDPOINT"] as string)
    .setProject(req.env["APPWRITE_FUNCTION_PROJECT_ID"] as string)
    .setKey(req.env["APPWRITE_FUNCTION_API_KEY"] as string);

  try {
    await database.getDocument("pixelsPublic", pixelId);
    await database.updateDocument("pixelsPublic", pixelId, {
      hex: payload.hex,
      userId: req.env["APPWRITE_FUNCTION_USER_ID"],
      createdAt: Date.now(),
    });
  } catch (err) {
    await database.createDocument("pixelsPublic", pixelId, {
      hex: payload.hex,
      userId: req.env["APPWRITE_FUNCTION_USER_ID"],
      createdAt: Date.now(),
      y: payload.y,
      x: payload.x,
    });
  }

  return res.json({
    success: true,
  });
}
