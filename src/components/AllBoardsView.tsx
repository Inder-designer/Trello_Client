import { Board } from '@/pages/Index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, List } from 'lucide-react';

interface AllBoardsViewProps {
  boards: Board[];
  onSelectBoard: (board: Board) => void;
}

const AllBoardsView = ({ boards, onSelectBoard }: AllBoardsViewProps) => {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Boards</h1>
        <p className="text-gray-600">Manage and view all your project boards</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => (
          <Card 
            key={board.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectBoard(board)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded ${board.color}`} />
                <CardTitle className="text-lg">{board.title}</CardTitle>
              </div>
              {board.description && (
                <p className="text-sm text-gray-600 mt-2">{board.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <List className="h-4 w-4" />
                    {board.lists.length} lists
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {board.members.length} members
                  </span>
                </div>
                <Badge variant="secondary">
                  {board.lists.reduce((total, list) => total + list.cards.length, 0)} cards
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AllBoardsView;