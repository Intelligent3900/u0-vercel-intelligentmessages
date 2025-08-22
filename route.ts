import { type NextRequest, NextResponse } from "next/server"

function createCorsResponse(data?: any, status = 200) {
  const response = data ? NextResponse.json(data, { status }) : new NextResponse(null, { status })

  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  response.headers.set("Access-Control-Allow-Credentials", "false")

  return response
}

export async function OPTIONS(request: NextRequest) {
  return createCorsResponse(null, 200)
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] API request started")

    // Extract API key from Authorization header
    const authHeader = request.headers.get("authorization")
    console.log("[v0] Auth header:", authHeader ? "Bearer ***" : "missing")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] Missing or invalid auth header")
      return createCorsResponse({ error: "Missing or invalid Authorization header" }, 401)
    }

    const apiKey = authHeader.substring(7)
    const base44AppId = process.env.BASE44_APP_ID || "68a25511a9a6f5c923212af5"
    const base44ServiceKey = process.env.BASE44_SERVICE_KEY || "3f5bc1d6323a42cf89a8a6bb2867cebd"

    console.log("[v0] Environment variables loaded:", {
      appId: base44AppId ? "present" : "missing",
      serviceKey: base44ServiceKey ? "present" : "missing",
    })

    // Step 1: Validate API key against Base44 Community entity
    console.log("[v0] Starting community validation...")
    const communityUrl = `https://base44.app/api/apps/${base44AppId}/entities/Community/filter`
    console.log("[v0] Community URL:", communityUrl)

    const communityResponse = await fetch(communityUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${base44ServiceKey}`,
      },
      body: JSON.stringify({
        filter: { service_key: { $eq: apiKey } },
      }),
    })

    console.log("[v0] Community response status:", communityResponse.status)
    console.log("[v0] Community response ok:", communityResponse.ok)

    if (!communityResponse.ok) {
      const errorText = await communityResponse.text()
      console.log("[v0] Community validation failed:", errorText)
      return createCorsResponse({ error: "Failed to validate API key", details: errorText }, 500)
    }

    const communities = await communityResponse.json()
    console.log("[v0] Communities found:", communities?.length || 0)

    if (!communities || communities.length === 0) {
      console.log("[v0] No matching community found for API key")
      return createCorsResponse({ error: "Invalid API key" }, 403)
    }

    const community = communities[0]
    console.log("[v0] Using community:", community.id)

    // Step 2: Fetch messages with "sent" status
    console.log("[v0] Starting message fetch...")
    const messagesUrl = `https://base44.app/api/apps/${base44AppId}/entities/Message/filter`
    console.log("[v0] Messages URL:", messagesUrl)

    const messagesResponse = await fetch(messagesUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${base44ServiceKey}`,
      },
      body: JSON.stringify({
        filter: {
          community_id: { $eq: community.id },
          status: { $eq: "sent" },
        },
      }),
    })

    console.log("[v0] Messages response status:", messagesResponse.status)
    console.log("[v0] Messages response ok:", messagesResponse.ok)

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text()
      console.log("[v0] Message fetch failed:", errorText)
      return createCorsResponse({ error: "Failed to fetch messages", details: errorText }, 500)
    }

    const messages = await messagesResponse.json()
    console.log("[v0] Messages found:", messages?.length || 0)

    // Step 3: Update message status to "delivered"
    if (messages && messages.length > 0) {
      console.log("[v0] Starting message status updates...")
      const updatePromises = messages.map(async (message: any) => {
        try {
          const updateUrl = `https://base44.app/api/apps/${base44AppId}/entities/Message/${message.id}`
          const updateResponse = await fetch(updateUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${base44ServiceKey}`,
            },
            body: JSON.stringify({
              data: { status: "delivered" },
            }),
          })
          console.log("[v0] Message update status:", message.id, updateResponse.status)
        } catch (error) {
          console.error(`[v0] Error updating message ${message.id}:`, error)
        }
      })

      await Promise.allSettled(updatePromises)
      console.log("[v0] All message updates completed")
    }

    console.log("[v0] API request completed successfully")
    return createCorsResponse({
      success: true,
      community: community.name || community.id,
      messages: messages || [],
      count: messages?.length || 0,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return createCorsResponse(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      500,
    )
  }
}
