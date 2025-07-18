import { FormikInput } from '@/components/CommanFields/FormikInput'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useCreateListMutation } from '@/redux/api/List'
import { addNewList } from '@/redux/Slices/boardSlice'
import { DialogDescription } from '@radix-ui/react-dialog'
import { Form, Formik } from 'formik'
import { Plus } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import * as Yup from 'yup'

const AddList = ({ isCreateListOpen, setIsCreateListOpen, boardId }) => {
    const [addList] = useCreateListMutation()
    const dispatch = useDispatch()

    const listValidation = Yup.object().shape({
        title: Yup.string().required("Title is required"),
    })

    const handlesubmit = async (values) => {
        await addList({ ...values, boardId })
            .unwrap()
            .then((res) => {
                toast.success("New List Created Successfully")
                setIsCreateListOpen(false)
                dispatch(addNewList(res))
            })
            .catch((err) => {
                toast.error(err?.data?.message || "Failed to create list")
            });
    }
    return (
        <div>
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
                    <Formik
                        initialValues={{
                            title: "",
                        }}
                        validationSchema={listValidation}
                        onSubmit={(values) => handlesubmit(values)}
                    >
                        {({ values }) => (
                            <Form>
                                <div className="space-y-4">
                                    <div>
                                        <FormikInput
                                            name='title'
                                            label='Board Title'
                                            placeholder="Enter board title"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Button disabled={!values.title.trim()}
                                        >
                                            Add List
                                        </Button>
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

export default AddList