import { Modal, ModalBody, ModalHeader } from 'flowbite-react';
import { Button } from '../ui/button';
import { Calendar, Edit, Flag, Plus, X } from 'lucide-react';
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
    const [addCard, { isLoading }] = useCreateCardMutation()
    const [cardUpdate, { isLoading: isUpdating }] = useUpdateCardMutation()

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
                .then(() => {
                    toast.success("Card update successfully")
                    setIsCreateCardOpen(false)
                })
                .catch((err) => {
                    toast.error(err?.data?.message || "Failed to update card")
                });
        } else {
            await addCard({ ...values, boardId: board._id, listId: list._id })
                .unwrap()
                .then(() => {
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
            {/* Trigger Button */}
            {card ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 relative"
                    onClick={() => setIsCreateCardOpen(true)}
                >
                    <Edit className="h-3 w-3" />
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:bg-gray-200"
                    onClick={() => setIsCreateCardOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add a card
                </Button>
            )}

            {/* Modal */}
            <Modal show={isCreateCardOpen} onClose={() => setIsCreateCardOpen(false)} size="2xl">
                <ModalHeader className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {card ? 'Edit Card' : 'Add New Card'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {card ? 'Update card details' : `Create a new card in "${list?.title}" list.`}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateCardOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </ModalHeader>
                <ModalBody className="p-0">
                    <div className="max-h-[70vh] overflow-y-auto p-6">
                        <Formik
                            initialValues={{
                                title: card?.title || "",
                                description: card?.description || "",
                                priority: card?.priority || "medium",
                                idMembers: idMemebers || [],
                                dueDate: card?.dueDate || undefined,
                                attachment: null,
                            }}
                            validationSchema={cardValidation}
                            onSubmit={(values) => handlesubmit(values)}
                        >
                            {({ setFieldValue, values, dirty }) => (
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
                                                <Select value={values.priority} onValueChange={(value: string) => setFieldValue("priority", value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {priority.map((item) => (
                                                            <SelectItem key={item.value} value={item.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <Flag className={`h-3 w-3 ${item.color}`} />
                                                                    {item.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
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
                                                                    {board?.members
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
                                                                        const member = board?.members.find((m) => m._id === memberId);
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
                                        </div>
                                        {/* Add attachment */}
                                        <div>
                                            <Label>Attachment</Label>
                                            <input
                                                name="attachment"
                                                type="file"
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-gray-50 file:text-gray-700
                                                    hover:file:bg-gray-100"
                                                onChange={(event) => {
                                                    const file = event.currentTarget.files?.[0];
                                                    setFieldValue("attachment", file);
                                                }}
                                            />
                                            {/* preview image */}
                                            {values.attachment && (
                                                <div className="mt-2">
                                                    <img
                                                        src={URL.createObjectURL(values.attachment)}
                                                        alt="Attachment Preview"
                                                        className="max-w-full h-auto rounded"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <button 
                                                disabled={!values.title.trim() || !dirty || isLoading || isUpdating}
                                                type="submit"
                                                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {card ? isUpdating ? "Updating Card..." : "Update Card" : isLoading ? "Adding Card..." : "Add Card"}
                                            </button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default AddCard
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
                .then(() => {
                    toast.success("Card update successfully")
                    setIsCreateCardOpen(false)
                })
                .catch((err) => {
                    toast.error(err?.data?.message || "Failed to update card")
                });
        } else {
            await addCard({ ...values, boardId: board._id, listId: list._id })
                .unwrap()
                .then(() => {
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
            {/* Trigger Button */}
            {card ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 relative"
                    onClick={() => setIsCreateCardOpen(true)}
                >
                    <Edit className="h-3 w-3" />
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:bg-gray-200"
                    onClick={() => setIsCreateCardOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add a card
                </Button>
            )}

            {/* Modal */}
            <Modal show={isCreateCardOpen} onClose={() => setIsCreateCardOpen(false)} size="2xl">
                <ModalHeader className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {card ? 'Edit Card' : 'Add New Card'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {card ? 'Update card details' : `Create a new card in "${list?.title}" list.`}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateCardOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </ModalHeader>
                <ModalBody className="p-0">
                    <div className="max-h-[70vh] overflow-y-auto p-6">
                    <Formik
                        initialValues={{
                            title: card?.title || "",
                            description: card?.description || "",
                            priority: card?.priority || "medium",
                            idMembers: idMemebers || [],
                            dueDate: card?.dueDate || undefined,
                            attachment: null,
                        }}
                        validationSchema={cardValidation}
                        onSubmit={(values) => handlesubmit(values)}
                    >
                        {({ setFieldValue, values, dirty }) => (
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
                                            <Select value={values.priority} onValueChange={(value: string) => setFieldValue("priority", value)}>
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
                                        <div className="space-y-1">
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
                                    </div>
                                    {/* Add attachment */}
                                    <div>
                                        <Label>Attachment</Label>
                                        <input
                                            name="attachment"
                                            type="file"
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-gray-50 file:text-gray-700
                                                hover:file:bg-gray-100"
                                            onChange={(event) => {
                                                const file = event.currentTarget.files?.[0];
                                                setFieldValue("attachment", file);
                                            }}
                                        />
                                        {/* preview image */}
                                        {values.attachment && (
                                            <div className="mt-2">
                                                <img
                                                    src={URL.createObjectURL(values.attachment)}
                                                    alt="Attachment Preview"
                                                    className="max-w-full h-auto rounded"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <button disabled={!values.title.trim() || !dirty || isLoading || isUpdating}
                                            type="submit"
                                            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {card ? isUpdating ? "Updating Card..." : "Update Card" : isLoading ? "Adding Card..." : "Add Card"}
                                        </button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddCard