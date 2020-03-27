import HttpStatus from 'http-status';

interface ISampleResponses {
    [status: number]: {
        description: string,
        example: {
            meta: {
                status: number,
                message?: any,
                error?: string,
            },
            data: any
        },
    };
}

const AllRequests: ISampleResponses = {
    [HttpStatus.UNAUTHORIZED]: {
        description: 'unauthorized, missing/wrong jwt token',
        example: {
            meta: {
                status: HttpStatus.UNAUTHORIZED,
                message: 'Invalid token',
                error: 'Invalid token',
            },
            data: {},
        }
    },
};

const GenerateOTP: ISampleResponses = {
    [HttpStatus.CREATED]: {
        description: 'success',
        example: {
            meta: {
                status: HttpStatus.CREATED,
                message: 'success',
            },
            data: {
                id: 1,
                phone: '+2348181484568',
                createdAt: '2020-02-16T14:50:51.423Z',
                updatedAt: '2020-02-16T20:31:35.111Z',
            },
        },
    },
    [HttpStatus.BAD_REQUEST]: {
        description: 'bad request',
        example: {
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
        },
    },
};

const VerifyOTP: ISampleResponses = {
    [HttpStatus.OK]: {
        description: '',
        example: {
            meta: {
                status: HttpStatus.OK,
                message: 'success'
            },
            data: {
                new_user: true,
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisyMzQ4MTgxNDg0NTY4IiwiaWF0IjoxNTgxODc1NTE0LCJleHAiOjE1ODE4NzkxMTR9.UNLCvqWBzvfvCrZI7eDtZkvjPnIFARNYdVwaDKq05gA',
            },
        },
    },
    [HttpStatus.BAD_REQUEST]: {
        description: '',
        example: {
            meta: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Invalid OTP',
            },
            data: {},
        },
    },
};

const CreateUser: ISampleResponses = {
    [HttpStatus.CREATED]: {
        description: 'User registration successful',
        example: {
            meta: {
                status: HttpStatus.CREATED,
                message: 'successful',
            },
            data: {
                user: {
                    id: 1,
                    fName: 'Kator',
                    mName: 'Bryan',
                    lName: 'James',
                    phone: '+2348181484568',
                    email: 'kator95@gmail.com',
                    createdAt: '2020-02-16T18:34:01.255Z',
                    updatedAt: '2020-02-16T18:34:01.255Z',
                },
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImZOYW1lIjoiS2F0b3IiLCJsTmFtZSI6IkthdG9yIiwibU5hbWUiOiJCcnlhbiIsImVtYWlsIjoia2F0b3I5NUBnbWFpbC5jb20iLCJwaG9uZSI6IisyMzQ4MTgxNDg0NTY4In0sImlhdCI6MTU4MTg5MDU1OSwiZXhwIjoyNDgxODkwNTU5fQ.dXkK7JF2GDkw-XfO8m5JQofeN5uhzRojev871wH_6Yk',
            },
        },
    },
    [HttpStatus.BAD_REQUEST]: {
        description: 'Bad request',
        example: {
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
        },
    },
    ...AllRequests,
};

const GetGroupMembers: ISampleResponses = {
    [HttpStatus.OK]: {
        description: 'Get group members successfully',
        example: {
            meta: {
                status: HttpStatus.OK,
            },
            data:  [{
                id: 6,
                memberId: 2,
                groupId: 6,
                approved: true,
                role: 'admin',
                createdAt: '2020-03-27T10:29:30.879Z',
                updatedAt: '2020-03-27T10:29:30.879Z',
            }]
        }
    },
    ...AllRequests,
};

export const SampleResponses = {
    AllRequests,
    GenerateOTP,
    VerifyOTP,
    CreateUser,
    GetGroupMembers,
};
