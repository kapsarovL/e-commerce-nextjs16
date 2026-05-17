import { type NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const accept = req.headers.get('accept') ?? '';
  const imageBuffer = await fetchImageBuffer(params.id);

  let format: 'avif' | 'webp' | 'jpeg';
  let contentType: string;

  if (accept.includes('image/avif')) {
    format = 'avif';
    contentType = 'image/avif';
  } else if (accept.includes('image/webp')) {
    format = 'webp';
    contentType = 'image/webp';
  } else {
    format = 'jpeg';
    contentType = 'image/jpeg';
  }

  const optimised = await sharp(imageBuffer)[format]({ quality: 80 }).toBuffer();

  return new NextResponse(new Uint8Array(optimised), {
    headers: {
      'Content-Type': contentType,
      // ✅ Tell CDN to cache separately per Accept header
      Vary: 'Accept',
      // Cache the optimised image for 30 days
      'Cache-Control': 'public, max-age=2592000, immutable',
    },
  });
}

async function fetchImageBuffer(id: string): Promise<Buffer> {
  // fetch from your storage (S3, Cloudinary, etc.)
  const res = await fetch(`https://your-storage.com/images/${id}`);
  return Buffer.from(await res.arrayBuffer());
}
