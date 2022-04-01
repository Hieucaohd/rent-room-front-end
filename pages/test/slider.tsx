import * as React from 'react';
import Slider from '../../components/Slider';

export interface IAppProps {
}

export default function App (props: IAppProps) {
  return (
    <div>
      <Slider images={["https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2021/11/14/973752/Tzuyu-TWICE.jpg", "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2021/11/14/973752/Tzuyu-TWICE.jpg", "https://i.bloganchoi.com/bloganchoi.com/wp-content/uploads/2020/10/meme-hai-huoc-moi-nhat-141.jpg?fit=400%2C20000&quality=95&ssl=1"]} width={200} height={300}/>
    </div>
  );
}
