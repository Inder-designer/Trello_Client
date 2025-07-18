import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Activity, User, Calendar, Flag, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card as CardType, Board, Comment, Activity as ActivityType } from '@/pages/Index';
import { ICard } from '@/Types/ICard';
import { IBoard } from '@/Types/IBoard';

interface CardDetailsProps {
  card: ICard;
  board: IBoard;
  onUpdateCard?: (cardId: string, updatedCard: CardType) => void;
}

const CardDetails = ({ card, board, onUpdateCard }: CardDetailsProps) => {
  const [newComment, setNewComment] = useState('');
  const [currentUserId] = useState('1'); // In a real app, this would come from auth

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      authorId: currentUserId,
      createdAt: new Date()
    };

    const activity: ActivityType = {
      id: (Date.now() + 1).toString(),
      type: 'commented',
      description: `added a comment`,
      authorId: currentUserId,
      createdAt: new Date()
    };

    const updatedCard = {
      ...card,
      comments: [...card.comments, comment],
      activities: [...card.activities, activity]
    };

    onUpdateCard(card.id, updatedCard);
    setNewComment('');
  };

  const getMemberName = (memberId: string) => {
    return board.members.find(m => m.id === memberId)?.name || 'Unknown User';
  };

  const getReporterName = () => {
    return card.reporterId ? getMemberName(card.reporterId) : 'No Reporter';
  };

  console.log(card);


  return (
    <div className="space-y-6">
      {/* Card Header Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Flag className={`h-4 w-4 ${priorityColors[card.priority]}`} />
            <span className="text-sm font-medium capitalize">{card.priority} Priority</span>
          </div>

          {card.reporterId && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Reporter: {getReporterName()}</span>
            </div>
          )}

          {card.assignedTo && card.assignedTo.length > 0 && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Assigned to:</span>
              <div className="flex flex-wrap gap-1">
                {card.assignedTo.map(assigneeId => (
                  <Badge key={assigneeId} variant="secondary" className="text-xs">
                    {getMemberName(assigneeId)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {card.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Start: {format(card.startDate, 'PPP')}</span>
            </div>
          )}

          {card.dueDate && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Due: {format(card.dueDate, 'PPP')}</span>
            </div>
          )}

          {/* {card.labels.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Labels:</span>
              <div className="flex flex-wrap gap-1">
                {card.labels.map(label => (
                  <Badge key={label.id} className={`${label.color} text-white text-xs`}>
                    {label.name}
                  </Badge>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>

      <Separator />

      {/* Tabs for Comments and Activities */}
      {/* <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({card.comments.length})
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activities ({card.activities.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={addComment} disabled={!newComment.trim()}>
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            {card.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet</p>
            ) : (
              card.comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getMemberName(comment.authorId).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{getMemberName(comment.authorId)}</span>
                          <span className="text-xs text-gray-500">
                            {format(comment.createdAt, 'PPP p')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-3">
          {card.activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activities yet</p>
          ) : (
            card.activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getMemberName(activity.authorId).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{getMemberName(activity.authorId)}</span>
                        <span className="text-sm text-gray-600">{activity.description}</span>
                        {activity.fromList && activity.toList && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>{activity.fromList}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{activity.toList}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(activity.createdAt, 'PPP p')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs> */}
    </div>
  );
};

export default CardDetails;