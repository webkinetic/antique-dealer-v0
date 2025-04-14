import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 })
    }

    // Use the server-only environment variable
    const apiKey = process.env.IMGBB_API_KEY

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key not configured" }, { status: 500 })
    }

    // Create a new FormData instance for the ImgBB API
    const imgbbFormData = new FormData()
    imgbbFormData.append("image", imageFile)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: imgbbFormData,
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Upload failed with status: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    if (data.success) {
      return NextResponse.json({ success: true, url: data.data.url })
    } else {
      return NextResponse.json({ success: false, error: data.error?.message || "Upload failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in upload API route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
