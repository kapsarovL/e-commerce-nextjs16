import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from '@/lib/uploadthing/core';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    // Optional: override the default Uploadthing upload URL for local dev
    // uploadthingId: process.env.UPLOADTHING_APP_ID,
  },
});
