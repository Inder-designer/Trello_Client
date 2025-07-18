import { useState } from 'react';
import { Plus, Filter, Users, User, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Board } from '@/pages/Index';
import ListComponent from '@/components/ListComponent';
import BoardFilters from '@/components/BoardFilters';

interface BoardViewProps {
  board: Board;
  onUpdateBoard: (board: Board) => void;
}

const BoardView = ({ board, onUpdateBoard }: BoardViewProps) => {
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterByMember, setFilterByMember] = useState<string>('');
  const [filterByLabel, setFilterByLabel] = useState<string>('');
  const [filterByPriority, setFilterByPriority] = useState<string>('');
  const [filterByStatus, setFilterByStatus] = useState<string>('');
  const [filterByDueDate, setFilterByDueDate] = useState<string>('');
  const [filterAssignedToMe, setFilterAssignedToMe] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const currentUserId = '1'; // In a real app, this would come from auth

  const createList = () => {
    if (!newListTitle.trim()) return;

    const newList = {
      id: Date.now().toString(),
      title: newListTitle,
      cards: [],
      position: board.lists.length
    };

    const updatedBoard = {
      ...board,
      lists: [...board.lists, newList]
    };

    onUpdateBoard(updatedBoard);
    setNewListTitle('');
    setIsCreateListOpen(false);
  };

  const updateList = (listId: string, updatedList: any) => {
    const updatedBoard = {
      ...board,
      lists: board.lists.map(list =>
        list.id === listId ? updatedList : list
      )
    };
    onUpdateBoard(updatedBoard);
  };

  const deleteList = (listId: string) => {
    const updatedBoard = {
      ...board,
      lists: board.lists.filter(list => list.id !== listId)
    };
    onUpdateBoard(updatedBoard);
  };

  const moveCard = (cardId: string, fromListId: string, toListId: string, newPosition: number) => {
    const fromList = board.lists.find(list => list.id === fromListId);
    const toList = board.lists.find(list => list.id === toListId);
    const card = fromList?.cards.find(card => card.id === cardId);

    if (!fromList || !toList || !card) return;

    // Add activity for card movement
    const updatedCard = {
      ...card,
      position: newPosition,
      activities: [...card.activities, {
        id: Date.now().toString(),
        type: 'moved' as const,
        description: `moved card from ${fromList.title} to ${toList.title}`,
        authorId: board.members[0].id, // In real app, get current user
        createdAt: new Date(),
        fromList: fromList.title,
        toList: toList.title
      }]
    };

    const updatedFromList = {
      ...fromList,
      cards: fromList.cards.filter(c => c.id !== cardId)
    };

    const updatedToList = {
      ...toList,
      cards: [...toList.cards.slice(0, newPosition), updatedCard, ...toList.cards.slice(newPosition)]
        .map((c, index) => ({ ...c, position: index }))
    };

    const updatedBoard = {
      ...board,
      lists: board.lists.map(list => {
        if (list.id === fromListId) return updatedFromList;
        if (list.id === toListId) return updatedToList;
        return list;
      })
    };

    onUpdateBoard(updatedBoard);
  };

  // Enhanced filtering function
  const filteredLists = board.lists.map(list => ({
    ...list,
    cards: list.cards.filter(card => {
      const matchesMember = !filterByMember || card.assignedTo?.includes(filterByMember);
      const matchesLabel = !filterByLabel || card.labels.some(label => label.id === filterByLabel);
      const matchesPriority = !filterByPriority || card.priority === filterByPriority;
      const matchesStatus = !filterByStatus || list.id === filterByStatus;
      const matchesAssignedToMe = !filterAssignedToMe || card.assignedTo?.includes(currentUserId);

      // Due date filtering
      let matchesDueDate = true;
      if (filterByDueDate && card.dueDate) {
        const now = new Date();
        const dueDate = new Date(card.dueDate);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const cardDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        switch (filterByDueDate) {
          case 'overdue':
            matchesDueDate = cardDueDate < today;
            break;
          case 'today':
            matchesDueDate = cardDueDate.getTime() === today.getTime();
            break;
          case 'this-week':
            const thisWeekEnd = new Date(today);
            thisWeekEnd.setDate(today.getDate() + (6 - today.getDay()));
            matchesDueDate = cardDueDate >= today && cardDueDate <= thisWeekEnd;
            break;
          case 'next-week':
            const nextWeekStart = new Date(today);
            nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
            const nextWeekEnd = new Date(nextWeekStart);
            nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
            matchesDueDate = cardDueDate >= nextWeekStart && cardDueDate <= nextWeekEnd;
            break;
          case 'no-due-date':
            matchesDueDate = !card.dueDate;
            break;
        }
      } else if (filterByDueDate === 'no-due-date') {
        matchesDueDate = !card.dueDate;
      }

      const matchesSearch = !searchQuery ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesMember && matchesLabel && matchesPriority && matchesStatus &&
        matchesDueDate && matchesSearch && matchesAssignedToMe;
    })
  }));

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterByMember('');
    setFilterByLabel('');
    setFilterByPriority('');
    setFilterByStatus('');
    setFilterByDueDate('');
    setFilterAssignedToMe(false);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      toast({
        title: "Board link copied!",
        description: "Share this link with your team members.",
      });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy link",
        description: "Please copy the URL manually from your browser.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-3">
      {/* Board Header */}
      <div className={`${board.color} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{board.title}</h1>
            {board.description && (
              <p className="text-white/80 mt-1">{board.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {board.members.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white"
                  title={member.name}
                >
                  <User className="h-4 w-4 text-white" />
                </div>
              ))}
              {board.members.length > 4 && (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-xs text-white font-medium">+{board.members.length - 4}</span>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-white/30" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Share Board</DialogTitle>
                  <DialogDescription>
                    Share this board with your team members by copying the link below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Board Link</Label>
                    <div className="flex gap-2">
                      <Input
                        value={window.location.href}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        onClick={handleShare}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Team Members</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {board.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="text-sm">{member.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {member.role || 'member'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsShareDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <BoardFilters
          board={board}
          searchQuery={searchQuery}
          filterByMember={filterByMember}
          filterByLabel={filterByLabel}
          filterByPriority={filterByPriority}
          filterByStatus={filterByStatus}
          filterByDueDate={filterByDueDate}
          filterAssignedToMe={filterAssignedToMe}
          currentUserId={currentUserId}
          onSearchChange={setSearchQuery}
          onMemberFilterChange={setFilterByMember}
          onLabelFilterChange={setFilterByLabel}
          onPriorityFilterChange={setFilterByPriority}
          onStatusFilterChange={setFilterByStatus}
          onDueDateFilterChange={setFilterByDueDate}
          onAssignedToMeToggle={setFilterAssignedToMe}
          onClearFilters={clearAllFilters}
        />
      )}

      {/* Lists Container */}
      <div className="flex-1 overflow-x-auto bg-gray-50 w-[calc(100vw-256px)]">
        <div className="flex gap-4 p-6 h-full min-w-max">
          {filteredLists.map((list) => (
            <ListComponent
              key={list.id}
              list={list}
              board={board}
              onUpdateList={updateList}
              onDeleteList={deleteList}
              onMoveCard={moveCard}
            />
          ))}

          {/* Add List Button */}
          <div className="flex-shrink-0">
            <Dialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-72 h-12 border-dashed border-2 hover:bg-white/50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add a list
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New List</DialogTitle>
                  <DialogDescription>
                    Create a new list to organize your cards.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="listTitle">List Title</Label>
                    <Input
                      id="listTitle"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createList} disabled={!newListTitle.trim()}>
                    Add List
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;