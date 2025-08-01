import { FormikInput } from '@/components/CommanFields/FormikInput'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { colorOptions } from '@/Constants/common'
import { Form, Formik } from 'formik'
import { Pencil, Plus, X } from 'lucide-react'
import * as Yup from 'yup'
import { Modal, ModalBody } from "flowbite-react";
import { useCreateBoardMutation, useUpdateBoardMutation } from '@/redux/api/Board'
import { toast } from 'sonner'
import { IBoard } from '@/Types/IBoard'

interface AddBoardProps {
    board?: IBoard;
    isDialogOpen: boolean;
    setIsDialogOpen: (value: boolean) => void;
}

const AddBoard = ({ board, isDialogOpen, setIsDialogOpen }: AddBoardProps) => {
    const [createBoard, { isLoading }] = useCreateBoardMutation()
    const [updateBoard, { isLoading: updateBoardLoading }] = useUpdateBoardMutation()

    const boardValidation = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        description: Yup.string(),
        background: Yup.string(),
    })

    const handlesubmit = async (values: IBoard) => {
        if (board) {
            await updateBoard({ id: board._id, values })
                .unwrap()
                .then(() => {
                    toast.success("Board Update Successfully")
                    setIsDialogOpen(false)
                })
                .catch((err) => {
                    toast.error(err?.data?.message || "Failed to update board")
                });
        } else {
            await createBoard(values)
                .unwrap()
                .then(() => {
                    toast.success("New Board Created Successfully")
                    setIsDialogOpen(false)
                })
                .catch((err) => {
                    toast.error(err?.data?.message || "Failed to create board")
                });
        }

    }

    return (
        <>
            {board ?
                <button className="" onClick={() => setIsDialogOpen(true)}>
                    <Pencil size="16" />
                </button>
                :
                <Button className="flex items-center gap-2" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add New Board
                </Button>
            }
            <Modal show={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <ModalBody className='p-0'>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border1">
                        <h4 className="text-text1 text-lg lg:text-xl font-semibold">{board ? "Edit Board" : "Create New Board"}</h4>
                        <button className="text-text1" onClick={() => setIsDialogOpen(false)}>
                            <X />
                        </button>
                    </div>
                    <div className="py-4 px-6  max-h-[600px] overflow-x-hidden relative">
                        <Formik
                            initialValues={{
                                title: board?.title || "",
                                description: board?.description || "",
                                background: board?.background || "",
                            }}
                            validationSchema={boardValidation}
                            onSubmit={(values) => handlesubmit(values as IBoard)}
                        >
                            {({ setFieldValue, values, dirty }) => (
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
                                            <FormikInput
                                                name='description'
                                                type='textarea'
                                                label='Description'
                                                placeholder="Enter board description (optional)"
                                                className='resize-none'
                                            />
                                        </div>
                                        <div>
                                            <Label>Board Color</Label>
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {colorOptions.map((color) => (
                                                    <div
                                                        key={color}
                                                        className={`w-full h-8 rounded cursor-pointer border-2 ${values.background === color ? 'border-gray-900' : 'border-gray-200'
                                                            } ${color}`}
                                                        onClick={() => setFieldValue("background", color)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button onClick={() => setIsDialogOpen(false)}
                                                disabled={isLoading || updateBoardLoading}
                                                className='border border-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-100 disabled:cursor-not-allowed'>
                                                Cancel
                                            </button>
                                            <button disabled={isLoading || updateBoardLoading || !values.title.trim() || !dirty} type="submit" className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 disabled:hover:bg-gray-700 disabled:cursor-default cursor-pointer">
                                                {board ? updateBoardLoading ? "Updating..." : "Update" : isLoading ? "Creating..." : "Create Board"}
                                            </button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </ModalBody>
            </Modal>
        </>
    )
}

export default AddBoard