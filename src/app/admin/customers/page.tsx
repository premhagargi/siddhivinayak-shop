"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const DEMO_USERS: User[] = [
  {
    id: "demo@example.com",
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User",
    phone: "+91 9876543210",
    isAdmin: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "anjali.k@example.com",
    email: "anjali.k@example.com",
    firstName: "Anjali",
    lastName: "Kapoor",
    phone: "+91 9988776655",
    isAdmin: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rajesh.m@gmail.com",
    email: "rajesh.m@gmail.com",
    firstName: "Rajesh",
    lastName: "Mehta",
    phone: "+91 9876123450",
    isAdmin: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "priya.s@outlook.com",
    email: "priya.s@outlook.com",
    firstName: "Priya",
    lastName: "Sharma",
    phone: "+91 9123456789",
    isAdmin: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "vikram.s@corporate.in",
    email: "vikram.s@corporate.in",
    firstName: "Vikram",
    lastName: "Singh",
    phone: "+91 9012345678",
    isAdmin: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.pageSize.toString(),
      });
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Fetch Error",
        description: "Could not load customer data.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isAdmin: !currentIsAdmin }),
      });
      
      if (!res.ok) throw new Error("Failed to update user");
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isAdmin: !currentIsAdmin } : u
      ));
      
      toast({
        title: "User Updated",
        description: `Admin status changed for ${userId}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Error",
        description: "Could not update user.",
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1 border-b pb-4">
        <h1 className="font-headline text-2xl font-bold uppercase tracking-tight">Customer Data</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">View and manage registered customers.</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-none h-10 pl-10 border-muted bg-secondary/10 text-xs" 
              placeholder="Search customers..." 
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchUsers}
              variant="outline" 
              className="h-10 rounded-none border-muted px-4 text-[10px] font-bold uppercase tracking-widest"
            >
              <Loader2 className={cn("h-3 w-3 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-muted">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-muted hover:bg-transparent">
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Customer</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Email</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Phone</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Status</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Joined</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-muted hover:bg-secondary/10 transition-colors group">
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase tracking-tight">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium lowercase">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium">{user.phone || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <span className={cn(
                      "px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full",
                      user.isAdmin 
                        ? "bg-purple-500/10 text-purple-600" 
                        : "bg-green-500/10 text-green-600"
                    )}>
                      {user.isAdmin ? "Admin" : "Customer"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2 px-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-primary/5">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-none border-muted min-w-[140px]">
                        <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground p-2">Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          className="text-[9px] font-bold uppercase tracking-widest p-2 cursor-pointer"
                          onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                        >
                          <Shield className="mr-2 h-3 w-3" />
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted" />
                        <DropdownMenuItem className="text-[9px] font-bold uppercase tracking-widest p-2 cursor-pointer text-destructive">
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && (
        <div className="flex items-center justify-between border-t border-muted pt-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Showing {filteredUsers.length} of {pagination.totalItems} customers
          </p>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              className="h-8 rounded-none border-muted text-[9px] font-bold uppercase tracking-widest px-3"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              className="h-8 rounded-none border-muted text-[9px] font-bold uppercase tracking-widest px-3"
              disabled={!pagination.hasNextPage}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
