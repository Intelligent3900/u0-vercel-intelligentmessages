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
    // Extract API key from Authorization header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return createCorsResponse({ error: "Missing or invalid Authorization header" }, 401)
    }

    const apiKey = authHeader.substring(7)
    const base44AppId = process.env.BASE44_APP_ID || "68a25511a9a6f5c923212af5"
    const base44ServiceKey = process.env.BASE44_SERVICE_KEY || "3f5bc1d6323a42cf89a8a6bb2867cebd"

    // Step 1: Validate API key against Base44 Community entity
    const communityResponse = await fetch(`https://base44.app/api/apps/${base44AppId}/entities/Community/filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${base44ServiceKey}`,
      },
      body: JSON.stringify({
        filter: { service_key: { $eq: apiKey } },
      }),
    })

    if (!communityResponse.ok) {
      return createCorsResponse({ error: "Failed to validate API key" }, 500)
    }

    const communities = await communityResponse.json()

    if (!communities || communities.length === 0) {
      return createCorsResponse({ error: "Invalid API key" }, 403)
    }

    const community = communities[0]

    // Step 2: Fetch messages with "sent" status
    const messagesResponse = await fetch(`https://base44.app/api/apps/${base44AppId}/entities/Message/filter`, {
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

    if (!messagesResponse.ok) {
      return createCorsResponse({ error: "Failed to fetch messages" }, 500)
    }

    const messages = await messagesResponse.json()

    // Step 3: Update message status to "delivered"
    if (messages && messages.length > 0) {
      const updatePromises = messages.map(async (message: any) => {
        try {
          await fetch(`https://base44.app/api/apps/${base44AppId}/entities/Message/${message.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${base44ServiceKey}`,
            },
            body: JSON.stringify({
              data: { status: "delivered" },
            }),
          })
        } catch (error) {
          console.error(`Error updating message ${message.id}:`, error)
        }
      })

      await Promise.allSettled(updatePromises)
    }

    return createCorsResponse({
      success: true,
      community: community.name || community.id,
      messages: messages || [],
      count: messages?.length || 0,
    })
  } catch (error) {
    console.error("API error:", error)
    return createCorsResponse({ error: "Internal server error" }, 500)
  }
}
