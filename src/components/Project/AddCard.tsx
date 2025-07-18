import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Calendar, Edit, Flag, Plus } from 'lucide-react';
import { FieldArray, Form, Formik } from 'formik';
import { FormikInput } from '../CommanFields/FormikInput';
import * as Yup from 'yup'
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { IBoard } from '@/Types/IBoard';
import { IList } from '@/Types/IList';
import { ICard } from '@/Types/ICard';
import { useCreateCardMutation, useUpdateCardMutation } from '@/redux/api/Card';

const priority = [
    { value: "low", label: "Low", color: "bg-green-500" },
    { value: "medium", label: "Medium", color: "bg-yellow-500" },
    { value: "high", label: "High", color: "bg-orange-500" },
    { value: "urgent", label: "Urgent", color: "bg-red-500" },
];
type AddCardProps = {
    isCreateCardOpen: boolean;
    setIsCreateCardOpen: (open: boolean) => void;
    list?: IList;
    board?: IBoard;
    card?: ICard
};

const AddCard = ({ isCreateCardOpen, setIsCreateCardOpen, list, board, card }: AddCardProps) => {
    const [addCard] = useCreateCardMutation()
    const [cardUpdate] = useUpdateCardMutation()
    const dispatch = useDispatch()

    const cardValidation = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        description: Yup.string(),
        priority: Yup.string(),
        idMembers: Yup.array(),
        dueDate: Yup.date(),
    })
    const idMemebers = card?.idMembers.map((member) => member?._id)

    const handlesubmit = async (values) => {
        if (card) {
            const data = {
                ...values, boardId: card.boardId
            }
            await cardUpdate({ data, cardID: card?._id })
                .unwrap()
                .then((res) => {
                    toast.success("Card update successfully")
                    setIsCreateCardOpen(false)
                })
                .catch((err) => {
                    toast.error(err?.data?.message || "Failed to update card")
                });
        } else {
            await addCard({ ...values, boardId: board._id, listId: list._id })
                .unwrap()
                .then((res) => {
                    toast.success("New Card Created Successfully")
                    setIsCreateCardOpen(false)
                })
                .catch((err) => {
                    toast.error(err?.data?.message || "Failed to create card")
                });
        }
    }
    return (
        <div>
            <Dialog open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}>
                <DialogTrigger asChild>
                    {card
                        ?
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                        :
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-600 hover:bg-gray-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add a card
                        </Button>
                    }
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Card</DialogTitle>
                        <DialogDescription>
                            Create a new card in "{list?.title}" list.
                        </DialogDescription>
                    </DialogHeader>
                    <Formik
                        initialValues={{
                            title: card?.title || "",
                            description: card?.description || "",
                            priority: card?.priority || "medium",
                            idMembers: idMemebers || [],
                            dueDate: card?.dueDate || undefined
                        }}
                        validationSchema={cardValidation}
                        onSubmit={(values) => handlesubmit(values)}
                    >
                        {({ setFieldValue, values }) => {
                            console.log(values);

                            return (
                                <Form>
                                    <div className="space-y-4">
                                        <div>
                                            <FormikInput
                                                name='title'
                                                label='Card Title'
                                                placeholder="Enter card title"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <FormikInput
                                                name='description'
                                                type='textarea'
                                                label='Description Title'
                                                placeholder="Enter card description"
                                                className='resize-none'
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label>Priority</Label>
                                                <Select value={values.priority} onValueChange={(value: any) => setFieldValue("priority", value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {priority.map((item) => (
                                                            <SelectItem value={item.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <Flag className={`h-3 w-3 ${item.color}`} />
                                                                    {item.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <FieldArray
                                                name='idMembers'
                                                render={arrayHelpers => (
                                                    <div className='space-y-1'>
                                                        <Label>Assign Members</Label>
                                                        <div>
                                                            <Select value="" onValueChange={(value) => {
                                                                arrayHelpers.push(value)
                                                            }}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select members..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {board.members
                                                                        .filter((member) => !values.idMembers.includes(member._id))
                                                                        .map((member) => (
                                                                            <SelectItem key={member._id} value={member._id}>
                                                                                {member.fullName}
                                                                            </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className='flex gap-2 flex-wrap'>
                                                            {values.idMembers.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {values.idMembers.map((memberId, index) => {
                                                                        const member = board.members.find((m) => m._id === memberId);
                                                                        return member ? (
                                                                            <Badge key={memberId} variant="secondary" className="text-xs capitalize">
                                                                                {member.fullName}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => arrayHelpers.remove(index)}
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
                                                    </div>
                                                )}
                                            />
                                            <div className="space-y-2">
                                                <Label>Due Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start rounded">
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            {values.dueDate ? format(values.dueDate, 'PPP') : 'Select date'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={values.dueDate ? new Date(values.dueDate) : undefined}
                                                            onSelect={(date) => setFieldValue("dueDate", date)}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                        <div>
                                            <Button disabled={!values.title.trim()}
                                            >
                                                Add Card
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            )
                        }}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddCard