import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@clerk/nextjs/server';

const f = createUploadthing();

async function requireAdminUpload() {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
  if (role !== 'admin') throw new Error('Forbidden — admin role required');

  return { userId };
}

export const ourFileRouter = {
  /**
   * productImages — used in the admin product form.
   * Max 8 images, each up to 4 MB, JPEG/PNG/WebP only.
   * Returns: [{ url: string, key: string, name: string, size: number }]
   */
  productImages: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 8,
      contentDisposition: 'inline',
    },
  })
    .middleware(requireAdminUpload)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
