import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LogIn, User } from 'lucide-react';
import { Form, Formik } from 'formik';
import { FormikInput } from '@/components/CommanFields/FormikInput';
import * as Yup from 'yup'
import { emailSchema } from '@/validations/common';
import { useLoginMutation } from '@/redux/baseApi';
import { toast } from 'sonner';

const Login = () => {
    const [login, { isLoading }] = useLoginMutation()
    const navigate = useNavigate()

    const loginValidation = Yup.object().shape({
        email: emailSchema,
        password: Yup.string().required("Password is required"),
    })

    const handleSubmit = async (values: { email: string; password: string }) => {
        await login(values).unwrap().then(() => {
            toast.success("Login Successfully")
            navigate("/boards")
        }).catch((err) => {
            toast.error(err?.data?.message || "Failed to Login")
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-blue-600 p-3 rounded-full">
                                <LogIn className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                        <CardDescription className="text-center">
                            Sign in to your account to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Formik
                            initialValues={{
                                email: "",
                                password: "",
                            }}
                            validationSchema={loginValidation}
                            onSubmit={(values) => handleSubmit(values)}
                        >
                            {() => (
                                <Form>
                                    <div className="space-y-4">
                                        <div>
                                            <FormikInput
                                                name='email'
                                                label='Email'
                                                placeholder="Enter email"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <FormikInput
                                                name='password'
                                                label='Password'
                                                placeholder="Enter email"
                                                required
                                            />
                                        </div>
                                        <div className="">
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Signing in...' : 'Sign In'}
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Separator />
                        <div className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-blue-600 hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Login;