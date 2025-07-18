import { useState } from 'react';
import { Plus, Archive, Edit, Calendar, Flag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { List, Board, Card as CardType } from '@/pages/Index';
import CardComponent from '@/components/Project/CardComponent';

interface ListComponentProps {
  list: List;
  board: Board;
  onUpdateList: (listId: string, updatedList: List) => void;
  onDeleteList: (listId: string) => void;
  onMoveCard: (cardId: string, fromListId: string, toListId: string, newPosition: number) => void;
}

const ListComponent = ({ list, board, onUpdateList, onDeleteList, onMoveCard }: ListComponentProps) => {
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [selectedReporter, setSelectedReporter] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const availableLabels = [
    { id: '1', name: 'Design', color: 'bg-purple-500' },
    { id: '2', name: 'Backend', color: 'bg-green-500' },
    { id: '3', name: 'Frontend', color: 'bg-blue-500' },
    { id: '4', name: 'Bug', color: 'bg-red-500' },
    { id: '5', name: 'Feature', color: 'bg-yellow-500' }
  ];

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  };

  const updateListTitle = () => {
    if (listTitle.trim() && listTitle !== list.title) {
      onUpdateList(list.id, { ...list, title: listTitle });
    }
    setIsEditingTitle(false);
  };

  const createCard = () => {
    if (!newCardTitle.trim()) return;

    const newCard: CardType = {
      id: Date.now().toString(),
      title: newCardTitle,
      description: newCardDescription || undefined,
      assignedTo: selectedAssignees.length > 0 ? selectedAssignees : undefined,
      labels: selectedLabels.map(labelId =>
        availableLabels.find(label => label.id === labelId)!
      ),
      position: list.cards.length,
      priority: selectedPriority,
      reporterId: selectedReporter || undefined,
      startDate: startDate,
      dueDate: dueDate,
      comments: [],
      activities: [
        {
          id: Date.now().toString(),
          type: 'created',
          description: `Card created in ${list.title}`,
          authorId: selectedReporter || board.members[0].id,
          createdAt: new Date()
        }
      ]
    };

    const updatedList = {
      ...list,
      cards: [...list.cards, newCard]
    };

    onUpdateList(list.id, updatedList);
    resetForm();
  };

  const resetForm = () => {
    setNewCardTitle('');
    setNewCardDescription('');
    setSelectedAssignees([]);
    setSelectedLabels([]);
    setSelectedPriority('medium');
    setSelectedReporter('');
    setStartDate(undefined);
    setDueDate(undefined);
    setIsCreateCardOpen(false);
  };

  const updateCard = (cardId: string, updatedCard: CardType) => {
    const updatedList = {
      ...list,
      cards: list.cards.map(card =>
        card.id === cardId ? updatedCard : card
      )
    };
    onUpdateList(list.id, updatedList);
  };

  const deleteCard = (cardId: string) => {
    const updatedList = {
      ...list,
      cards: list.cards.filter(card => card.id !== cardId)
    };
    onUpdateList(list.id, updatedList);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const fromListId = e.dataTransfer.getData('fromListId');

    if (fromListId !== list.id) {
      onMoveCard(cardId, fromListId, list.id, list.cards.length);
    }
  };

  return (
    <div className="flex-shrink-0 w-72">
      <Card className="bg-gray-100 border shadow-sm">
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            {isEditingTitle ? (
              <Input
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                onBlur={updateListTitle}
                onKeyPress={(e) => e.key === 'Enter' && updateListTitle()}
                className="text-sm font-semibold"
                autoFocus
              />
            ) : (
              <h3
                className="text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
                onClick={() => setIsEditingTitle(true)}
              >
                {list.title}
              </h3>
            )}

            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {list.cards.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onDeleteList(list.id)}
              >
                <Archive className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent
          className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto py-3 px-3 border-y"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {list.cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              listId={list.id}
              board={board}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
            />
          ))}

        </CardContent>
        <Dialog open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-gray-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
              <DialogDescription>
                Create a new card in "{list.title}" list.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cardTitle">Card Title *</Label>
                <Input
                  id="cardTitle"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter card title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardDescription">Description</Label>
                <Textarea
                  id="cardDescription"
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  placeholder="Add more details..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Flag className={`h-3 w-3 ${priorityColors.low}`} />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Flag className={`h-3 w-3 ${priorityColors.medium}`} />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Flag className={`h-3 w-3 ${priorityColors.high}`} />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <Flag className={`h-3 w-3 ${priorityColors.urgent}`} />
                          Urgent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reporter</Label>
                  <Select value={selectedReporter} onValueChange={setSelectedReporter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reporter..." />
                    </SelectTrigger>
                    <SelectContent>
                      {board.members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {member.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        {startDate ? format(startDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        {dueDate ? format(dueDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assign Members</Label>
                <Select value="" onValueChange={(value) => {
                  if (!selectedAssignees.includes(value)) {
                    setSelectedAssignees([...selectedAssignees, value]);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select members..." />
                  </SelectTrigger>
                  <SelectContent>
                    {board.members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAssignees.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedAssignees.map((assigneeId) => {
                      const member = board.members.find(m => m.id === assigneeId);
                      return member ? (
                        <Badge key={assigneeId} variant="secondary" className="text-xs">
                          {member.name}
                          <button
                            onClick={() => setSelectedAssignees(prev => prev.filter(id => id !== assigneeId))}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Labels</Label>
                <Select value="" onValueChange={(value) => {
                  if (!selectedLabels.includes(value)) {
                    setSelectedLabels([...selectedLabels, value]);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select labels..." />
                  </SelectTrigger>
                  <SelectContent>
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
                {selectedLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedLabels.map((labelId) => {
                      const label = availableLabels.find(l => l.id === labelId);
                      return label ? (
                        <Badge key={labelId} className={`${label.color} text-white text-xs`}>
                          {label.name}
                          <button
                            onClick={() => setSelectedLabels(prev => prev.filter(id => id !== labelId))}
                            className="ml-1 hover:text-red-200"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={createCard} disabled={!newCardTitle.trim()}>
                Add Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default ListComponent;