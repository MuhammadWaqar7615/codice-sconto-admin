import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    // Only Admin can upload images
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user.role || "").toLowerCase();
    if (userRole !== ROLES.ADMIN && userRole !== ROLES.ADMINISTRATION) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const requestedBucket = formData.get("bucket");

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Check if it is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "File must be an image" }, { status: 400 });
    }

    // Limit size to 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine target bucket
    const bucket = requestedBucket || "store-images";
    const sanitizedName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_") : "image.png";
    const storagePath = `uploads/${Date.now()}_${sanitizedName}`;

    if (!supabase) {
      return NextResponse.json(
        { message: "Supabase storage is not configured" },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { message: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Retrieve public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return NextResponse.json(
      {
        url: urlData.publicUrl,
        public_id: storagePath,
        storagePath: storagePath,
        bucket: bucket,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/upload Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
