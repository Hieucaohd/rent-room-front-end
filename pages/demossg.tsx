import * as React from 'react';

export interface Post {
    id: number,
    user_id: number,
    title: string,
    body: string
}

export interface IDemoSSGProps {
    posts: Post[]
}

export default function DemoSSG({posts}: IDemoSSGProps) {
    
    return <div>
        {posts.map((post:Post, index: number) => (
            <div key={index}>Title: {post.title} body: {post.body}</div>
        ))}
    </div>;
}

export async function getStaticProps() {
    const res = await fetch('https://gorest.co.in/public/v2/users/100/posts');
    const posts = await res.json();
    return {
        props: {
            posts
        },
    };
}
