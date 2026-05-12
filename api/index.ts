// @ts-ignore
import appPromise from "../server/src/app";

// Vercel expects the express app to be exported as a handler for serverless functions.
// We export an async function to ensure any top-level await in app.ts is resolved.
export default async (req: any, res: any) => {
  try {
    const app = await appPromise;
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Function Error:", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
