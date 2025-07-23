import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { FiPlus, FiUserPlus, FiUsers, FiCalendar, FiStar } from "react-icons/fi";

export default function Group() {
  // Static group data
  const [groups] = useState([
    {
      id: 1,
      name: "Development Team",
      memberCount: 8,
      userRole: "Admin",
      createdAt: "Mar 15, 2024"
    },
    {
      id: 2,
      name: "Marketing Team",
      memberCount: 12,
      userRole: "Member",
      createdAt: "Mar 10, 2024"
    },
    {
      id: 3,
      name: "Design Team",
      memberCount: 6,
      userRole: "Admin",
      createdAt: "Mar 5, 2024"
    },
    {
      id: 4,
      name: "Product Team",
      memberCount: 15,
      userRole: "Member",
      createdAt: "Feb 28, 2024"
    },
    {
      id: 5,
      name: "QA Team",
      memberCount: 4,
      userRole: "Moderator",
      createdAt: "Feb 20, 2024"
    }
  ]);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);

  if (groups.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <FiUsers className="h-6 w-6 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">No Groups Found</h2>
            <p className="text-zinc-500 text-center max-w-md mb-8">
              You are not a member of any group yet. Create a new group or join an existing one to get started.
            </p>
            <div className="flex gap-3">
              <Dialog open={isCreateGroupModalOpen} onOpenChange={setIsCreateGroupModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="flex items-center gap-2">
                    <FiPlus className="h-4 w-4" />
                    Create New Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-zinc-900">Create Group</DialogTitle>
                  </DialogHeader>
                  <div className="mt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="groupName" className="text-sm font-medium text-zinc-700">
                          Group Name
                        </Label>
                        <Input
                          id="groupName"
                          placeholder="Enter your group name"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button type="submit" className="w-full sm:w-auto">Create Group</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isJoinGroupModalOpen} onOpenChange={setIsJoinGroupModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FiUserPlus className="h-4 w-4" />
                    Join Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-zinc-900">Join Group</DialogTitle>
                  </DialogHeader>
                  <div className="mt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="groupCode" className="text-sm font-medium text-zinc-700">
                          Group Code
                        </Label>
                        <Input
                          id="groupCode"
                          placeholder="Enter the group code"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button type="submit" className="w-full sm:w-auto">Join Group</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">My Groups</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and view your groups</p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center gap-2">
                <FiPlus className="h-4 w-4" />
                Create New Group
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-zinc-900">Create Group</DialogTitle>
              </DialogHeader>
              <div className="mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName" className="text-sm font-medium text-zinc-700">
                      Group Name
                    </Label>
                    <Input
                      id="groupName"
                      placeholder="Enter your group name"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button type="submit" className="w-full sm:w-auto">Create Group</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FiUserPlus className="h-4 w-4" />
                Join Group
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-zinc-900">Join Group</DialogTitle>
              </DialogHeader>
              <div className="mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupCode" className="text-sm font-medium text-zinc-700">
                      Group Code
                    </Label>
                    <Input
                      id="groupCode"
                      placeholder="Enter the group code"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button type="submit" className="w-full sm:w-auto">Join Group</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200 bg-zinc-50/50">
                <TableHead className="py-4 px-6 text-zinc-500 font-medium">Group Name</TableHead>
                <TableHead className="py-4 px-6 text-zinc-500 font-medium">Members</TableHead>
                <TableHead className="py-4 px-6 text-zinc-500 font-medium">Role</TableHead>
                <TableHead className="py-4 px-6 text-zinc-500 font-medium">Created</TableHead>
                <TableHead className="py-4 px-6 text-zinc-500 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id} className="border-b border-zinc-200 hover:bg-zinc-50/50 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                        <FiUsers className="h-4 w-4 text-zinc-600" />
                      </div>
                      <span className="font-medium text-zinc-900">{group.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-zinc-600">
                    <div className="flex items-center gap-2">
                      <FiUsers className="h-4 w-4" />
                      {group.memberCount} members
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <FiStar className="h-4 w-4 text-zinc-600" />
                      <span className="text-zinc-600">{group.userRole}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <FiCalendar className="h-4 w-4" />
                      {group.createdAt}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Button variant="outline" size="sm" className="h-8">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
} 