<a href="https://timphongtro.vercel.app/">DEMO</a>

## First, run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Công nghệ sử dụng: 
    Framework: NextJs
    State Management: Zustand
    Style: Chakra UI, Framer Motion, Sass
    Data Fetching: Apollo Client

## Tổ chức thư mục:
    ├─ pages: chứa các page của web
        └─ index.tsx: trang chủ
        └─ signin.tsx: đăng nhập
        └─ signup.tsx: đăng kí
        ├─ home
            └─ [homeid].tsx: thông tin từng trọ theo homeid
        ├─ room
            └─ [roomid].tsx: thông tin từng phòng theo roomid
        ├─ user
            └─ [id].tsx: trang cá nhân của người dùng theo id
            ├─ yourprofile
                └─ index.tsx: trang cá nhân của người dùng hiện tại
        ├─ search
            └─ index.tsx: tìm kiếm phòng trọ theo bộ lọc
        ├─ forgot
            └─ index.tsx: lấy lại mật khẩu
        ├─ api: một số api đơn giản
    ├─ components: chứa components dùng chung giữa các pages
    ├─ lib: chứa các xử lí logic của component
    ├─ public: chứa logo, ảnh, style, ...
    ├─ styles: chứa style của các component
