import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, X, Flag, Calendar } from 'lucide-react';
import { Board } from '@/pages/Index';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import ShareDialog from './Project/ShareDialog';
import { useState } from 'react';

interface BoardFiltersProps {
  data?: any
  board?: Board;
  searchQuery?: string;
  filterByMember: string;
  filterByLabel?: string;
  filterByPriority?: string;
  filterByStatus?: string;
  filterByDueDate?: string;
  filterAssignedToMe?: boolean;
  currentUserId?: string;
  onSearchChange?: (query: string) => void;
  onMemberFilterChange?: (memberId: string) => void;
  onLabelFilterChange?: (labelId: string) => void;
  onPriorityFilterChange?: (priority: string) => void;
  onStatusFilterChange?: (status: string) => void;
  onDueDateFilterChange?: (dueDate: string) => void;
  onAssignedToMeToggle?: (assigned: boolean) => void;
  onClearFilters?: () => void;
}

const BoardFilters = ({
  data,
  board,
  searchQuery,
  filterByMember,
  filterByLabel,
  filterByPriority,
  filterByStatus,
  filterByDueDate,
  filterAssignedToMe,
  currentUserId = '1', // Default to first user for demo
  onSearchChange,
  onMemberFilterChange,
  onLabelFilterChange,
  onPriorityFilterChange,
  onStatusFilterChange,
  onDueDateFilterChange,
  onAssignedToMeToggle,
  onClearFilters
}: BoardFiltersProps) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const availableLabels = [
    { id: '1', name: 'Design', color: 'bg-purple-500' },
    { id: '2', name: 'Backend', color: 'bg-green-500' },
    { id: '3', name: 'Frontend', color: 'bg-blue-500' },
    { id: '4', name: 'Bug', color: 'bg-red-500' },
    { id: '5', name: 'Feature', color: 'bg-yellow-500' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
  ];

  // const statusOptions = board?.lists.map(list => ({
  //   value: list._id,
  //   label: list.title
  // }));

  const dueDateOptions = [
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due Today' },
    { value: 'this-week', label: 'Due This Week' },
    { value: 'next-week', label: 'Due Next Week' },
    { value: 'no-due-date', label: 'No Due Date' }
  ];

  const hasActiveFilters = searchQuery || filterByMember || filterByLabel || filterByPriority ||
    filterByStatus || filterByDueDate || filterAssignedToMe;

  const currentUser = board?.members.find(m => m.id === currentUserId);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className='flex gap-2 items-center'>
          <div className="flex -space-x-2">
            {data?.members.slice(0, 4).map((member) => (
              <div
                key={member?._id}
                className="w-8 h-8 bg-red-400 text-white text-sm font-medium rounded-full flex items-center justify-center"
                title={member?.fullName}
              >
                {member?.initials}
                {/* <User className="h-4 w-4 text-white" /> */}
              </div>
            ))}
            {data?.members.length > 4 && (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-xs text-white font-medium">+{board.members.length - 4}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Filters
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-4 bg-white shadow-md rounded-md space-y-4 w-80 z-50">
              {/* Assigned To Me */}
              <Button
                variant={filterAssignedToMe ? "default" : "outline"}
                size="sm"
                onClick={() => onAssignedToMeToggle?.(!filterAssignedToMe)}
                className="w-full justify-start"
              >
                <User className="h-4 w-4 mr-2" />
                Assigned to me
              </Button>

              {/* Member Filter */}
              <Select value={filterByMember || "all"} onValueChange={(val) => onMemberFilterChange?.(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All members</SelectItem>
                  {board?.members.map((member, index) => (
                    <SelectItem key={index} value={member.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Label Filter */}
              <Select value={filterByLabel || "all"} onValueChange={(val) => onLabelFilterChange?.(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All labels</SelectItem>
                  {availableLabels.map((label) => (
                    <SelectItem key={label.id} value={label.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${label.color}`} />
                        {label.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={filterByPriority || "all"} onValueChange={(val) => onPriorityFilterChange?.(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <Flag className={`h-4 w-4 ${priority.color}`} />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              {/* <Select value={filterByStatus || "all"} onValueChange={(val) => onStatusFilterChange?.(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}

              {/* Due Date Filter */}
              <Select value={filterByDueDate || "all"} onValueChange={(val) => onDueDateFilterChange?.(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Due Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All due dates</SelectItem>
                  {dueDateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button variant="destructive" size="sm" onClick={onClearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <ShareDialog isShareDialogOpen={isShareDialogOpen} setIsShareDialogOpen={setIsShareDialogOpen} board={data} />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <button onClick={() => onSearchChange('')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterAssignedToMe && currentUser && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Assigned to: {currentUser.name}
              <button onClick={() => onAssignedToMeToggle(false)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterByMember && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Member: {board.members.find(m => m.id === filterByMember)?.name}
              <button onClick={() => onMemberFilterChange('')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterByLabel && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Label: {availableLabels.find(l => l.id === filterByLabel)?.name}
              <button onClick={() => onLabelFilterChange('')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterByPriority && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Priority: {priorityOptions.find(p => p.value === filterByPriority)?.label}
              <button onClick={() => onPriorityFilterChange('')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterByStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {statusOptions.find(s => s.value === filterByStatus)?.label}
              <button onClick={() => onStatusFilterChange('')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterByDueDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Due: {dueDateOptions.find(d => d.value === filterByDueDate)?.label}
              <button onClick={() => onDueDateFilterChange('')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default BoardFilters;