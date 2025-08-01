import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, X, Flag, Calendar, EllipsisVertical, LogOut, Settings, Archive, Info, ArrowUpRight, Minus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';
import ShareDialog from '../Modals/ShareDialog';
import { useState } from 'react';
import { IBoard } from '@/Types/IBoard';
import { HandleBoard } from '../Handlers/HandleBoard';

interface BoardFiltersProps {
  board?: IBoard;
  search?: string;
  member: string;
  label?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  assignedToMe?: boolean;
  currentUserId?: string;
  onSearchChange?: (query: string) => void;
  onMemberFilterChange?: (memberId: string) => void;
  onLabelFilterChange?: (labelId: string) => void;
  onPriorityFilterChange?: (priority: string) => void;
  onStatusFilterChange?: (status: string) => void;
  onDueDateFilterChange?: (dueDate: string) => void;
  onAssignedToMeToggle?: (assigned: boolean) => void;
  onClearFilters?: () => void;
  isOwner?: boolean;
}

const BoardFilters = ({
  board,
  search,
  member,
  label,
  priority,
  status,
  dueDate,
  assignedToMe,
  currentUserId = '1', // Default to first user for demo
  onSearchChange,
  onMemberFilterChange,
  onLabelFilterChange,
  onPriorityFilterChange,
  onStatusFilterChange,
  onDueDateFilterChange,
  onAssignedToMeToggle,
  onClearFilters,
  isOwner = false,
}: BoardFiltersProps) => {
  const { handleLeaveBoard, handleBoardSettings, handleArchiveBoard, handleToggleBoardClose } = HandleBoard();
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

  const dueDateOptions = [
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due Today' },
    { value: 'this-week', label: 'Due This Week' },
    { value: 'next-week', label: 'Due Next Week' },
    { value: 'no-due-date', label: 'No Due Date' }
  ];

  const hasActiveFilters = search || member || label || priority ||
    status || dueDate || assignedToMe;

  const currentUser = board?.members.find(m => m._id === currentUserId)

  return (
    <>
      {board?.isClosed && isOwner &&
        <>
          <div className="bg-red-100 text-red-800 p-4 flex items-center gap-2 text-sm font-medium">
            <Info size={16} />
            <p>This board is closed. Reopen the board to make changes.</p>
            <button className="text-gray-600 hover:text-gray-900 underline" onClick={() => handleToggleBoardClose(board._id, true)}>Reopen Board</button>
          </div>
        </>
      }
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Search cards..."
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className='flex gap-2 items-center'>
            <div className="flex -space-x-2">
              {board?.members.slice(0, 4).map((member, index) => (
                <div
                  key={member?._id}
                  className={`w-8 h-8 rounded-full border-2 border-white text-xs font-medium text-white flex items-center justify-center
        bg-red-400 z-${10 - index} ${index !== 0 ? '-ml-2' : ''}`}
                  title={member?.fullName}
                >
                  {member?.initials}
                </div>
              ))}
              {board?.members.length > 4 && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white text-xs text-white font-medium z-[4]">
                  +{board?.members.length - 4}
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
                  variant={assignedToMe ? "default" : "outline"}
                  size="sm"
                  onClick={() => onAssignedToMeToggle?.(!assignedToMe)}
                  className="w-full justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Assigned to me
                </Button>

                {/* Member Filter */}
                <Select value={member || "all"} onValueChange={(val) => onMemberFilterChange?.(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All members</SelectItem>
                    {board?.members.map((member, index) => (
                      <SelectItem key={index} value={member._id}>
                        <div className="flex items-center gap-2 capitalize">
                          <User className="h-4 w-4" />
                          {member.fullName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Label Filter */}
                <Select value={label || "all"} onValueChange={(val) => onLabelFilterChange?.(val === "all" ? "" : val)}>
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
                <Select value={priority || "all"} onValueChange={(val) => onPriorityFilterChange?.(val === "all" ? "" : val)}>
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
                <Select value={dueDate || "all"} onValueChange={(val) => onDueDateFilterChange?.(val === "all" ? "" : val)}>
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
            {isOwner &&
              <ShareDialog isShareDialogOpen={isShareDialogOpen} setIsShareDialogOpen={setIsShareDialogOpen} board={board} />
            }

            {/* Board Options Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <EllipsisVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={handleBoardSettings} className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Board Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleArchiveBoard} className="cursor-pointer">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Board
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {isOwner ?
                  <DropdownMenuItem
                    onClick={() => handleToggleBoardClose(board?._id, board?.isClosed)}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    {!board?.isClosed ?
                      <Minus className="h-4 w-4 mr-2" /> :
                      <ArrowUpRight className="h-4 w-4 mr-2" />}
                    {board.isClosed ? 'Reopen Board' : 'Close Board'}
                  </DropdownMenuItem>
                  :
                  <DropdownMenuItem
                    onClick={() => handleLeaveBoard(board?._id)}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave Board
                  </DropdownMenuItem>
                }
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            {search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{search}"
                <button onClick={() => onSearchChange?.('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {assignedToMe && currentUser && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Assigned to: <span className='capitalize'>{currentUser.fullName}</span>
                <button onClick={() => onAssignedToMeToggle?.(false)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {member && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Member: {board?.members.find(m => m._id === member)?.fullName}
                <button onClick={() => onMemberFilterChange?.('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {label && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Label: {availableLabels.find(l => l.id === label)?.name}
                <button onClick={() => onLabelFilterChange?.('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {priority && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Priority: {priorityOptions.find(p => p.value === priority)?.label}
                <button onClick={() => onPriorityFilterChange?.('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {dueDate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Due: {dueDateOptions.find(d => d.value === dueDate)?.label}
                <button onClick={() => onDueDateFilterChange?.('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BoardFilters;