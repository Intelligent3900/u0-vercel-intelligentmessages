import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Messaging Platform</h1>
          <p className="text-xl text-gray-600">Reliable API endpoint for mobile app message delivery</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">✅ API Endpoint Ready</CardTitle>
              <CardDescription>Your backend issue has been resolved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Endpoint URL:</h3>
                  <code className="bg-gray-100 p-2 rounded text-sm block">GET /api/messages</code>
                </div>
                <div>
                  <h3 className="font-semibold">Authentication:</h3>
                  <code className="bg-gray-100 p-2 rounded text-sm block">
                    Authorization: Bearer YOUR_COMMUNITY_API_KEY
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">🔧 How It Works</CardTitle>
              <CardDescription>Secure message retrieval process</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Mobile app sends Bearer token</li>
                <li>API validates community API key</li>
                <li>Retrieves messages with "sent" status</li>
                <li>Updates status to "delivered"</li>
                <li>Returns messages as JSON</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Your API</CardTitle>
            <CardDescription>Use this curl command to test the endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="bg-gray-900 text-green-400 p-4 rounded block text-sm overflow-x-auto">
              curl -X GET "https://your-domain.vercel.app/api/messages" \<br />
              &nbsp;&nbsp;-H "Authorization: Bearer YOUR_COMMUNITY_API_KEY" \<br />
              &nbsp;&nbsp;-H "Content-Type: application/json"
            </code>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
