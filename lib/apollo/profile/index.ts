import { useState, useCallback } from 'react';
import { gql } from '@apollo/client';
import { User } from '../../withAuth';
import { useToast } from '@chakra-ui/react';
import upLoadAllFile, { deleteFile, getPathFileFromLink } from '../../upLoadAllFile';

export interface UpdateProfile {
    fullname?: string;
    numberPhone?: string;
    province?: any;
    district?: any;
    ward?: any;
    avatar?: string;
}

export interface ErrorUpdateProfile {
    fullname: boolean;
    numberPhone: boolean;
    province: boolean;
    district: boolean;
    ward: boolean;
    avatar: boolean;
}

const checkCallNumber = (mobile: string) => {
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (mobile !== '') {
        if (vnf_regex.test(mobile) == false) {
            // alert('Số điện thoại của bạn không đúng định dạng!');
            return false;
        } else {
            // alert('Số điện thoại của bạn hợp lệ!');
            return true;
        }
    } else {
        // alert('Bạn chưa điền số điện thoại!');
        return false;
    }
};

function blobToFile(theBlob: Blob): File {
    const file = new File([theBlob], 'file');
    return file;
}

export const useSubmitProfile = (
    callback: (e: UpdateProfile) => Promise<any>,
    defaultVal: User
) => {
    const [dfValue] = useState(defaultVal);
    const toast = useToast();
    const [error, setError] = useState<ErrorUpdateProfile>({
        fullname: false,
        numberPhone: false,
        province: false,
        district: false,
        ward: false,
        avatar: false,
    });
    const [loading, setLoading] = useState(false);
    const submitUpdateProfile = useCallback(async (e: UpdateProfile) => {
        console.log(e);
        const errorSubmit = {
            fullname: false,
            numberPhone: false,
            province: false,
            district: false,
            ward: false,
            avatar: false,
        };
        let haveError = false;
        if (e.avatar == dfValue.avatar) {
            e.avatar = undefined;
        }
        if (!e.fullname || e.fullname == '' || e.fullname == dfValue.fullname) {
            e.fullname = undefined;
        }
        if (!e.numberPhone || e.numberPhone == dfValue.numberPhone) {
            e.numberPhone = undefined;
        } else {
            if (!checkCallNumber(e.numberPhone)) {
                errorSubmit.numberPhone = true;
                haveError = true;
            }
        }
        e.province = parseInt(e.province);
        e.district = parseInt(e.district);
        e.ward = parseInt(e.ward);

        if (isNaN(e.province) && isNaN(e.district) && isNaN(e.ward)) {
            e.province = undefined;
            e.district = undefined;
            e.ward = undefined;
        } else {
            if (isNaN(e.province)) {
                errorSubmit.province = true;
                haveError = true;
            }
            if (isNaN(e.district)) {
                errorSubmit.district = true;
                haveError = true;
            }
            if (isNaN(e.ward)) {
                errorSubmit.ward = true;
                haveError = true;
            }
            if (
                e.province == dfValue.province &&
                e.district == dfValue.district &&
                e.ward == dfValue.ward
            ) {
                e.province = undefined;
                e.district = undefined;
                e.ward = undefined;
            }
        }

        if (haveError) {
            setError(errorSubmit);
        } else {
            setLoading(true);
            try {
                if (e.avatar) {
                    try {
                        let blob = await (await fetch(e.avatar)).blob();
                        const newLink = await upLoadAllFile(
                            [
                                {
                                    file: blobToFile(blob),
                                },
                            ],
                            dfValue._id
                        );
                        if (newLink && typeof newLink[0] == 'string') {
                            e.avatar = newLink[0];
                        }
                        if (dfValue.avatar) {
                            const oldLink = getPathFileFromLink(dfValue.avatar);
                            deleteFile(oldLink);
                        }
                    } catch (error) {
                        toast({
                            title: `Tải ảnh lên thất bại`,
                            position: 'bottom-left',
                            status: 'error',
                            isClosable: true,
                        });
                        e.avatar = undefined;
                    }
                }
                callback(e);
                setLoading(false);
                toast({
                    title: `Cập nhật thành công`,
                    position: 'bottom-left',
                    status: 'success',
                    isClosable: true,
                });
            } catch (error) {
                setLoading(false);
                toast({
                    title: `Server timeout`,
                    position: 'bottom-left',
                    status: 'error',
                    isClosable: true,
                });
            }
        }

        console.log('after validate', e);
    }, []);
    return {
        submitUpdateProfile,
        error,
        setError,
        loading,
    };
};
export const updateProfile = {
    command: gql`
        mutation UpdateUser($updateInfo: UserUpdateInput!) {
            updateUser(updateInfo: $updateInfo) {
                email
                fullname
                numberPhone
                provinceName
                districtName
                wardName
            }
        }
    `,
    variables: (updateInfo: UpdateProfile) => ({
        updateInfo,
    }),
};

export const getUserById = {
    command: gql`
        query GetUserById($getUserByIdId: ID!, $page: Int, $limit: Int) {
            getUserById(id: $getUserByIdId) {
                _id
                email
                fullname
                avatar
                userType
                province
                district
                ward
                provinceName
                districtName
                wardName
                numberPhone
                listHomes(page: $page, limit: $limit) {
                    docs {
                        _id
                        province
                        district
                        ward
                        provinceName
                        districtName
                        wardName
                        liveWithOwner
                        electricityPrice
                        waterPrice
                        images
                        totalRooms
                        internetPrice
                        cleaningPrice
                        totalRooms
                        title
                        position {
                            lng
                            lat
                        }
                    }
                    paginator {
                        limit
                        page
                        nextPage
                        prevPage
                        totalPages
                        pagingCounter
                        hasPrevPage
                        hasNextPage
                        totalDocs
                    }
                }
            }
        }
    `,
    variables: (userId: string, page?: string | number, limit?: number) => {
        page ??= 1;
        if (typeof page == 'string') {
            page = parseInt(page);
            if (isNaN(page)) {
                page = 1;
            }
        }
        limit ??= 12;
        return {
            getUserByIdId: userId,
            page,
            limit,
        };
    },
};

export * from './saveRoom';
