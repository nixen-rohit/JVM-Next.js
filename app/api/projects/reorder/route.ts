import { NextRequest, NextResponse } from "next/server";
import { dbQuery, dbExecute } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { serverCache } from "@/lib/serverCache";


// GET - Fetch all published projects with their sort_order
export async function GET(request: NextRequest) {

   console.log("✅ Reorder GET API called");
   
  try {
    const token = request.cookies.get("auth_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = await verifyToken(token);
    if (!auth) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const [projects] = await dbQuery<any[]>(
      `SELECT id, name, slug, sort_order 
       FROM projects 
       WHERE is_published = 1 
       ORDER BY sort_order ASC, created_at ASC`
    );

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects for reorder:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// PUT - Update sort_order for multiple projects
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = await verifyToken(token);
    if (!auth) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { projects } = body;

    if (!projects || !Array.isArray(projects)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Update each project's sort_order in a transaction
    for (const project of projects) {
      await dbExecute(
        "UPDATE projects SET sort_order = ? WHERE id = ?",
        [project.sort_order, project.id]
      );
    }

    // Clear the navbar cache
    if (serverCache.del) {
      serverCache.del('navbar-projects');
    }

    return NextResponse.json({
      success: true,
      message: "Project order updated successfully",
    });
  } catch (error) {
    console.error("Error updating project order:", error);
    return NextResponse.json(
      { error: "Failed to update project order" },
      { status: 500 }
    );
  }
}