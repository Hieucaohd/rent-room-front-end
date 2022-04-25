import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import React, { memo } from 'react';
import client from '../../lib/apollo/apollo-client';
import getRoomById, { RoomData } from '../../lib/apollo/home/room/getroombyid';

export interface ZoomData {}

export interface RoomPageProps {
    roomData: RoomData;
    roomId: string;
    isHomeOfUser: boolean
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const req = context.req;
    const cookie = req.cookies;
    console.log(cookie)
    let user: { _id: string } | null = null;
    const { roomid: roomId } = context.query
    if (roomId) {
        try {
            const { data } = await client.query({
                query: gql`
                    query User {
                        profile {
                            user {
                                _id
                            }
                        }
                    }
                `,
            })
            user = data?.profile?.user
        } catch (error) {
            console.log(error)
        }
        
        const { data: data2 } = await client.query({
            query: getRoomById.command,
            variables: getRoomById.variables(roomId.toString())
        })
        const roomData = data2.getRoomById
        return {
            props: {
                roomData,
                roomId: roomId.toString(),
                isHomeOfUser: user
            },
        };
    } else {
        return {
            props: {}
        }
    }
    
};

function Room({ roomData, roomId, isHomeOfUser }: RoomPageProps) {
    console.log('user', isHomeOfUser)
    return (
        <div className="zoompage-base">
            {isHomeOfUser && <div
                style={{
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                //@ts-ignore
            >{isHomeOfUser?._id}</div>}
            <div className="homepage-about">
                <div>
                    <div></div>
                    <div className="homepage-about__authority">
                        <h1>Theo dõi chúng tôi</h1>
                        <div>
                            <i className="fi fi-brands-facebook"></i>Facebook
                        </div>
                        <div>
                            <i className="fi fi-brands-instagram"></i>Instagram
                        </div>
                        <div>
                            <i className="fi fi-brands-twitter"></i>Twitter
                        </div>
                    </div>
                    <div className="homepage-about__developer">
                        <h1>Developer</h1>
                        <div>Cao Trung Hiếu</div>
                        <div>Nguyễn Quốc Đại</div>
                        <div>Nguyễn Khắc Hiệp</div>
                        <div>Bùi Tuấn Anh</div>
                        <div>Nguyễn Thế Anh</div>
                    </div>
                </div>
                <hr />
                <div className="homepage-about__footer">
                    <div>
                        <Link href="/">
                            <a className="app-logo">
                                <span>Rent </span> <span>Room</span>
                            </a>
                        </Link>
                    </div>
                    <div>
                        © 2022 Website hỗ trợ tìm kiếm phòng trọ, giúp bạn tìm kiếm sự tiện nghi
                        ngay tại nhà
                    </div>
                </div>
            </div>
        </div>
    );
}


export default memo(Room)