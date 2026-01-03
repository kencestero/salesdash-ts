"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserCheck,
  UserCog,
  Briefcase,
  Shield,
  Search,
  Edit,
  Trash2,
  Ban,
  Clock,
  VolumeX,
  Unlock,
  Settings,
} from "lucide-react";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  zipcode: string;
  role: string;
  repCode: string;
  managerId: string | null;
  managerName: string | null;
  status: string;
  salespersonCode: string;
  member: boolean;
  accountStatus?: string;
  banReason?: string;
  timeoutUntil?: string | null;
  mutedUntil?: string | null;
  canAccessCRM?: boolean;
  canAccessInventory?: boolean;
  canAccessConfigurator?: boolean;
  canAccessCalendar?: boolean;
  canAccessReports?: boolean;
  canManageUsers?: boolean;
  isAvailableAsManager?: boolean;
  isActive?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profile: UserProfile | null;
}

interface Stats {
  totalUsers: number;
  reps: number;
  managers: number;
  freelancers: number;
  owners: number;
  directors: number;
  banned?: number;
  timeout?: number;
}

const roleColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  director: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  manager: "bg-green-100 text-green-800 hover:bg-green-100",
  salesperson: "bg-orange-100 text-orange-800 hover:bg-orange-100",
};

const statusColors: Record<string, string> = {
  employee: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  freelancer: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
};

const accountStatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  banned: "bg-red-100 text-red-800 hover:bg-red-100",
  timeout: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  muted: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sort state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Edit form states
  const [editManagerId, setEditManagerId] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAccountStatus, setEditAccountStatus] = useState("");
  const [editBanReason, setEditBanReason] = useState("");
  const [editTimeoutDays, setEditTimeoutDays] = useState("");

  // Permission states
  const [permCanAccessCRM, setPermCanAccessCRM] = useState(true);
  const [permCanAccessInventory, setPermCanAccessInventory] = useState(true);
  const [permCanAccessConfigurator, setPermCanAccessConfigurator] = useState(true);
  const [permCanAccessCalendar, setPermCanAccessCalendar] = useState(true);
  const [permCanAccessReports, setPermCanAccessReports] = useState(false);
  const [permCanManageUsers, setPermCanManageUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      setStats(data.stats);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditManagerId(user.profile?.managerId || "");
    setEditRole(user.profile?.role || "salesperson");
    setEditStatus(user.profile?.status || "employee");
    setEditAccountStatus(user.profile?.accountStatus || "active");
    setEditBanReason(user.profile?.banReason || "");
    setEditTimeoutDays("");
    setShowEditDialog(true);
  };

  const handleEditPermissions = (user: User) => {
    setSelectedUser(user);
    setPermCanAccessCRM(user.profile?.canAccessCRM ?? true);
    setPermCanAccessInventory(user.profile?.canAccessInventory ?? true);
    setPermCanAccessConfigurator(user.profile?.canAccessConfigurator ?? true);
    setPermCanAccessCalendar(user.profile?.canAccessCalendar ?? true);
    setPermCanAccessReports(user.profile?.canAccessReports ?? false);
    setPermCanManageUsers(user.profile?.canManageUsers ?? false);
    setShowPermissionsDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);

      // Calculate timeoutUntil if timeout days are provided
      let timeoutUntil = null;
      if (editAccountStatus === "timeout" && editTimeoutDays) {
        const days = parseInt(editTimeoutDays);
        if (days > 0) {
          timeoutUntil = new Date();
          timeoutUntil.setDate(timeoutUntil.getDate() + days);
        }
      }

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          managerId: editManagerId || null,
          role: editRole,
          status: editStatus,
          accountStatus: editAccountStatus,
          banReason: editAccountStatus === "banned" || editAccountStatus === "timeout" ? editBanReason : null,
          timeoutUntil,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user");
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setShowEditDialog(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          canAccessCRM: permCanAccessCRM,
          canAccessInventory: permCanAccessInventory,
          canAccessConfigurator: permCanAccessConfigurator,
          canAccessCalendar: permCanAccessCalendar,
          canAccessReports: permCanAccessReports,
          canManageUsers: permCanManageUsers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update permissions");
      }

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });

      setShowPermissionsDialog(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/users?userId=${userToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      setShowDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  // Sort handler
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.repCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.profile?.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" || user.profile?.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: string = "";
    let bValue: string = "";

    switch (sortColumn) {
      case "name":
        aValue = a.profile?.firstName || a.name || a.email || "";
        bValue = b.profile?.firstName || b.name || b.email || "";
        break;
      case "email":
        aValue = a.email || "";
        bValue = b.email || "";
        break;
      case "repCode":
        aValue = a.profile?.repCode || "";
        bValue = b.profile?.repCode || "";
        break;
      case "role":
        aValue = a.profile?.role || "";
        bValue = b.profile?.role || "";
        break;
      case "status":
        aValue = a.profile?.status || "";
        bValue = b.profile?.status || "";
        break;
      case "account":
        aValue = a.profile?.accountStatus || "";
        bValue = b.profile?.accountStatus || "";
        break;
      case "manager":
        aValue = a.profile?.managerName || "";
        bValue = b.profile?.managerName || "";
        break;
    }

    const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Sortable header component
  const SortableHeader = ({ column, label }: { column: string; label: string }) => (
    <th
      className="text-left py-3 px-4 font-semibold text-sm cursor-pointer hover:bg-muted/50 select-none transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-xs text-muted-foreground">
          {sortColumn === column ? (
            sortDirection === "asc" ? "▲" : "▼"
          ) : (
            <span className="opacity-30">▼</span>
          )}
        </span>
      </div>
    </th>
  );

  // Get list of managers for dropdown
  const managers = users.filter((u) => u.profile?.role === "manager");

  // Get list of potential managers (owner, director, manager roles)
  const potentialManagers = users.filter((u) =>
    u.profile?.role && ["owner", "director", "manager"].includes(u.profile.role)
  );

  // Handler to toggle manager availability
  const handleToggleManagerAvailability = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-manager`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailableAsManager: !currentStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update manager availability");
      }

      // Refresh users list
      await fetchUsers();

      toast({
        title: "Success",
        description: `Manager availability ${!currentStatus ? "enabled" : "disabled"}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update manager availability",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">User Management</h1>
          <p className="text-default-600 mt-1">
            Manage team members, assign managers, control permissions, and update roles
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserCheck className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reps</p>
                  <p className="text-2xl font-bold">{stats.reps}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCog className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Managers</p>
                  <p className="text-2xl font-bold">{stats.managers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Freelancers</p>
                  <p className="text-2xl font-bold">{stats.freelancers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Directors</p>
                  <p className="text-2xl font-bold">{stats.directors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owners</p>
                  <p className="text-2xl font-bold">{stats.owners}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manager Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Manager Availability Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Control which managers appear in the signup dropdown when new reps register
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {potentialManagers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No managers found</p>
            ) : (
              potentialManagers.map((user) => {
                const isAvailable = user.profile?.isAvailableAsManager || false;
                const repCount = users.filter(u => u.profile?.managerId === user.id).length;

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {isAvailable ? (
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </p>
                          <Badge className={roleColors[user.profile?.role || "salesperson"]}>
                            {user.profile?.role || "Unknown"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user.email} • Rep Code: {user.profile?.repCode || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {repCount} {repCount === 1 ? "rep" : "reps"} assigned
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {isAvailable ? "Visible in signup" : "Hidden from signup"}
                        </p>
                      </div>
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={() =>
                          handleToggleManagerAvailability(user.id, isAvailable)
                        }
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or rep code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="salesperson">Salesperson</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Team Members ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <SortableHeader column="name" label="Name" />
                  <SortableHeader column="email" label="Email" />
                  <SortableHeader column="repCode" label="Rep Code" />
                  <SortableHeader column="role" label="Role" />
                  <SortableHeader column="status" label="Status" />
                  <SortableHeader column="account" label="Account" />
                  <SortableHeader column="manager" label="Manager" />
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {user.profile?.repCode || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.profile?.role && (
                        <Badge className={roleColors[user.profile.role]}>
                          {user.profile.role}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.profile?.status && (
                        <Badge className={statusColors[user.profile.status]}>
                          {user.profile.status}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={accountStatusColors[user.profile?.accountStatus || "active"]}>
                        {user.profile?.accountStatus || "active"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {user.profile?.managerName || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPermissions(user)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => confirmDeleteUser(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user's manager, role, employment status, and account status
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="status">Account Status</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label className="font-semibold mb-2 block">User</Label>
                  <p className="text-sm">
                    {selectedUser.profile?.firstName} {selectedUser.profile?.lastName} ({selectedUser.email})
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Rep Code: {selectedUser.profile?.repCode || "N/A"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="manager" className="mb-2 block">
                    Assign Manager
                  </Label>
                  <Select value={editManagerId} onValueChange={setEditManagerId}>
                    <SelectTrigger id="manager">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="">No Manager (Freelancer)</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.profile?.firstName} {manager.profile?.lastName} ({manager.profile?.repCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role" className="mb-2 block">
                    Role
                  </Label>
                  <Select value={editRole} onValueChange={setEditRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="salesperson">Salesperson</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="mb-2 block">
                    Employment Status
                  </Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <div>
                  <Label htmlFor="accountStatus" className="mb-2 block">
                    Account Status
                  </Label>
                  <Select value={editAccountStatus} onValueChange={setEditAccountStatus}>
                    <SelectTrigger id="accountStatus">
                      <SelectValue placeholder="Select account status" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="active">Active - Full Access</SelectItem>
                      <SelectItem value="timeout">Timeout - Temporary Ban</SelectItem>
                      <SelectItem value="banned">Banned - Permanent</SelectItem>
                      <SelectItem value="muted">Muted - View Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(editAccountStatus === "banned" || editAccountStatus === "timeout") && (
                  <div>
                    <Label htmlFor="banReason" className="mb-2 block">
                      Reason for {editAccountStatus === "banned" ? "Ban" : "Timeout"}
                    </Label>
                    <Input
                      id="banReason"
                      placeholder="Enter reason..."
                      value={editBanReason}
                      onChange={(e) => setEditBanReason(e.target.value)}
                    />
                  </div>
                )}

                {editAccountStatus === "timeout" && (
                  <div>
                    <Label htmlFor="timeoutDays" className="mb-2 block">
                      Timeout Duration (days)
                    </Label>
                    <Input
                      id="timeoutDays"
                      type="number"
                      min="1"
                      placeholder="e.g., 7"
                      value={editTimeoutDays}
                      onChange={(e) => setEditTimeoutDays(e.target.value)}
                    />
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">Account Status Info:</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li><Ban className="w-3 h-3 inline mr-2" /><strong>Banned:</strong> User cannot login</li>
                    <li><Clock className="w-3 h-3 inline mr-2" /><strong>Timeout:</strong> Temporary ban with expiration</li>
                    <li><VolumeX className="w-3 h-3 inline mr-2" /><strong>Muted:</strong> Read-only access, cannot modify data</li>
                    <li><Unlock className="w-3 h-3 inline mr-2" /><strong>Active:</strong> Full access based on permissions</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={updating}>
              {updating ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Control what {selectedUser?.profile?.firstName} can access in the dashboard
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="crm">CRM Access</Label>
                  <p className="text-xs text-muted-foreground">View and manage customers</p>
                </div>
                <Switch
                  id="crm"
                  checked={permCanAccessCRM}
                  onCheckedChange={setPermCanAccessCRM}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inventory">Inventory Access</Label>
                  <p className="text-xs text-muted-foreground">View trailer inventory</p>
                </div>
                <Switch
                  id="inventory"
                  checked={permCanAccessInventory}
                  onCheckedChange={setPermCanAccessInventory}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="configurator">Finance Calculator</Label>
                  <p className="text-xs text-muted-foreground">Use pricing configurator</p>
                </div>
                <Switch
                  id="configurator"
                  checked={permCanAccessConfigurator}
                  onCheckedChange={setPermCanAccessConfigurator}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="calendar">Calendar Access</Label>
                  <p className="text-xs text-muted-foreground">View and create events</p>
                </div>
                <Switch
                  id="calendar"
                  checked={permCanAccessCalendar}
                  onCheckedChange={setPermCanAccessCalendar}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reports">Advanced Reports</Label>
                  <p className="text-xs text-muted-foreground">View analytics and reports</p>
                </div>
                <Switch
                  id="reports"
                  checked={permCanAccessReports}
                  onCheckedChange={setPermCanAccessReports}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="manage">User Management</Label>
                  <p className="text-xs text-muted-foreground">Manage other users</p>
                </div>
                <Switch
                  id="manage"
                  checked={permCanManageUsers}
                  onCheckedChange={setPermCanManageUsers}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPermissionsDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePermissions} disabled={updating}>
              {updating ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>
                {userToDelete?.profile?.firstName} {userToDelete?.profile?.lastName}
              </strong>{" "}
              ({userToDelete?.email}). This action cannot be undone. All associated data
              (sessions, activities, etc.) will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Yes, Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
