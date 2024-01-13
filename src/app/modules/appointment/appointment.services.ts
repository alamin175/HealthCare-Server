import { Appointment } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IAuthUser } from '../../../interfaces/common';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

// const getAllFromDB = async (
//     filters: IAdminFilterRequest,
//     options: IPaginationOptions,
// ): Promise<IGenericResponse<Admin[]>> => {
//     const { limit, page, skip } = paginationHelpers.calculatePagination(options);
//     const { searchTerm, ...filterData } = filters;

//     const andConditions = [];

//     if (searchTerm) {
//         andConditions.push({
//             OR: adminSearchableFields.map(field => ({
//                 [field]: {
//                     contains: searchTerm,
//                     mode: 'insensitive',
//                 },
//             })),
//         });
//     }

//     if (Object.keys(filterData).length > 0) {
//         andConditions.push({
//             AND: Object.keys(filterData).map(key => {
//                 return {
//                     [key]: {
//                         equals: (filterData as any)[key],
//                     },
//                 };
//             }),
//         });
//     }
//     andConditions.push({
//         isDeleted: false,
//     });

//     const whereConditions: Prisma.AdminWhereInput =
//         andConditions.length > 0 ? { AND: andConditions } : {};

//     const result = await prisma.admin.findMany({
//         where: whereConditions,
//         skip,
//         take: limit,
//         orderBy:
//             options.sortBy && options.sortOrder
//                 ? { [options.sortBy]: options.sortOrder }
//                 : {
//                     createdAt: 'desc',
//                 },
//     });
//     const total = await prisma.admin.count({
//         where: whereConditions,
//     });

//     return {
//         meta: {
//             total,
//             page,
//             limit,
//         },
//         data: result,
//     };
// };

// const getByIdFromDB = async (id: string): Promise<Admin | null> => {
//     const result = await prisma.admin.findUnique({
//         where: {
//             id,
//             isDeleted: false,
//         },
//     });
//     return result;
// };

// const updateIntoDB = async (
//     id: string,
//     payload: Partial<Admin>,
// ): Promise<Admin | null> => {
//     const admin = await prisma.admin.findUnique({
//         where: {
//             id,
//             isDeleted: false,
//         },
//     });
//     if (!admin) {
//         throw new ApiError(httpStatus.NOT_FOUND, 'This admin does not exist');
//     }
//     const result = await prisma.admin.update({
//         where: {
//             id,
//             isDeleted: false,
//         },
//         data: payload,
//     });
//     return result;
// };

// const deleteFromDB = async (id: string): Promise<Admin> => {
//     return await prisma.$transaction(async transactionClient => {
//         const deletedAdmin = await transactionClient.admin.delete({
//             where: {
//                 id,
//             },
//         });

//         await transactionClient.user.delete({
//             where: {
//                 email: deletedAdmin.email,
//             },
//         });

//         return deletedAdmin;
//     });
// };

// const softDelete = async (id: string): Promise<Admin> => {
//     return await prisma.$transaction(async transactionClient => {
//         const deletedAdmin = await transactionClient.admin.update({
//             where: { id },
//             data: {
//                 isDeleted: true,
//             },
//         });

//         await transactionClient.user.update({
//             where: {
//                 email: deletedAdmin.email,
//             },
//             data: {
//                 status: UserStatus.DELETED,
//             },
//         });

//         return deletedAdmin;
//     });
// };

const createAppointment = async (data: Partial<Appointment>, authUser: IAuthUser) => {
    const { doctorId, doctorScheduleId } = data;
    const isDoctorExists = await prisma.doctor.findFirstOrThrow({
        where: {
            id: doctorId
        }
    });

    if (!isDoctorExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Doctor doesn't exists!")
    };

    const isPatientExists = await prisma.patient.findFirstOrThrow({
        where: {
            email: authUser?.email
        }
    });

    if (!isPatientExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Patient doesn't exists!")
    };

    const videoCallingId: string = uuidv4()

    const result = await prisma.appointment.create({
        data: {
            patientId: isPatientExists.id,
            doctorId: isDoctorExists.id,
            doctorScheduleId: "VIDEO CALLING ID",
            videoCallingId
        }
    })

    return result;
};

export const AppointmentServices = {
    createAppointment
};
