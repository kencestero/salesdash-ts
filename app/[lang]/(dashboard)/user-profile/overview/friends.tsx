"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Bell,
  HelpCircle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Friend {
  friendshipId: string;
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  repCode: string;
  totalUnitsSold: number;
  monthlyUnits: number;
  friendsSince: string;
}

interface FriendRequest {
  id: string;
  from?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  };
  to?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  };
  sentAt: string;
}

interface SearchResult {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  repCode: string;
  friendshipStatus: string | null;
  friendshipDirection: string | null;
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({
    incoming: [],
    outgoing: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends);
      }
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/friends/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests({ incoming: data.incoming, outgoing: data.outgoing });
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  };

  const searchUsers = async () => {
    if (searchQuery.length < 2) return;

    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: userId })
      });

      if (res.ok) {
        toast({ title: "Friend request sent!" });
        fetchRequests();
        searchUsers(); // Refresh search results
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
    }
  };

  const handleRequest = async (requestId: string, action: "accept" | "decline") => {
    try {
      const res = await fetch("/api/friends/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action })
      });

      if (res.ok) {
        toast({ title: action === "accept" ? "Friend added!" : "Request declined" });
        fetchFriends();
        fetchRequests();
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to handle request", variant: "destructive" });
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Friend removed" });
        fetchFriends();
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to remove friend", variant: "destructive" });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-amber-500/10 text-amber-600";
      case "director": return "bg-purple-500/10 text-purple-600";
      case "manager": return "bg-blue-500/10 text-blue-600";
      default: return "bg-[#E96114]/10 text-[#E96114]";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between border-none mb-2">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#E96114]" />
          Friends ({friends.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          {requests.incoming.length > 0 && (
            <Badge className="bg-red-500 text-white">
              {requests.incoming.length} pending
            </Badge>
          )}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#E96114] hover:bg-[#E96114]/90">
                <UserPlus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Friends</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name, email, or rep code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                  />
                  <Button onClick={searchUsers} disabled={searching}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {searching ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-default-400">{user.repCode}</p>
                          </div>
                        </div>
                        {user.friendshipStatus === "accepted" ? (
                          <Badge>Friends</Badge>
                        ) : user.friendshipStatus === "pending" ? (
                          <Badge variant="outline">
                            {user.friendshipDirection === "outgoing" ? "Requested" : "Accept?"}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendFriendRequest(user.id)}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <p className="text-center text-default-400 py-4">No users found</p>
                ) : null}

                {/* Incoming Requests */}
                {requests.incoming.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Pending Requests ({requests.incoming.length})
                    </h4>
                    <div className="space-y-2">
                      {requests.incoming.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-default-50">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={req.from?.image || undefined} />
                              <AvatarFallback>{req.from?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{req.from?.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              className="h-7 w-7 bg-green-500 hover:bg-green-600"
                              onClick={() => handleRequest(req.id, "accept")}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => handleRequest(req.id, "decline")}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {friends.length === 0 ? (
          <div className="text-center py-8 text-default-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No friends yet</p>
            <p className="text-sm">Add colleagues to see their stats!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.slice(0, 5).map(friend => (
              <div key={friend.friendshipId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-default-50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={friend.image || undefined} />
                  <AvatarFallback className="bg-[#09213C] text-white">
                    {friend.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-default-900 truncate">{friend.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getRoleColor(friend.role)}`}>
                      {friend.role}
                    </Badge>
                    <span className="text-xs text-default-400">
                      {friend.monthlyUnits} this month
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#E96114]">{friend.totalUnitsSold}</p>
                  <p className="text-xs text-default-400">total units</p>
                </div>
              </div>
            ))}
            {friends.length > 5 && (
              <Button variant="ghost" className="w-full text-[#E96114]">
                View all {friends.length} friends
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
