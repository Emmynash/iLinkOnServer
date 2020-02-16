import HttpStatus from 'http-status';

interface ISampleResponses {
    [status: number]: {
        description: string,
        example: {
            'application/json': {
                meta: {
                    status: number,
                    message?: any,
                    error?: string,
                },
                data: any
            },
        },
    };
}

export const AllSampleResponses: ISampleResponses = {
    [HttpStatus.UNAUTHORIZED]: {
        description: 'unauthorized, missing/wrong jwt token',
        example: {
            'application/json': {
                meta: {
                    status: 401,
                    message: 'Invalid token',
                    error: 'Invalid token',
                },
                data: {},
            }
        },
    },
};

export const GenerateOTPSampleResponses: ISampleResponses = {
    [HttpStatus.OK]: {
        description: 'success',
        example: {
            'application/json': {
                meta: {
                    status: 200,
                    message: 'success',
                },
                data: {
                    id: 1,
                    phone: '+2348181484568',
                    createdAt: '2020-02-16T14:50:51.423Z',
                    updatedAt: '2020-02-16T20:31:35.111Z',
                },
            }
        }
    },
    [HttpStatus.BAD_REQUEST]: {
        description: 'bad request',
        example: {
            'application/json': {
                meta: {
                    status: 400,
                    message: [{
                        target: {
                            phone: '8181484568',
                        },
                        value: '8181484568',
                        property: 'phone',
                        children: [],
                        constraints: {
                            isPhoneNumber: 'phone must be a valid phone number'
                        },
                    }],
                },
                data: {},
            }
        }
    },
};

export const VerifyOTPSampleResponses: ISampleResponses = {
    [HttpStatus.OK]: {
        description: '',
        example: {
            'application/json': {
                meta: {
                    status: 200,
                    message: 'success'
                },
                data: {
                    new_user: true,
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisyMzQ4MTgxNDg0NTY4IiwiaWF0IjoxNTgxODc1NTE0LCJleHAiOjE1ODE4NzkxMTR9.UNLCvqWBzvfvCrZI7eDtZkvjPnIFARNYdVwaDKq05gA',
                },
            },
        },
    },
    [HttpStatus.BAD_REQUEST]: {
        description: '',
        example: {
            'application/json': {
                meta: {
                    status: 400,
                    message: 'Invalid OTP',
                },
                data: {},
            }
        }
    }
};

export const CreateUserSampleResponse: ISampleResponses = {
    [HttpStatus.CREATED]: {
        description: 'User registration successful',
        example: {
            'application/json': {
                meta: {
                    status: HttpStatus.CREATED,
                    message: 'successful',
                },
                data: {
                    user: {
                        fName: 'Kator',
                        mName: 'Bryan',
                        lName: 'James',
                        phone: '+2348181484568',
                        email: 'kator95@gmail.com',
                        id: 1,
                        createdAt: '2020-02-16T18:34:01.255Z',
                        updatedAt: '2020-02-16T18:34:01.255Z',
                    },
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImZOYW1lIjoiS2F0b3IiLCJsTmFtZSI6IkthdG9yIiwibU5hbWUiOiJCcnlhbiIsImVtYWlsIjoia2F0b3I5NUBnbWFpbC5jb20iLCJwaG9uZSI6IisyMzQ4MTgxNDg0NTY4In0sImlhdCI6MTU4MTg5MDU1OSwiZXhwIjoyNDgxODkwNTU5fQ.dXkK7JF2GDkw-XfO8m5JQofeN5uhzRojev871wH_6Yk',
                },
            },
        },
    },
    [HttpStatus.BAD_REQUEST]: {
        description: 'Bad request',
        example: {
            'application/json': {
                meta: {
                    status: HttpStatus.BAD_REQUEST,
                    message: [{
                        target: {
                            fName: '',
                            mName: 'mName',
                            lName: '',
                            phone: '+2348181484568',
                            email: 'kator95@gmail.com',
                        },
                        value: '',
                        property: 'fName',
                        children: [],
                        constraints: {
                            length: 'fName must be longer than or equal to 2 characters',
                        }
                    }, {
                        target: {
                            fName: '',
                            mName: 'mName',
                            lName: '',
                            phone: '+2348181484568',
                            email: 'kator95@gmail.com',
                        },
                        value: '',
                        property: 'lName',
                        children: [],
                        constraints: {
                            length: 'lName must be longer than or equal to 2 characters',
                        },
                    }],
                },
                data: {},
            }
        }
    },
    ...AllSampleResponses,
};
