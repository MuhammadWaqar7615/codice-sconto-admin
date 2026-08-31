import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongo from "@/lib/mongodb";
import { getSession } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import Redirect from "@/models/Redirect";

async function requireAdmin() {
  const session = await getSession();

  if (!session?.user) {
    return { message: "Unauthorized", status: 401 };
  }

  if (session.user.role !== ROLES.ADMIN && session.user.role !== ROLES.ADMINISTRATION) {
    return { message: "Forbidden", status: 403 };
  }

  return null;
}

function normalizeSource(source) {
  const value = String(source || "").trim();
  if (!value) return "";
  if (!value.startsWith("/")) return `/${value}`;
  return value;
}

function normalizeTarget(target) {
  return String(target || "").trim();
}

function isValidTarget(value) {
  const target = normalizeTarget(value);
  if (!target) return false;
  if (target.startsWith("/")) return true;
  try {
    new URL(target);
    return true;
  } catch {
    return false;
  }
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid redirect ID" }, { status: 400 });
    }

    await connectMongo();
    const redirect = await Redirect.findById(id).lean();

    if (!redirect) {
      return NextResponse.json({ message: "Redirect not found" }, { status: 404 });
    }

    return NextResponse.json({ redirect: { ...redirect, _id: redirect._id.toString() } });
  } catch (error) {
    console.error("GET /api/seo/redirects/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid redirect ID" }, { status: 400 });
    }

    await connectMongo();
    const body = await request.json();

    const source = normalizeSource(body.source);
    const target = normalizeTarget(body.target);

    if (!source) {
      return NextResponse.json({ message: "Source path is required." }, { status: 400 });
    }

    if (!target) {
      return NextResponse.json({ message: "Target is required." }, { status: 400 });
    }

    if (!source.startsWith("/")) {
      return NextResponse.json({ message: "Source path must start with /." }, { status: 400 });
    }

    if (!isValidTarget(target)) {
      return NextResponse.json({ message: "Target must be a valid internal path or absolute URL." }, { status: 400 });
    }

    if (source === target) {
      return NextResponse.json({ message: "Source and target cannot be the same." }, { status: 400 });
    }

    const statusCode = Number(body.statusCode || 301);
    if (![301, 302, 307, 308].includes(statusCode)) {
      return NextResponse.json({ message: "Status code must be one of 301, 302, 307, or 308." }, { status: 400 });
    }

    const existing = await Redirect.findOne({ source, _id: { $ne: id } });
    if (existing) {
      return NextResponse.json({ message: "A redirect for this source path already exists." }, { status: 409 });
    }

    const redirect = await Redirect.findByIdAndUpdate(
      id,
      {
        source,
        target,
        statusCode,
        isActive: body.isActive ?? true,
        notes: String(body.notes || "").trim(),
      },
      { new: true, runValidators: true }
    );

    if (!redirect) {
      return NextResponse.json({ message: "Redirect not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Redirect updated successfully.",
      redirect: { ...redirect.toObject(), _id: redirect._id.toString() },
    });
  } catch (error) {
    console.error("PUT /api/seo/redirects/[id] Error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ message: Object.values(error.errors).map((item) => item.message).join(", ") }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ message: "A redirect for this source path already exists." }, { status: 409 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const authError = await requireAdmin();
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid redirect ID" }, { status: 400 });
    }

    await connectMongo();
    const redirect = await Redirect.findByIdAndDelete(id);

    if (!redirect) {
      return NextResponse.json({ message: "Redirect not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Redirect deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/seo/redirects/[id] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
