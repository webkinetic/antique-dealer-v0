/**
 * Client-side utility to upload an image using the API route
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    // Create a FormData instance
    const formData = new FormData()
    formData.append("image", file)

    // Call the API route
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.url) {
      throw new Error(data.error || "Upload failed")
    }

    return data.url
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}
