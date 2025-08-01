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
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { IBoard } from '@/Types/IBoard';
import { IList } from '@/Types/IList';
import { ICard, IAttachment } from '@/Types/ICard';
import { useCreateCardMutation, useUpdateCardMutation } from '@/redux/api/Card';
import { useUploadMultiMutation } from '@/redux/api/common';

// Types for form values and upload response
interface UploadResponse {
    url: string;
    name: string;
    type: string;
}

interface FormValues {
    title: string;
    description: string;
    priority: string;
    idMembers: string[];
    dueDate?: Date | string;
    attachments: (File | IAttachment)[];
}

type AttachmentItem = File | IAttachment;

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
    const [uploadAttachments, { isLoading: isUploading }] = useUploadMultiMutation()

    const cardValidation = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        description: Yup.string(),
        priority: Yup.string(),
        idMembers: Yup.array(),
        dueDate: Yup.date(),
    })
    const idMemebers = card?.idMembers.map((member) => member?._id)

    const handleUpload = async (files: File[]) => {
        if (!files || files.length === 0) return [];
        try {
            const formData = new FormData();
            files.forEach((file) => {
                console.log("Appending:", file);
                formData.append("images", file);
            });
            const response = await uploadAttachments(formData).unwrap();

            return response.map((file: UploadResponse) => ({
                url: file.url,
                name: file.name,
                type: file.type,
            }));
        } catch (error) {
            toast.error("Failed to upload attachments");
            return [];
        }
    }

    const handlesubmit = async (values: FormValues) => {
        try {
            // Handle new file uploads
            let newAttachments = [];
            if (values.attachments && values.attachments.length > 0) {
                const newFiles = values.attachments.filter((file: AttachmentItem): file is File => file instanceof File);
                if (newFiles.length > 0) {
                    newAttachments = await handleUpload(newFiles);
                }
            }

            // Combine existing attachments with new ones
            const existingAttachments = values.attachments?.filter((file: AttachmentItem): file is IAttachment => !(file instanceof File)) || [];
            const allAttachments = [...existingAttachments, ...newAttachments];

            const submitData = {
                ...values,
                attachments: allAttachments
            };

            if (card) {
                // Update existing card
                const data = {
                    ...submitData,
                    boardId: card.boardId
                };
                await cardUpdate({ data, cardID: card._id })
                    .unwrap()
                    .then(() => {
                        toast.success("Card updated successfully");
                        setIsCreateCardOpen(false);
                    })
                    .catch((err) => {
                        toast.error(err?.data?.message || "Failed to update card");
                    });
            } else {
                // Create new card
                await addCard({ ...submitData, boardId: board?._id, listId: list?._id })
                    .unwrap()
                    .then(() => {
                        toast.success("New Card Created Successfully");
                        setIsCreateCardOpen(false);
                    })
                    .catch((err) => {
                        toast.error(err?.data?.message || "Failed to create card");
                    });
            }
        } catch (error) {
            toast.error("An error occurred while processing the card");
        }
    }

    return (
        <div>
            {/* Trigger Button */}
            {card ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 relative bg-white/40"
                    onClick={() => setIsCreateCardOpen(true)}
                >
                    <Edit className="h-3 w-3" />
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:bg-gray-300"
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
                    </div>
                </ModalHeader>
                <ModalBody className="p-0">
                    <div className="max-h-[80vh] overflow-y-auto p-6">
                        <Formik
                            initialValues={{
                                title: card?.title || "",
                                description: card?.description || "",
                                priority: card?.priority || "medium",
                                idMembers: idMemebers || [],
                                dueDate: card?.dueDate ? new Date(card.dueDate) : undefined,
                                attachments: card?.attachments || []
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
                                        <FieldArray name="attachments">
                                            {({ remove, push }) => (
                                                <div>
                                                    <Label>Attachments</Label>
                                                    <label htmlFor="attachment" className='mt-1 border-dashed border border-gray-400 p-2 rounded cursor-pointer block text-center hover:bg-gray-50'>
                                                        + Upload Attachment
                                                    </label>
                                                    <input
                                                        name="attachment"
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        multiple
                                                        hidden
                                                        id='attachment'
                                                        className=""
                                                        onChange={(event) => {
                                                            const files = Array.from(event.currentTarget.files || []);
                                                            const validFiles = files.filter((f): f is File => f instanceof File);
                                                            setFieldValue('attachments', [...values.attachments, ...validFiles]);
                                                            event.target.value = '';
                                                        }}
                                                        disabled={isUploading || isLoading || isUpdating}
                                                    />

                                                    {/* Attachment Preview */}
                                                    {values.attachments.length > 0 && (
                                                        <div className="mt-3 space-y-2">
                                                            <p className="text-sm font-medium text-gray-700">Attachments:</p>
                                                            {values.attachments.map((item: AttachmentItem, index: number) => {
                                                                const isFile = item instanceof File;
                                                                const fileName = isFile ? item.name : item.name;
                                                                const fileSize = isFile ? (item.size / 1024).toFixed(2) + " KB" : "";
                                                                const fileUrl = isFile ? URL.createObjectURL(item) : item.url;

                                                                return (
                                                                    <div 
                                                                        key={index} 
                                                                        className='flex items-center gap-3 p-2 border rounded-lg bg-gray-50'
                                                                    >
                                                                        <div className='h-12 w-16 rounded overflow-hidden bg-gray-200 flex-shrink-0'>
                                                                            {fileName.toLowerCase().includes('.pdf') ? (
                                                                                <div className="w-full h-full flex items-center justify-center text-red-500 text-xs font-medium">
                                                                                    PDF
                                                                                </div>
                                                                            ) : (
                                                                                <img
                                                                                    src={fileUrl}
                                                                                    alt={`Attachment ${index + 1}`}
                                                                                    className="w-full h-full object-contain"
                                                                                    onError={(e) => {
                                                                                        const target = e.target as HTMLImageElement;
                                                                                        target.style.display = 'none';
                                                                                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500 text-xs">Preview unavailable</div>';
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className='text-sm text-gray-800 truncate font-medium'>{fileName}</p>
                                                                            {fileSize && (
                                                                                <p className='text-xs text-gray-500'>{fileSize}</p>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            onClick={() => {
                                                                                const newAttachments = [...values.attachments];
                                                                                newAttachments.splice(index, 1);
                                                                                setFieldValue('attachments', newAttachments);
                                                                            }}
                                                                            disabled={isUploading || isLoading || isUpdating}
                                                                            title="Remove attachment"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </FieldArray>
                                        <div>
                                            <button
                                                disabled={!values.title.trim() || !dirty || isLoading || isUpdating || isUploading}
                                                type="submit"
                                                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {card ? isUpdating || isUploading ? "Updating Card..." : "Update Card" : isLoading || isUploading ? "Adding Card..." : "Add Card"}
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