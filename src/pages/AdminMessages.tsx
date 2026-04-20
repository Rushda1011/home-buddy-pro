import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Mail, User, Clock, CheckCircle2 } from "lucide-react"
import { getMessages, updateMessageStatus, Message } from "@/lib/data-service"
import { toast } from "sonner"

const AdminMessages = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const loadMessages = async () => {
        setIsLoading(true)
        const data = await getMessages()
        setMessages(data)
        setIsLoading(false)
    }

    useEffect(() => {
        loadMessages()
    }, [])

    const handleMarkAsReplied = async (id: string) => {
        await updateMessageStatus(id, 'replied')
        toast.success("Message marked as replied")
        loadMessages()
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar variant="dashboard" />
            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Message Center</h1>
                        <p className="text-muted-foreground">Manage inquiries from potential residents.</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                        {messages.filter(m => m.status === 'unread').length} Unread
                    </Badge>
                </div>

                {isLoading ? (
                    <div className="grid gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 w-full rounded-xl bg-muted animate-pulse" />
                        ))}
                    </div>
                ) : messages.length > 0 ? (
                    <div className="grid gap-6">
                        {messages.map((msg) => (
                            <Card key={msg.id} className={`overflow-hidden transition-all duration-300 ${msg.status === 'unread' ? 'border-primary/30 shadow-md' : 'opacity-80'}`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {msg.firstName[0]}{msg.lastName[0]}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{msg.firstName} {msg.lastName}</CardTitle>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {msg.email}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(msg.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={msg.status === 'unread' ? 'default' : 'success'}>
                                        {msg.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="bg-muted/20 p-4 rounded-lg border border-border/50 mb-4 whitespace-pre-wrap">
                                        <p className="text-foreground">{msg.message}</p>
                                    </div>
                                    {msg.status === 'unread' && (
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.location.href = `mailto:${msg.email}?subject=Inquiry Response - Home Buddy Pro`}
                                            >
                                                Send Email
                                            </Button>
                                            <Button
                                                variant="hero"
                                                size="sm"
                                                onClick={() => handleMarkAsReplied(msg.id)}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Mark as Replied
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-2xl border-border/50">
                        <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                        <p className="text-muted-foreground">Inquiries from the contact page will appear here.</p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default AdminMessages
